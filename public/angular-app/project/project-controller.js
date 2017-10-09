angular.module('MissionControlApp').controller('ProjectController', ProjectController);

function ProjectController(ProjectFactory, $location, DTColumnDefBuilder){
    var vm = this;
    vm.status = "Success";

    getProjects();

    vm.go = function(path){
        $location.path(path);
    };

    vm.dtOptions2 = {
        paginationType: 'simple_numbers',
        lengthMenu: [[25, 50, 100, -1], [25, 50, 100, 'All']]
    };

    vm.dtColumnDefs2 = [
        DTColumnDefBuilder.newColumnDef(0), //number
        DTColumnDefBuilder.newColumnDef(1), //name
        DTColumnDefBuilder.newColumnDef(2), //office
        DTColumnDefBuilder.newColumnDef(3) //address
    ];

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