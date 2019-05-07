/**
 * Created by konrad.sobon on 2019-05-02.
 */
angular.module('MissionControlApp').controller('SettingsController', SettingsController);

function SettingsController(SettingsFactory, ngToast, $route){
    var vm = this;
    var toasts = [];
    vm.settings = null;
    vm.office = { name: null, code: null };
    vm.state = null;
    vm.localFilePath = null;

    getSettings();

    /**
     * Adds Office Location to the list.
     * @param arr
     * @constructor
     */
    vm.AddOffice = function (arr) {
        if(!vm.office.name.trim() || !vm.office.code.trim()) return;

        arr.push({name: vm.office.name, code: vm.office.code.split(',')});
        vm.office = { name: null, code: null };
    };

    /**
     * Adds State/Region name to the list.
     */
    vm.AddState = function (arr) {
        if(!vm.state.trim()) return;

        arr.push(vm.state);
        vm.state = null;
    };

    /**
     * Adds Local File Path Regex to the list.
     */
    vm.AddLocalFile = function (arr) {
        if(!vm.localFilePath.trim()) return;

        arr.push(vm.localFilePath);
        vm.localFilePath = null;
    };

    /**
     * Triggers AddOfficeName function on Enter key.
     * @param event
     * @param arr
     * @param action
     */
    vm.onEnter = function (event, arr, action) {
        if(event.which !== 13) return;

        switch (action){
            case 'Office':
                vm.AddOffice(arr);
                break;
            case 'State':
                vm.AddState(arr);
                break;
            case 'LocalFilePath':
                vm.AddLocalFilePath
        }
    };

    /**
     * Removes office name from the list.
     * @param arr
     * @param index
     * @constructor
     */
    vm.Remove = function (arr, index) {
        arr.splice(index, 1);
    };

    /**
     * Makes sure that all fields that are required are filled in. 
     */
    vm.verifyForm = function () {
        return !vm.settings || vm.settings.offices.length <= 1;
    };

    /**
     * 
     */
    vm.update = function () {
        // (Konrad) For the filtering purposes we will always need the "All" item.
        // It will be ignored in some dropdowns like the EditProject, NewProject etc.
        if (!vm.settings.offices.some(function(item) { return item.name === 'All'; })) {
            vm.settings.offices.push({ name:'All', code:['All'] });
        }

        SettingsFactory.update(vm.settings)
            .then(function(response){
                if(!response || response.status !== 201) throw { message: 'Unable to update Settings.' };

                toasts.push(ngToast.success({
                    dismissButton: true,
                    dismissOnTimeout: true,
                    timeout: 4000,
                    newestOnTop: true,
                    content: 'Successfully updated Settings.'
                }));
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
    };

    /**
     * Reloads current page discarding any changes.
     */
    vm.cancel = function () {
        $route.reload();
    };

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
}