/**
 * Created by konrad.sobon on 2018-01-09.
 */
angular.module('MissionControlApp').controller('VrController', VrController);

function VrController($routeParams, VrFactory, dragulaService, $scope){
    var vm = this;
    vm.projectId = $routeParams.projectId;
    vm.selectedProject = null;

    dragulaService.options($scope, 'fifth-bag', {
        copy: true
    });

    // (Konrad) Retrieves selected project from MongoDB.
    getSelectedProject(vm.projectId);

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