angular.module('MissionControlApp').controller('EditProjectController', EditProjectController);

function EditProjectController($routeParams, ProjectFactory, ConfigFactory, $window){
    var vm = this;
    vm.status = '';
    vm.projectId = $routeParams.projectId;
    vm.selectedProject = {
        'address':{},
        'geoLocation':{},
        'geoPolygon':{}
    };

    getProjectById(vm.projectId);

    /**
     * Retrieves project by it's Id.
     * @param id
     */
    function getProjectById(id){
        ProjectFactory.getProjectById(id).then(function(response) {
                if(!response) return;

                vm.selectedProject = response.data;
            }, function(error){
                vm.status = 'Unable to get project by Id: ' + error.message;
            });
    }

    /**
     * Deletes a project and all associated Configurations.
     * TODO: Do we need to delete all Sheets?
     * TODO: Do we need to delete all HealthRecords?
     * TODO: Do we need to delete all Families?
     */
    vm.deleteProject = function(){
        ProjectFactory
            .deleteProject(vm.selectedProject._id).then(function(response) {
                if(!response || response.status !== 201) return;

                vm.status = 'Deleted Project.';
                var configIds = vm.selectedProject.configurations;
                ConfigFactory
                    .deleteMany(configIds).then(function (projectResponse) {
                        if(!projectResponse || projectResponse.status !== 201) return;

                        //(Konrad) Reloads the resources so it should remove project from table.
                        $window.location.href = '#/projects/';
                }, function (error) {
                    vm.status = 'Unable to delete configurations: ' + error.message;
                });
            }, function(error){
                vm.status = 'Unable to delete project: ' +error.message;
            });
    };

    /**
     * Updates project information.
     */
    vm.updateProject = function(){
        ProjectFactory.updateProject(vm.selectedProject).then(function(response){
            if(!response) return;

            vm.status = 'Project updated';
            $window.location.assign('#/projects/');
            }, function(error){
                vm.status = 'Unable to update project: ' + error.message;
            });
    };

    /**
     * Checks that all required fields are filled out.
     * @returns {boolean}
     */
    vm.verifyForm = function () {
        return !vm.selectedProject.number || !vm.selectedProject.name || vm.selectedProject.name.length > 35 || !vm.selectedProject.office;
    };

    /**
     * Returns to projects page.
     */
    vm.cancel = function () {
        $window.location.href = '#/projects/';
    };
}
