/**
 * Created by konrad.sobon on 2018-01-09.
 */
angular.module('MissionControlApp').controller('VrController', VrController);

function VrController($routeParams, VrFactory, dragulaService, $scope, $window, $uibModal, UtilityService){
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

    $scope.$on('image_bag.remove-model', function (el, container, source) {
        // var deletedId = container[0].id;
        // console.log("deletedId:" + deletedId);
    });

    $scope.$on('image_bag.drop-model', function (el, target, source, sibling) {
        // var addedId = cource.context.children()[0].id;
        // console.log("addedId:" + addedId);
    });

    //(Konrad) Options for the dragula bags
    dragulaService.options($scope, 'image_bag', {
        copy: function (el, source) {
            return source.id.match('#images') //we only allow copy from "images" into "buckets"
        },
        removeOnSpill: true, // removes the object when dragged outside of box
        moves: function (el, source, handle, sibling) {
            // console.log('move:' + el);
            return handle.className === 'handle glyphicon glyphicon-move'; //only drag elements with this class
        },
        accepts: function (el, target, source, sibling) {
            return source.id === '#images' && target.id === '#bucket'; // only allow images from "images to be dragged into buckets"
        }
    });

    vm.addBucket = function(){
        //TODO: Post to DB.
        //TODO: _id will be that of the posted element.
        vm.buckets.push({
            name: "Bucket " + (vm.buckets.length + 1),
            images: [],
            sharableLink: null,
            sharedWith: [],
            _id: UtilityService.guid()
        })
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

    vm.moveUp = function (bucket) {

    };

    vm.moveDown = function (bucket) {

    };

    $scope.$watch('vm.images', function (newValue, oldValue, scope) {
        var lastAdded = newValue[newValue.length - 1];
        console.log("imageAdded: " + (lastAdded ? lastAdded.name : "undefined"));
    }, true);

    $scope.$watchCollection('vm.buckets', function (newValue, oldValue, scope) {
        if(newValue.length > oldValue.length){
            console.log("Bucket added: " + newValue.diff(oldValue)[0].name);
        } else if(newValue.length < oldValue.length){
            console.log("Bucket removed: " + oldValue.diff(newValue)[0].name);
        }
        // if(newValue.length > oldValue.length){
        //     console.log(newValue.diff(oldValue)[0].name);
        // } else if(newValue.length < oldValue.length){
        //     console.log(oldValue.diff(newValue)[0].name);
        // }
    });

    // (Konrad) Retrieves selected project from MongoDB.
    getSelectedProject(vm.projectId);

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

        }).catch(function(){
            console.log("All Tasks Dialog dismissed...");
        });
    };

    /**
     * Used to retrieve the Project info.
     * Also, parses through sheets/sheetsChanges to populate DataTable.
     * @param projectId
     */
    function getSelectedProject(projectId) {
        VrFactory
            .getProjectById(projectId)
            .then(function(response){
                if(!response) return;

                vm.selectedProject = response.data;
                if(response.data.vr){
                    VrFactory
                        .populateVr(projectId).then(function (vrResponse) {
                        if(!vrResponse) return;

                        vm.selectedProject = vrResponse.data;
                    }, function (error) {
                        console.log('Unable to load Vr data ' + error.message);
                    });
                } else {
                    //TODO: VR page doesn't exist yet. We don't have an _id for the VR collection.
                    //TODO: Let's create it, and store back in the project.
                }
            },function(error){
                console.log('Unable to load project data: ' + error.message);
            });
    }
}