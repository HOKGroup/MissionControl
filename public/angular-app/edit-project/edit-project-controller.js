/**
 * Created by konrad.sobon on 2018-04-19.
 */
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
     * Deletes a project and all associated Configurations.
     * TODO: Do we need to delete all Sheets, Families, WorksetStats, ModelStats etc.
     * TODO: We could leave them here, and then potentially re-connect them if needed.
     */
    vm.deleteProject = function(){
        ProjectFactory.deleteProject(vm.selectedProject._id)
            .then(function(response) {
                if(!response || response.status !== 201) return;

                var configIds = vm.selectedProject.configurations;
                return ConfigFactory.deleteMany(configIds)
            })
            .then(function (response) {
                if(!response || response.status !== 201) return;

                //(Konrad) Reloads the resources so it should remove project from table.
                $window.location.href = '#/projects/';
            })
            .catch(function (err) {
                console.log(err);
                vm.status = 'Unable to delete Project and its Configurations: ' + err.message;
            });
    };

    /**
     * Updates project information.
     */
    vm.updateProject = function(){
        ProjectFactory.updateProject(vm.selectedProject)
            .then(function(response){
                if(!response || response.status !== 202) return;

                vm.status = 'Project updated';
                $window.location.assign('#/projects/');
            })
            .catch(function (err) {
                console.log(err.message);
                vm.status = 'Unable to update Project: ' + err.message;
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

    //region Utilities

    /**
     * Retrieves project by it's Id.
     * @param id
     */
    function getProjectById(id){
        ProjectFactory.getProjectById(id)
            .then(function(response) {
                if(!response || response.status !== 200) return;

                vm.selectedProject = response.data;
            })
            .catch(function (err) {
                console.log(err.message);
                vm.status = 'Unable to get project by Id: ' + err.message;
            });
    }

    //endregion
}
