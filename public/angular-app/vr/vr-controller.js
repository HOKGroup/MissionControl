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

    // (Konrad) Retrieves selected project from MongoDB.
    getSelectedProject(vm.projectId);

    /**
     * Used to retrieve the Project info.
     * Also, parses through sheets/sheetsChanges to populate DataTable.
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
                if (response.status === 200) {
                    vm.trimbleProject = response.data;

                    return VrFactory.getFolderItems(vm.trimbleProject.rootId);
                } else if (response.status === 204) {
                    // (Konrad) Request was successful but no projects were found in Trimble.
                    // Let's make another request to create a new project in Trimble Connect.
                    return VrFactory.createProject(vm.selectedProject.number + " " + vm.selectedProject.name)
                        .then(function (response) {
                            if(response && response.status === 200){
                                vm.trimbleProject = response.data;
                                vm.status = {
                                    code: 'success',
                                    message: 'Successfully created new Trimble Connect project. Go ahead and upload images now!'
                                };
                                return VrFactory.addUser(vm.trimbleProject.id);
                            } else {
                                vm.status = {
                                    code: 'danger',
                                    message: 'Failed while creating new Trimble Connect project. Try reloading the page.'
                                };
                            }
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
                            console.log(err.message);
                        });
                } else {
                    // (Konrad) Retrieving/creating project failed.
                    console.log("Response 500.");
                }
            })
            .then(function (response) {
                // (Konrad) no matter what happens above the response here should be
                // either newly created folders or retrieved folders (Images,Buckets)
                vm.trimbleBucketsId = response.data.filter(function (item){
                    return item.name === "Buckets";
                })[0].id;
                vm.trimbleImagesId = response.data.filter(function (item) {
                    return item.name === "Images";
                })[0].id;

                return VrFactory.getFolderItems(vm.trimbleImagesId);

                // if(vm.trimbleImagesId){
                //     vm.status = {
                //         code: 'info',
                //         message: 'Trimble Connect project found. Go ahead and upload images now!'
                //     };
                // } else {
                //     vm.status = {
                //         code: 'danger',
                //         message: 'Failed to retrieve Images folder from Trimble Connect. Try reloading the page.'
                //     };
                // }
            })
            .then(function (response) {
                if(!response || response.status !== 200){
                    changeStatus({
                        code: 'danger',
                        message: 'Failed to retrieve images from Trimble Connect. Try reloading the page.'
                    });
                    return;
                }

                if(response.data.lengh <= 0) return;

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
                        name: item.name
                    };
                    vm.images.push(image);
                });
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

    //(Konrad) Options for the dragula bags
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
     * Adds new bucket.
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
            editingBucket: false
        };

        var data = {
            name: bucket.name,
            rootId: vm.trimbleProject.rootId
        };
        VrFactory.createFolder(data)
            .then(function(response){
                if(!response || response.status !== 201){
                    changeStatus({
                        code: 'danger',
                        message: 'Failed to create a new Bucket in Trimble Connect. Please reload the page and try again.'
                    });
                    return;
                }

                bucket.id = response.data.id;
                bucket.parentId = response.data.parentId;
                bucket.projectId = response.data.projectId;

                vm.buckets.push(bucket);

                changeStatus({
                    code: 'success',
                    message: 'Successfully created Bucket: ' + bucket.name + ' in Trimble Connect.'
                });
            }).catch(function (err) {
                changeStatus({
                    code: 'danger',
                    message: 'Failed to create new Bucket. Please reload the page and try again.'
                });
                console.log(err);
        });
    };

    /**
     *
     * @param bucket
     */
    vm.deleteBucket = function (bucket) {
        var idx = vm.buckets.indexOf(bucket);
        vm.buckets.splice(idx, 1);
        //TODO: remove from DB.
    };

    /**
     * Moves bucket panel up.
     * @param index
     * @param arr
     */
    vm.moveUp = function (index, arr) {
        UtilityService.move(arr, index, index-1);
    };

    /**
     * Moves bucket panel down.
     * @param index
     * @param arr
     */
    vm.moveDown = function (index, arr) {
        UtilityService.move(arr, index, index+1);
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
                            changeStatus({
                                code: 'success',
                                message: 'Successfully downloaded ' + item.name + " from Trimble Connect."
                            });
                        })
                        .catch(function (err) {
                            changeStatus({
                                code: 'danger',
                                message: 'Failed to download images from Trimble Connect. Reload the page and try again.'
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
                                code: 'warning',
                                message: 'Could not upload the file to Trimble. Reload the page and try again.'
                            });
                        }

                        var createdFile = response.data[0];
                        newFile.versionId = createdFile.versionId;
                        newFile.parentId = createdFile.parentId;
                        newFile.projectId = createdFile.projectId;
                        newFile.id = createdFile.id;
                        newFile.name = createdFile.name;

                        changeStatus({
                            code: 'success',
                            message: 'Successfully uploaded ' + newFile.name + ' to Trimble Connect.'
                        });
                    })
                    .catch(function (err) {
                        changeStatus({
                            code: 'danger',
                            message: 'Failed to upload the image. There was an error connecting to Trimble. Try reloading the page.'
                        });
                        console.log(err);
                    })
            }
        } else if(newValue.length < oldValue.length){
            // (Konrad) User deleted the file from Images
            // We should remove it from the Trimble server.
            var deletedFile = oldValue.diff(newValue)[0];
            VrFactory.deleteFile(deletedFile.id)
                .then(function (response) {
                    if(!response || response.status !== 204){
                        vm.images.push(deletedFile);
                        changeStatus({
                            code: 'warning',
                            message: 'Failed to delete the image ' + deletedFile.name + ' . Please reload the page and try again.'
                        });
                        return;
                    }

                    changeStatus({
                        code: 'success',
                        message: 'Successfully deleted ' + deletedFile.name + ' from Trimble Connect.'
                    });
                }).catch(function (err) {
                    changeStatus({
                        code: 'danger',
                        message: 'Failed to delete the image. There was an error connecting to Trimble. Try reloading the page.'
                    });
                    console.log(err);
            });
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
            if(vm.buckets.length === 0) return;

            // (Konrad) Since dragula makes a copy of the image, when it's moved to
            // a bucket, we need to track them down and update if name/desc changed.
            vm.buckets.forEach(function (bucket) {
                bucket.images.forEach(function (image) {
                    if(image.id.toString() === request.response.id.toString()){
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
            return item.id.toString() === file.id.toString();
        });
        if(index !== -1) vm.images.splice(index, 1);

        vm.buckets.forEach(function (bucket) {
            var index2 = bucket.images.findIndex(function (image) {
                return image.id.toString() === file.id.toString();
            });
            if(index2 !== -1) bucket.images.splice(index2, 1);
        });
    };
}