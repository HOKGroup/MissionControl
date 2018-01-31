/**
 * Created by konrad.sobon on 2018-01-09.
 */
angular.module('MissionControlApp').controller('VrController', VrController);

function VrController($routeParams, VrFactory, ProjectFactory, dragulaService, $timeout, $scope, $uibModal, UtilityService){
    var vm = this;
    vm.projectId = $routeParams.projectId;
    vm.selectedProject = null;
    vm.popoverOptions = {
        placement: 'top',
        triggers: 'click, outsideClick',
        templateUrl: 'editName.html'
    };
    vm.editingBucket = false;
    vm.buckets = [];
    vm.images = [];
    vm.status = {
        code: null,
        message: ''
    };
    vm.trimbleProject = null;
    vm.trimbleImagesId = '';
    vm.trimbleBucketsId = '';

    // (Konrad) Retrieves selected project from MongoDB.
    getSelectedProject(vm.projectId);

    /**
     * Used to retrieve the Mission Control Project info.
     * @param projectId
     */
    function getSelectedProject(projectId) {
        ProjectFactory.getProjectById(projectId)
            .then(function(response){
                if(!response || response.status !== 200){
                    vm.status = {
                        code: 'danger',
                        message: 'Failed to retrieve project from Mission Control server. Try refreshing the page.'
                    };
                    return;
                }

                vm.selectedProject = response.data;
                return VrFactory.getProject(vm.selectedProject.number + ' ' + vm.selectedProject.name)
            })
            .then(function (response) {
                if(!response || (response.status !== 200 && response.status !== 204)){
                    changeStatus({
                        code: 'danger',
                        message: 'Failed to retrieve Trimble Connect project. Please reload the page and try again.'
                    });
                    return;
                }

                if (response.status === 200) {
                    vm.trimbleProject = response.data;
                    return VrFactory.getFolderItems(vm.trimbleProject.rootId);
                }

                if (response.status === 204) {
                    // (Konrad) Request was successful but no projects were found in Trimble.
                    // Let's make another request to create a new project in Trimble Connect.
                    return VrFactory.createProject(vm.selectedProject.number + " " + vm.selectedProject.name)
                        .then(function (response) {
                            if(!response || response.status !== 200){
                                vm.status = {
                                    code: 'danger',
                                    message: 'Failed while creating new Trimble Connect project. Try reloading the page.'
                                };
                                return;
                            }

                            vm.trimbleProject = response.data;
                            return VrFactory.addUser(vm.trimbleProject.id);
                        })
                        .then(function (response) {
                            // (Konrad) Project was created and user was added.
                            // Since this is a new project we need to also add the images folder.
                            return VrFactory.addFolder({name: "Images", rootId: vm.trimbleProject.rootId});
                        })
                        .then(function(response){
                            // Since this is a new project we need to also add the buckets folder.
                            return VrFactory.addFolder({name: "Buckets", rootId: vm.trimbleProject.rootId});
                        })
                        .then(function (response) {
                            return VrFactory.getFolderItems(vm.trimbleProject.rootId);
                        })
                        .catch(function (err) {
                            changeStatus({
                                code: 'danger',
                                message: 'Failed to create Trimble Connect project. Please reload the page and try again.'
                            });
                            console.log(err);
                        });
                }
            })
            .then(function (response) {
                if(!response || response.status !== 200){
                    changeStatus({
                        code: 'danger',
                        message: 'Failed to create Trimble Connect project. Please reload the page and try again.'
                    });
                    return;
                }
                // (Konrad) no matter what happens above the response here should be
                // either newly created folders or retrieved folders (Images,Buckets)
                vm.trimbleBucketsId = response.data.filter(function (item){
                    return item.name === "Buckets";
                })[0].id;
                vm.trimbleImagesId = response.data.filter(function (item) {
                    return item.name === "Images";
                })[0].id;

                return VrFactory.getFolderItems(vm.trimbleImagesId);
            })
            .then(function (response) {
                if(!response || response.status !== 200){
                    changeStatus({
                        code: 'danger',
                        message: 'Failed to retrieve images from Trimble Connect. Try reloading the page.'
                    });
                    return;
                }

                if(response.data.length > 0){
                    response.data.forEach(function (item) {
                        var image = {
                            file: null,
                            data: null,
                            dataSize: null,
                            displayName: 'Image Name',
                            description: 'Image Description',
                            versionId: item.versionId,
                            projectId: item.projectId,
                            parentId: item.parentId,
                            id: item.id,
                            name: item.name,
                            commentId: ''
                        };

                        // (Konrad) We push the skeleton version of the image to vm.images
                        // here so that we can use the "loading.gif" while the images are downloaded.
                        vm.images.push(image);

                        var data = {
                            objectId: item.id,
                            objectType: 'FILE'
                        };

                        VrFactory.getComments(data)
                            .then(function (response) {
                                if(!response || response.status !== 200){
                                    changeStatus({
                                        code: 'danger',
                                        message: 'Failed to retrieve image Display Name and Description. Reload the page and try again.'
                                    });
                                    return;
                                }

                                if(response.data.length > 0){
                                    response.data.forEach(function (comment) {
                                        if(!comment.description.startsWith('{"description":')) return;

                                        var content = JSON.parse(comment.description);
                                        image.displayName = content.displayName;
                                        image.description = content.description;
                                        image.commentId = comment.id
                                    })
                                }
                            })
                            .catch(function (err) {
                                changeStatus({
                                    code: 'danger',
                                    message: 'Failed to retrieve image Display Name and Description. Reload the page and try again.'
                                });
                                console.log(err);
                            })
                    });
                }

                return VrFactory.getFolderItems(vm.trimbleBucketsId);
            })
            .then(function (response) {
                if(!response || response.status !== 200){
                    changeStatus({
                        code: 'danger',
                        message: 'Failed to retrieve buckets from Trimble Connect. Try reloading the page.'
                    });
                    return;
                }

                if(response.data.length > 0){
                    response.data.forEach(function (item) {
                        if(item.type !== 'FOLDER') return;

                        var bucket = {
                            name: item.name,
                            images: [],
                            sharableLink: null,
                            sharedWith: [],
                            id: item.id,
                            parentId: item.parentId,
                            projectId: item.projectId,
                            editingBucket: false,
                            position: null,
                            commentId: ''
                        };

                        vm.buckets.push(bucket);

                        var data = {
                            objectId: item.id,
                            objectType: 'FOLDER'
                        };

                        VrFactory.getComments(data)
                            .then(function (response) {
                                if(!response || response.status !== 200){
                                    changeStatus({
                                        code: 'danger',
                                        message: 'Failed to retrieve Bucket Position. Please reload the page and try again.'
                                    });
                                    return;
                                }

                                if(response.data.length > 0){
                                    response.data.forEach(function (comment) {
                                        if(!comment.description.startsWith('{"position":')) return;

                                        var content = JSON.parse(comment.description);
                                        bucket.position = content.position;
                                        bucket.commentId = comment.id;

                                        // (Konrad) We need to re-sort the vm.buckets to match our specified order.
                                        vm.buckets.sort(UtilityService.compareValues('position', 'asc'));
                                    })
                                }
                            })
                            .catch(function (err) {
                                changeStatus({
                                    code: 'danger',
                                    message: 'Failed to retrieve Bucket Position. Please reload the page and try again.'
                                });
                                console.log(err);
                            });
                    });
                }
            })
            .catch(function (err) {
                vm.status = {
                    code: 'danger',
                    message: 'Failed to connect to Trimble server. Try reloading the page.'
                };
                console.log(err.message);
            });
    }

    // $scope.$on('image_bag.remove-model', function (el, container, source) {
    //     // var deletedId = container[0].id;
    //     // console.log("deletedId:" + deletedId);
    // });
    //
    // $scope.$on('image_bag.drop-model', function (el, target, source, sibling) {
    //     // var addedId = source.context.children()[0].id;
    //     // console.log("addedId:" + addedId);
    // });

    /**
     * Options for the dragula bags
     */
    dragulaService.options($scope, 'image_bag', {
        removeOnSpill: true, // removes the object when dragged outside of box
        copy: function (el, source) {
            return source.id.match('#images') //we only allow copy from "images" into "buckets"
        },
        moves: function (el, source, handle, sibling) {
            return handle.className === 'handle glyphicon glyphicon-move'; //only drag elements with this class
        },
        accepts: function (el, target, source, sibling) {
            return source.id === '#images' && target.id === '#bucket'; // only allow images from "images to be dragged into buckets"
        }
    });

    /**
     * Adds new bucket. Posts it to Trimble Connect.
     */
    vm.addBucket = function(){
        var bucket = {
            name: "Bucket " + (vm.buckets.length + 1),
            images: [],
            sharableLink: null,
            sharedWith: [],
            id: '',
            parentId: '',
            projectId: '',
            editingBucket: false,
            position: vm.buckets.length,
            commentId: ''
        };

        vm.buckets.push(bucket);

        var data = {
            name: bucket.name,
            rootId: vm.trimbleBucketsId
        };
        VrFactory.createFolder(data)
            .then(function(response){
                if(!response || response.status !== 201){
                    // (Konrad) Since we insert the bucket into the collection
                    // immediately for the purpose of having a responsive UI
                    // we need to remove it when request fails.
                    var idx = vm.buckets.indexOf(bucket);
                    vm.buckets.splice(idx, 1);

                    changeStatus({
                        code: 'danger',
                        message: 'Failed to create a new Bucket in Trimble Connect. Please reload the page and try again.'
                    });
                    return;
                }

                bucket.id = response.data.id;
                bucket.parentId = response.data.parentId;
                bucket.projectId = response.data.projectId;

                // (Konrad) Since Trimble Connect doesn't support adding custom metadata
                // to images, we can use Comments to add description and display name.
                var data = {
                    'objectId': bucket.id,
                    'objectType': 'FOLDER',
                    'description': '{"position": ' + bucket.position + '}'
                };

                return VrFactory.addComment(data)
            })
            .then(function (response) {
                if(!response || response.status !== 201){
                    changeStatus({
                        code: 'danger',
                        message: 'Failed to set bucket position. Please reload the page and try again.'
                    });
                    return;
                }

                bucket.commentId = response.data.id;
            })
            .catch(function (err) {
                changeStatus({
                    code: 'danger',
                    message: 'Failed to create new Bucket. Please reload the page and try again.'
                });
                console.log(err);
        });
    };

    /**
     * Deletes selected bucket from Trimble Connect.
     * @param bucket
     */
    vm.deleteBucket = function (bucket) {
        var idx = vm.buckets.indexOf(bucket);
        vm.buckets.splice(idx, 1);

        VrFactory.deleteFolder(bucket.id)
            .then(function (response) {
                if(!response || response.status !== 204){
                    changeStatus({
                        code: 'danger',
                        message: 'Failed to delete Bucket. Reload the page and try again.'
                    });
                }
            })
            .catch(function (err) {
                changeStatus({
                    code: 'danger',
                    message: 'Failed to delete Bucket. Reload the page and try again.'
                });
                console.log(err);
            })
    };

    /**
     * Moves bucket panel up.
     * @param index
     * @param arr
     */
    vm.moveUp = function (index, arr) {
        UtilityService.move(arr, index, index-1);

        // (Konrad) Moving one bucket up, moves majority of the other ones down.
        // We have to update all of the other bucket's positions.
        vm.buckets.forEach(function (bucket, index) {
            bucket.position = index;
            var data = {
                commentId: bucket.commentId,
                description: '{"position": ' + bucket.position + '}'
            };

            VrFactory.updateComment(data)
                .then(function (response) {
                    if(!response || response.status !== 200){
                        changeStatus({
                            code: 'danger',
                            message: 'Failed to update Bucket Position. Please reload the page and try again.'
                        });
                    }
                })
                .catch(function (err) {
                    changeStatus({
                        code: 'danger',
                        message: 'Failed to update Bucket Position. Please reload the page and try again.'
                    });
                    console.log(err);
                });
        });
    };

    /**
     * Moves bucket panel down.
     * @param index
     * @param arr
     */
    vm.moveDown = function (index, arr) {
        UtilityService.move(arr, index, index+1);

        // (Konrad) Moving one bucket up, moves majority of the other ones down.
        // We have to update all of the other bucket's positions.
        vm.buckets.forEach(function (bucket, index) {
            bucket.position = index;
            var data = {
                commentId: bucket.commentId,
                description: '{"position": ' + bucket.position + '}'
            };

            VrFactory.updateComment(data)
                .then(function (response) {
                    if(!response || response.status !== 200){
                        changeStatus({
                            code: 'danger',
                            message: 'Failed to update Bucket Position. Please reload the page and try again.'
                        });
                    }
                })
                .catch(function (err) {
                    changeStatus({
                        code: 'danger',
                        message: 'Failed to update Bucket Position. Please reload the page and try again.'
                    });
                    console.log(err);
                });
        });
    };

    /**
     * Checks if bucket can be moved up.
     * @param index
     * @returns {boolean}
     */
    vm.showUpArrow = function (index) {
        return index > 0;
    };

    /**
     * Checks if bucket can be moved down.
     * @param index
     * @returns {boolean}
     */
    vm.showDownArrow = function (index) {
        return index < vm.buckets.length - 1;
    };

    /**
     * Watches Images collection for changes.
     */
    $scope.$watchCollection('vm.images', function (newValue, oldValue, scope) {
        if(newValue.length > oldValue.length){
            // (Konrad) User added the file to Images
            // We should add it to the Trimble server.
            var newFiles = newValue.diff(oldValue);
            if(newFiles[0].id){
                // (Konrad) New file has an id assigned. This means that the file is coming from Trimble Connect.
                // If that's the case the $watchCollection would not pick up each file separately but rather all at once.
                newFiles.forEach(function (item) {
                    VrFactory.downloadFile(item.id)
                        .then(function (response) {
                            if(!response || response.status !== 200){
                                changeStatus({
                                    code: 'danger',
                                    message: 'Failed to download image ' + item.name + ' from Trimble Connect. Reload the page and try again.'
                                });
                                return;
                            }

                            item.data = UtilityService.arrayBufferToBase64(response.data);
                        })
                        .catch(function (err) {
                            changeStatus({
                                code: 'danger',
                                message: 'Failed to download image ' + item.name + ' from Trimble Connect. Reload the page and try again.'
                            });
                            console.log(err);
                        });
                })
            } else {
                // (Konrad) If we are uploading files then $watchCollection will trigger for every image.
                // We can just grab the first item from the diff to get the new image.
                var newFile = newValue.diff(oldValue)[0];
                var data = {
                    file: newFile.file,
                    parentId: vm.trimbleImagesId
                };
                VrFactory.uploadFile(data)
                    .then(function (response) {
                        if(!response || response.status !== 201){
                            var index = vm.images.findIndex(function (item) {
                                return item === newFile;
                            });
                            if(index !== -1) vm.images.splice(index, 1);

                            changeStatus({
                                code: 'danger',
                                message: 'Could not upload the file to Trimble. Reload the page and try again.'
                            });
                            return;
                        }

                        var createdFile = response.data[0];
                        newFile.versionId = createdFile.versionId;
                        newFile.parentId = createdFile.parentId;
                        newFile.projectId = createdFile.projectId;
                        newFile.id = createdFile.id;
                        newFile.name = createdFile.name;

                        // (Konrad) Since Trimble Connect doesn't support adding custom metadata
                        // to images, we can use Comments to add description and display name.
                        var data = {
                            'objectId': newFile.id,
                            'objectType': 'FILE',
                            'description': '{"description": "' + newFile.description + '", "displayName": "' + newFile.displayName + '"}'
                        };

                        return VrFactory.addComment(data)
                    })
                    .then(function (response){
                        if(!response || response.status !== 201){
                            changeStatus({
                                code: 'danger',
                                message: 'Failed to set image Description and Display Name. Reload the page and try again.'
                            });
                            return;
                        }

                        newFile.commentId = response.data.id;
                    })
                    .catch(function (err) {
                        changeStatus({
                            code: 'danger',
                            message: 'Could not upload the file to Trimble. Reload the page and try again.'
                        });
                        console.log(err);
                    })
            }
        } else if(newValue.length < oldValue.length){
            // var deletedFile = oldValue.diff(newValue)[0];
        }
    });

    /**
     * Changes the status message on top of the page with a delay.
     * @param status
     */
    var changeStatus = function (status) {
        vm.status = null;
        $timeout(function(){
            vm.status = status}, 1000);
    };

    /**
     * Watches buckets collections for changes.
     */
    $scope.$watch('vm.buckets', function (newValue, oldValue, scope) {
        // (Konrad) Since we are deep watchingg this collection
        // any changes to the sub-arrays will trigger this
        // We can use that to prevent duplicates from being added to bucket.
        if(newValue.length === oldValue.length){
            if(newValue.length === 0 && oldValue.length === 0) return;
            vm.buckets.forEach(function(bucket){
                var count = bucket.images.length;
                bucket.images = UtilityService.removeDuplicates(bucket.images, 'id');
                if(count > bucket.images.length){
                    changeStatus({
                        code: 'warning',
                        message: 'Image already exists in this bucket. It cannot be added twice.'
                    });
                }
            });
        }
        if(newValue.length > oldValue.length){
            //TODO: Do we need this? Buckets get added by button and we have a method for that above.
        } else if(newValue.length < oldValue.length){
            //TODO: Remove bucket from DB
            // console.log("Bucket removed: " + oldValue.diff(newValue)[0].name);
        }
    }, true);

    /**
     * Shows modal window for input of image properties.
     * @param size
     * @param image
     */
    vm.editImage = function (size, image) {
        $uibModal.open({
            animation: true,
            templateUrl: 'angular-app/vr/edit-image.html',
            controller: 'EditImageController as vm',
            size: size,
            resolve: {
                image: function (){
                    return image;
                }}
        }).result.then(function(request){
            if(!request) return;

            // (Konrad) Since Trimble Connect doesn't support adding custom metadata
            // to images, we can use Comments to add description and display name.
            var data = {
                commentId: image.commentId,
                description: '{"description": "' + image.description + '", "displayName": "' + image.displayName + '"}'
            };

            VrFactory.updateComment(data)
                .then(function (response) {
                    if(!response || response.status !== 200){
                        changeStatus({
                            code: 'danger',
                            message: 'Failed to update image Description and Display Name. Reload the page and try again.'
                        });
                        return;
                    }

                    console.log(response);
                })
                .catch(function (err) {
                    changeStatus({
                        code: 'danger',
                        message: 'Failed to update image Description and Display Name. Reload the page and try again.'
                    });
                    console.log(err);
                });

            if(vm.buckets.length === 0) return;

            // (Konrad) Since dragula makes a copy of the image, when it's moved to
            // a bucket, we need to track them down and update if name/desc changed.
            vm.buckets.forEach(function (bucket) {
                bucket.images.forEach(function (image) {
                    if(image.id === request.response.id){
                        image.displayName = request.response.displayName;
                        image.description = request.response.description;
                    }
                });
            });

        }).catch(function(){
            console.log("All Tasks Dialog dismissed...");
        });
    };

    /**
     * Fires when bucket name change is approved by using the "OK" button.
     * @param bucket
     */
    vm.changeBucketName = function (bucket) {
        bucket.editingBucket = false;
        var data = {
            name: bucket.name,
            folderId: bucket.id
        };

        renameFolder(data);
    };

    /**
     * Catches keyboard Enter key when user finishes editing bucket name.
     * @param bucket
     * @param event
     */
    vm.onEnter = function (bucket, event) {
        if(event.which !== 13) return;

        bucket.editingBucket = false;
        var data = {
            name: bucket.name,
            folderId: bucket.id
        };

        renameFolder(data);
    };

    /**
     * Utility method that renames bucket/folder in Trimble.
     * @param data
     */
    function renameFolder(data){
        VrFactory.renameFolder(data)
            .then(function (response) {
                if(!response || response.status !== 200){
                    changeStatus({
                        code: 'danger',
                        message: 'Failed to rename bucket. Reload the page and try again.'
                    });
                }
            })
            .catch(function (err) {
                changeStatus({
                    code: 'danger',
                    message: 'Failed to rename bucket. Reload the page and try again.'
                });
                console.log(err);
            })
    }

    /**
     * Removes selected image from bucket only.
     * @param file
     * @param bucket
     */
    vm.deleteFromBucket = function (file, bucket) {
        var index = bucket.images.findIndex(function (image) {
            return image.id.toString() === file.id.toString();
        });
        if(index !== -1) bucket.images.splice(index, 1);
    };

    /**
     * Removes selected image from Images and ALL buckets.
     * @param file
     */
    vm.deleteFromImages = function (file) {
        var index = vm.images.findIndex(function (item) {
            return item.id === file.id;
        });
        if(index !== -1) vm.images.splice(index, 1);

        // (Konrad) User deleted the file from Images
        // We should remove it from the Trimble server.
        VrFactory.deleteFile(file.id)
            .then(function (response) {
                if(!response || response.status !== 204){
                    vm.images.push(file);
                    changeStatus({
                        code: 'danger',
                        message: 'Failed to delete the image ' + file.name + ' . Please reload the page and try again.'
                    });
                }
            })
            .catch(function (err) {
                changeStatus({
                    code: 'danger',
                    message: 'Failed to delete the image. There was an error connecting to Trimble. Try reloading the page.'
                });
                console.log(err);
        });

        //TODO: We need to delete it from other folders as well.
        vm.buckets.forEach(function (bucket) {
            var index2 = bucket.images.findIndex(function (image) {
                return image.id === file.id;
            });
            if(index2 !== -1) bucket.images.splice(index2, 1);
        });
    };
}