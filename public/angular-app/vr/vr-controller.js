/**
 * Created by konrad.sobon on 2018-01-09.
 */
angular.module('MissionControlApp').controller('VrController', VrController);

function VrController($routeParams, VrFactory, ProjectFactory, dragulaService, $base64, $timeout, $scope, $uibModal, UtilityService){
    var vm = this;

    vm.projectId = $routeParams.projectId;
    vm.selectedProject = null;
    vm.editingBucket = false;
    vm.buckets = [];
    $scope.buckets = vm.buckets;
    vm.images = [];
    vm.status = {
        code: null,
        message: ''
    };
    vm.trimbleProject = null;
    vm.trimbleImagesId = '';
    vm.trimbleBucketsId = '';

    // (Konrad) We are using $watchCollection to watch additions
    // and deletions from bucket.images. When user attempts to add
    // a duplicate image to the same bucket it will be removed. That
    // in turn triggers another $watchCollection event. This variable
    // gets toggled to prevent $watchCollection from processing "removed"
    // event when duplicate image is removed.
    vm.deletedDuplicate = false;

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
     * Options for the dragula bags behavior.
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
                    vm.trimbleProject = response.project;

                    changeStatus({
                        code: 'info',
                        message: 'Trimble Connect project found.'
                    });

                    return VrFactory.getFolderItems(vm.trimbleProject.rootId);
                }

                if (response.status === 204) {
                    changeStatus({
                        code: 'info',
                        message: 'Trimble Connect project not found. Creating new one.'
                    });

                    // (Konrad) Request was successful but no projects were found in Trimble.
                    // Let's make another request to create a new project in Trimble Connect.
                    return VrFactory.createProject(vm.selectedProject.number + " " + vm.selectedProject.name)
                        .then(function (response) {
                            if(!response || response.status !== 201){
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
                            if(!response || response.status !== 200){
                                vm.status = {
                                    code: 'danger',
                                    message: 'Failed to add user to Project. Try reloading the page.'
                                };
                                return;
                            }
                            // (Konrad) Project was created and user was added.
                            // Since this is a new project we need to also add the images folder.
                            return VrFactory.createFolder({name: "Images", rootId: vm.trimbleProject.rootId});
                        })
                        .then(function(response){
                            if(!response || response.status !== 201){
                                vm.status = {
                                    code: 'danger',
                                    message: 'Failed to create Images folder. Try reloading the page.'
                                };
                                return;
                            }

                            // Since this is a new project we need to also add the buckets folder.
                            return VrFactory.createFolder({name: "Buckets", rootId: vm.trimbleProject.rootId});
                        })
                        .then(function (response) {
                            if(!response || response.status !== 201){
                                vm.status = {
                                    code: 'danger',
                                    message: 'Failed to create Buckets folder. Try reloading the page.'
                                };
                                return;
                            }

                            changeStatus({
                                code: 'success',
                                message: 'Trimble Connect project created.'
                            });

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
                            data: item.thumbnailUrl[item.thumbnailUrl.length - 1],
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
                    response.data.forEach(function (folder) {
                        if(folder.type !== 'FOLDER') return;

                        var sharableLink = $base64.encode(folder.projectId + ':' + folder.id).toString('base64');
                        var bucket = {
                            name: folder.name,
                            images: [],
                            sharableLink: sharableLink,
                            sharedWith: '',
                            id: folder.id,
                            parentId: folder.parentId,
                            projectId: folder.projectId,
                            editingBucket: false,
                            position: null,
                            commentId: ''
                        };

                        vm.buckets.push(bucket);
                        AddWatch(bucket);

                        var data = {
                            objectId: folder.id,
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
                                        bucket.sharedWith = content.sharedWith;
                                        bucket.commentId = comment.id;

                                        // (Konrad) We need to re-sort the vm.buckets to match our specified order.
                                        vm.buckets.sort(UtilityService.compareValues('position', 'asc'));
                                    })
                                }

                                return VrFactory.getFolderItems(folder.id)
                            })
                            .then(function (response) {
                                if(!response || response.status !== 200){
                                    changeStatus({
                                        code: 'danger',
                                        message: 'Failed to retrieve images from Bucket. Please reload the page and try again.'
                                    });
                                    return;
                                }

                                if(response.data.length > 0){
                                    response.data.forEach(function (file, index) {
                                        var image = {
                                            file: null,
                                            data: null,
                                            dataSize: null,
                                            versionId: file.versionId,
                                            projectId: file.projectId,
                                            parentId: file.parentId,
                                            id: file.id,
                                            name: file.name,
                                            commentId: '',
                                            position: index
                                        };

                                        // (Konrad) We push the skeleton version of the image to vm.images
                                        // here so that we can use the "loading.gif" while the images are downloaded.
                                        bucket.images.push(image);

                                        var data = {
                                            objectId: file.id,
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
                                                        if(!comment.description.startsWith('{"parentImageId":')) return;

                                                        var content = JSON.parse(comment.description);
                                                        image.parentImageId = content.parentImageId;
                                                        image.position = content.position;
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

    vm.removeExt = function (name) {
        return name.replace(/\.[^/.]+$/, "");
    };

    vm.manageShare = function (bucket, size) {
        $uibModal.open({
            animation: true,
            templateUrl: 'angular-app/vr/manage-share.html',
            windowClass: 'zindex',
            controller: 'ManageShareController as vm',
            size: size,
            resolve: {
                bucket: function (){
                    return bucket;
                }}
        }).result.then(function(request){
            if(!request) return;

        }).catch(function(){
            console.log("All Tasks Dialog dismissed...");
        });
    };

    // /**
    //  * Creates a sharable
    //  * @param bucket
    //  */
    // vm.createShare = function (bucket) {
    //     var files = [];
    //     bucket.images.forEach(function (item) {
    //         files.push({
    //             id: item.id,
    //             type: 'FILE'
    //         })
    //     });
    //
    //     var emails = [];
    //     var re = /\s*;\s*/;
    //     bucket.sharedWith.split(re).forEach(function (item) {
    //         if(UtilityService.validateEmail(item)){
    //             emails.push({
    //                 id: item,
    //                 type: 'EMAIL'
    //             })
    //         }
    //     });
    //
    //     // data: JSON.stringify({
    //     //     'mode': data.mode,
    //     //     'projectId': data.projectId,
    //     //     'objects': data.objects,
    //     //     'permission': 'DOWNLOAD',
    //     //     'notify': data.notify,
    //     //     'message': data.message
    //     // }),
    //
    //     var data = {
    //         mode: 'PUBLIC',
    //         projectId: vm.trimbleProject.id,
    //         objects: files,
    //         permission: 'DOWNLOAD',
    //         notify: emails,
    //         message: 'A link has been shared with you.'
    //     };
    //
    //     console.log(data);
    //
    //     // VrFactory.createShare(data)
    //     //     .then(function (response) {
    //     //         console.log(response);
    //     //     })
    //     //     .catch(function (error) {
    //     //         console.log(error);
    //     //     })
    // };

    /**
     * Adds new bucket. Posts it to Trimble Connect.
     */
    vm.addBucket = function(){
        var name = validateBucketName();
        var bucket = {
            name: name,
            images: [],
            sharableLink: '',
            sharedWith: '',
            id: '',
            parentId: '',
            projectId: '',
            editingBucket: false,
            position: vm.buckets.length,
            commentId: ''
        };

        vm.buckets.push(bucket);
        AddWatch(bucket);

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

                var sharableLink = $base64.encode(response.data.projectId + ':' + response.data.id).toString('base64');

                bucket.id = response.data.id;
                bucket.parentId = response.data.parentId;
                bucket.projectId = response.data.projectId;
                bucket.sharableLink = sharableLink;

                // (Konrad) Since Trimble Connect doesn't support adding custom metadata
                // to images, we can use Comments to add description and display name.
                var data = {
                    'objectId': bucket.id,
                    'objectType': 'FOLDER',
                    'description': '{"position": ' + bucket.position + ', "sharedWith": ""}'
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

    // /**
    //  * Moves bucket panel up.
    //  * @param file
    //  * @param arr
    //  * @param action
    //  */
    // vm.moveUp = function (file, arr, action) {
    //     var index = file.position;
    //     var file2 = arr.find(function (item) {
    //         return item.position === (index - 1);
    //     });
    //
    //     var desc1 = '';
    //     if(action !== 'bucket'){
    //         desc1 = '{"parentImageId": "' + file.parentImageId + '", "position": ' + (index - 1) + '}';
    //     } else {
    //         //TODO: update sharedWith
    //         desc1 = '{"position": ' + (index - 1) + '}';
    //     }
    //     var data1 = {
    //         commentId: file.commentId,
    //         description: desc1
    //     };
    //
    //     var desc2 = '';
    //     if(action !== 'bucket'){
    //         desc2 = '{"parentImageId": "' + file2.parentImageId + '", "position": ' + index + '}';
    //     } else {
    //         //TODO: update sharedWith
    //         desc2 = '{"position": ' + index + '}';
    //     }
    //     var data2 = {
    //         commentId: file2.commentId,
    //         description: desc2
    //     };
    //
    //     file.position = index - 1;
    //     file2.position = index;
    //
    //     updateComment(data1);
    //     updateComment(data2);
    // };

    /**
     * Moves bucket/image up/down.
     * @param file
     * @param arr
     * @param action
     * @param dir
     */
    vm.shiftPosition = function (file, arr, action, dir) {
        var index = file.position;
        var file2 = arr.find(function (item) {
            return item.position === (index + dir);
        });

        var desc1 = '';
        if(action !== 'bucket'){
            desc1 = '{"parentImageId": "' + file.parentImageId + '", "position": ' + (index + dir) + '}';
        } else {
            var shares = !file.sharedWith ? '' : file.sharedWith;
            desc1 = '{"position": ' + (index + dir) + ', "sharedWith": "' + shares + '"}';
        }
        var data1 = {
            commentId: file.commentId,
            description: desc1
        };

        var desc2 = '';
        if(action !== 'bucket'){
            desc2 = '{"parentImageId": "' + file2.parentImageId + '", "position": ' + index + '}';
        } else {
            var shares2 = !file2.sharedWith ? '' : file.sharedWith;
            desc2 = '{"position": ' + index + ', "sharedWith": "' + shares2 + '"}';
        }
        var data2 = {
            commentId: file2.commentId,
            description: desc2
        };

        file.position = index + dir;
        file2.position = index;

        updateComment(data1);
        updateComment(data2);
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
                // newFiles.forEach(function (item) {
                //     VrFactory.downloadFile(item.id)
                //         .then(function (response) {
                //             if(!response || response.status !== 200){
                //                 changeStatus({
                //                     code: 'danger',
                //                     message: 'Failed to download image ' + item.name + ' from Trimble Connect. Reload the page and try again.'
                //                 });
                //                 return;
                //             }
                //
                //             item.data = UtilityService.arrayBufferToBase64(response.data);
                //         })
                //         .catch(function (err) {
                //             changeStatus({
                //                 code: 'danger',
                //                 message: 'Failed to download image ' + item.name + ' from Trimble Connect. Reload the page and try again.'
                //             });
                //             console.log(err);
                //         });
                // })
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
        }
    });

    /**
     * Shows modal window for input of image properties.
     * @param size
     * @param image
     */
    vm.editImage = function (size, image) {
        $uibModal.open({
            animation: true,
            templateUrl: 'angular-app/vr/edit-image.html',
            windowClass: 'zindex',
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
                })
                .catch(function (err) {
                    changeStatus({
                        code: 'danger',
                        message: 'Failed to update image Description and Display Name. Reload the page and try again.'
                    });
                    console.log(err);
                });

            // if(vm.buckets.length === 0) return;
            //
            // // (Konrad) Since dragula makes a copy of the image, when it's moved to
            // // a bucket, we need to track them down and update if name/desc changed.
            // vm.buckets.forEach(function (bucket) {
            //     bucket.images.forEach(function (image) {
            //         if(image.id === request.response.id){
            //             image.displayName = request.response.displayName;
            //             image.description = request.response.description;
            //         }
            //     });
            // });

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
     * Removes selected image from bucket only.
     * @param file
     * @param bucket
     */
    vm.deleteFromBucket = function (file, bucket) {
        var index = bucket.images.findIndex(function (image) {
            return image.id === file.id;
        });
        if(index !== -1) bucket.images.splice(index, 1);

        // (Konrad) The $watchCollection will pick up the event
        // and delete the file from Trimble Connect.
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
        deleteFile(vm.images, file);

        // (Konrad) Delete image from all Buckets that it was placed in.
        // $watchCollection will pick up the event and update Trimble.
        vm.buckets.forEach(function (bucket) {
            var index2 = bucket.images.findIndex(function (image) {
                return file.id === image.parentImageId;
            });
            if(index2 !== -1) bucket.images.splice(index2, 1);
        });
    };

    /**
     * Adds a $watchCollection to newly created bucket array.
     * @param x
     * @constructor
     */
    function AddWatch(x) {
        if (!(this instanceof AddWatch)) return new AddWatch(x);

        var index = vm.buckets.indexOf(x);
        var id = 'buckets[' + index + '].images';
        $scope.$watchCollection(id, function(newValue, oldValue, scope) {
            if(!newValue || !oldValue || newValue.length === oldValue.length) return;
            if(vm.deletedDuplicate){
                vm.deletedDuplicate = false;
                return;
            }

            if(newValue.length > oldValue.length){
                // File was added.
                var newFiles = newValue.diff(oldValue);
                if(!newFiles[0].data){
                    // (Konrad) New file has an id assigned. This means that the file is coming from Trimble Connect.
                    // If that's the case the $watchCollection would not pick up each file separately but rather all at once.
                } else {
                    // (Konrad) Check if added image is duplicate and remove.
                    var bucket = vm.buckets[index];
                    vm.deletedDuplicate = false;
                    var count = bucket.images.length;
                    bucket.images = UtilityService.removeDuplicates(bucket.images, 'id');
                    if(count > bucket.images.length){
                        vm.deletedDuplicate = true;
                        changeStatus({
                            code: 'warning',
                            message: 'Image already exists in this bucket. It cannot be added twice.'
                        });
                    }
                    if (vm.deletedDuplicate) return;

                    // (Konrad) New Image was added. Let's upload to Trimble.
                    var newFile = newFiles[0];
                    var parentImageId = newFile.id;
                    var position = newValue.length - 1;

                    newFile['parentImageId'] = parentImageId;
                    newFile['position'] = position;

                    var data = {
                        fromFileVersionId: parentImageId, //id of the file to copy
                        parentId: bucket.id, //bucket id
                        parentType: 'FOLDER',
                        copyMetaData: true,
                        mergeExisting: false
                    };

                    VrFactory.copyFile(data)
                        .then(function (response) {
                            if(!response || response.status !== 201){
                                changeStatus({
                                    code: 'danger',
                                    message: 'Failed making a copy of the selected image. Please reload the page and try again.'
                                });
                                return
                            }

                            newFile.id = response.data.id; //new image id
                            newFile.parentId = response.data.parentId; //folder changed

                            // (Konrad) Since every image in a bucket is just a copy of another image we can store
                            // the reference to parent image id. It will come handy when we download images when
                            // page loads for the first time. We can then just use the downloaded images data instead
                            // of downloading the same image multiple times for all buckets that it might be in.
                            var data = {
                                'objectId': response.data.id,
                                'objectType': 'FILE',
                                'description': '{"parentImageId": "' + parentImageId + '", "position": ' + position + '}'
                            };

                            return VrFactory.addComment(data)
                        })
                        .then(function (response) {
                            if(!response || response.status !== 201){
                                changeStatus({
                                    code: 'danger',
                                    message: 'Failed adding information about Parent Image. Please reload the page and try again.'
                                });
                                return
                            }

                            newFile.commentId = response.data.id;
                        })
                        .catch(function(err){
                            changeStatus({
                                code: 'danger',
                                message: 'Failed making a copy of the selected image. Please reload the page and try again.'
                            });
                            console.log(err);
                        });
                }
            } else if (newValue.length < oldValue.length){
                deleteFile(oldValue, oldValue.diff(newValue)[0]);
            }
        });
    }

    /**
     * Retrieves a parent property from image. Used to obtain displayName and description
     * for images in buckets since they are replicas of main images.
     * @param file
     * @param propName
     */
    vm.getParentProperty = function (file, propName) {
        var parentImage = vm.images.find(function(item){
            return item.id === file.parentImageId;
        });
        if(parentImage) return parentImage[propName];
    };

    /**
     * Returns a non-duplicate Bucket name.
     * @returns {string}
     */
    function validateBucketName(){
        var counter = 1;
        var validated = false;
        var suggestedName = "Bucket " + (vm.buckets.length + counter);
        if(vm.buckets.length === 0) return suggestedName;

        var compare = function (bucket) {
            return bucket.name === suggestedName;
        };
        while(!validated){
            if(vm.buckets.findIndex(compare) === -1){
                validated = true;
            } else {
                counter++;
                suggestedName = "Bucket " + (vm.buckets.length + counter);
            }
        }
        return suggestedName;
    }

    /**
     * Updates comments for given files/folder.
     * @param data
     */
    function updateComment(data){
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
    }

    /**
     * Deltes a file from Trimble Connect.
     * @param arr
     * @param file
     */
    function deleteFile(arr, file) {
        VrFactory.deleteFile(file.id)
            .then(function (response) {
                if(!response || response.status !== 204){
                    arr.push(file);
                    changeStatus({
                        code: 'danger',
                        message: 'Failed to delete the image ' + file.name + ' . Please reload the page and try again.'
                    });
                }
            })
            .catch(function (err) {
                changeStatus({
                    code: 'danger',
                    message: 'Failed to delete the image ' + file.name + ' . Please reload the page and try again.'
                });
                console.log(err);
            });
    }

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
}