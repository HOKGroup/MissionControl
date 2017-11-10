angular.module('MissionControlApp').controller('AddProjectController', AddProjectController);

function AddProjectController(ProjectFactory, $window, SheetsFactory){
    var vm = this;
    vm.status = "Success!";
    vm.newProject = {
        'address': {},
        'geoLocation': {},
        'geoPolygon': {}
    };
    vm.initialized = false;

    //warning messages
    vm.warning_number = '';
    vm.warning_name = '';

    vm.addProject = function(){
        if(!vm.newProject.hasOwnProperty('number')
            || !vm.newProject.hasOwnProperty('name')
            || !vm.newProject.hasOwnProperty('office')){
            console.log("Missing number, name, office");
            return;
        }

        var project = {
            number: vm.newProject.number,
            name: vm.newProject.name,
            office: vm.newProject.office,
            address: vm.newProject.address
        };

        if(vm.newProject.geoLocation.hasOwnProperty('type') && vm.newProject.geoLocation.hasOwnProperty('coordinates'))
        {
            project.geoLocation = vm.newProject.geoLocation;
        }
        if(vm.newProject.geoPolygon.hasOwnProperty('type') && vm.newProject.geoPolygon.hasOwnProperty('coordinates'))
        {
            project.geoPolygon = vm.newProject.geoPolygon;
        }
        project.healthrecords = [];
        project.configurations = [];

        ProjectFactory
            .addProject(project).then(function(response){
                if(!response || response.status !== 201) return;

                $window.location.assign('#/configurations/add/' + response.data._id);
            }).catch(function(error){
                vm.status = 'Unable to add project: ' + error.message;
                console.log(error)
            });
    };
}
