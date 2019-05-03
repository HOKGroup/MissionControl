/**
 * Created by konrad.sobon on 2018-04-19.
 */
angular.module('MissionControlApp').controller('AddProjectController', AddProjectController);

function AddProjectController(ProjectFactory, SettingsFactory, $window, ngToast){
    var vm = this;
    var toasts = [];
    vm.status = '';
    vm.newProject = {
        address: {},
        geoLocation: {},
        geoPolygon: {},
        name: '',
        number: '',
        office: ''
    };
    vm.settings = null;

    getSettings();

    /**
     * Retrieves Mission Control Settings from the DB.
     */
    function getSettings() {
        SettingsFactory.get()
            .then(function (response) {
                if(!response || response.status !== 200) throw { message: 'Unable to retrieve the Settings.'};

                vm.settings = response.data;
            })
            .catch(function (err) {
                toasts.push(ngToast.danger({
                    dismissButton: true,
                    dismissOnTimeout: true,
                    timeout: 4000,
                    newestOnTop: true,
                    content: err.message
                }));
            });
    }

    /**
     * 
     */
    vm.setOffice = function(office) {
        vm.newProject.office = office.name;
    };

    /**
     * Adds a new Project to MongoDB.
     */
    vm.addProject = function(){
        if( !vm.newProject.hasOwnProperty('number') ||
            !vm.newProject.hasOwnProperty('name') ||
            !vm.newProject.hasOwnProperty('office')){
                toasts.push(ngToast.warning({
                    dismissButton: true,
                    dismissOnTimeout: true,
                    timeout: 4000,
                    newestOnTop: true,
                    content: 'Name, Number, Office are required fields.'
                }));
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
                if(!response || response.status !== 201) throw { message: 'Unable to add project.' };

                $window.location.assign('#/configurations/add/' + response.data._id);
            })
            .catch(function(err){
                toasts.push(ngToast.danger({
                    dismissButton: true,
                    dismissOnTimeout: true,
                    timeout: 4000,
                    newestOnTop: true,
                    content: err.message
                }));
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
