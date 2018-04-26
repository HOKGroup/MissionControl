/**
 * Created by konrad.sobon on 2018-04-19.
 */
angular.module('MissionControlApp').controller('AddProjectController', AddProjectController);

function AddProjectController(ProjectFactory, $window){
    var vm = this;
    vm.status = "";
    vm.newProject = {
        address: {},
        geoLocation: {},
        geoPolygon: {},
        name: '',
        number: '',
        office: ''
    };

    /**
     * Adds a new Project to MongoDB.
     */
    vm.addProject = function(){
        if( !vm.newProject.hasOwnProperty('number') ||
            !vm.newProject.hasOwnProperty('name') ||
            !vm.newProject.hasOwnProperty('office')){
            vm.status = 'Name, Number and Office are required fields. Please fill them out.';
            return;
        }

        var project = {
            number: vm.newProject.number,
            name: vm.newProject.name,
            office: vm.newProject.office,
            address: vm.newProject.address,
            configurations: [],
            triggerRecords: [],
            sheets: [],
            modelStats: [],
            linkStats: [],
            styleStats: [],
            familyStats: [],
            worksetStats: [],
            viewStats: []
        };

        if(vm.newProject.geoLocation.hasOwnProperty('type') && vm.newProject.geoLocation.hasOwnProperty('coordinates'))
        {
            project.geoLocation = vm.newProject.geoLocation;
        }
        if(vm.newProject.geoPolygon.hasOwnProperty('type') && vm.newProject.geoPolygon.hasOwnProperty('coordinates'))
        {
            project.geoPolygon = vm.newProject.geoPolygon;
        }

        ProjectFactory
            .addProject(project)
            .then(function(response){
                if(!response || response.status !== 201) return;

                $window.location.assign('#/configurations/add/' + response.data._id);
            })
            .catch(function(err){
                console.log(err);
                vm.status = 'Unable to add project: ' + err.message;
            });
    };

    /**
     * Checks that all required fields are filled out.
     * @returns {boolean}
     */
    vm.verifyForm = function () {
        return !vm.newProject.number || !vm.newProject.name || vm.newProject.name.length > 35 || !vm.newProject.office;
    };

    /**
     * Returns to projects page.
     */
    vm.cancel = function () {
        $window.location.href = '#/projects/';
    };
}
