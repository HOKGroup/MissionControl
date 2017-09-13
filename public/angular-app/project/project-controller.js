angular.module('MissionControlApp').controller('ProjectController', ProjectController);

function ProjectController(ProjectFactory){
    var vm = this;
    vm.status = "Success";
    vm.dataTableOpt = {
        "lengthMenu": [[25, 50, 100, -1], [25, 50, 100, 'All']]
    };

    getProjects();

    function getProjects() {
        ProjectFactory.getProjects()
            .then(function (response) {
                vm.projects = response.data;
            }).catch(function (error) {
            vm.status = 'Unable to load project data: ' + error.message;
        });
    }

    vm.getProjectById = function (id) {
        ProjectFactory.getProjectById(id)
            .then(function (response) {
                vm.selectedProject = response.data;
            }).catch(function (error) {
            vm.status = 'Unable to get project by Id: ' + id + '  ' + error.message;
        });
    };

    vm.getByConfigId = function (id){
        ProjectFactory.getByConfigId(id)
            .then(function (response) {
                vm.selectedProject = response.data;
            }).catch(function (error){
            vm.status = 'Unable to get project by configuration Id: ' + id + '  ' + error.message;
        });
    };

    vm.getByOffice = function (office){
        ProjectFactory.getByOffice(office)
            .then(function (response) {
                vm.filteredProject = response.data;
            }).catch(function (error){
            vm.status = 'Unable to get project by office: ' + office + '  ' + error.message;
        });
    };
}