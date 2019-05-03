/**
 * Created by konrad.sobon on 2019-05-02.
 */
angular.module('MissionControlApp').controller('SettingsController', SettingsController);

function SettingsController(SettingsFactory, ngToast, $route){
    var vm = this;
    var toasts = [];
    vm.settings = null;
    vm.office = null;

    getSettings();

    /**
     * Adds Office Location to the list.
     * @param arr
     * @constructor
     */
    vm.AddOfficeName = function (arr) {
        if(vm.office === null) return;

        arr.push(vm.office);
        vm.office = null;
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
            case 'OfficeName':
                vm.AddOfficeName(arr);
                break;
        }
    };

    /**
     * Removes office name from the list.
     * @param arr
     * @param index
     * @constructor
     */
    vm.RemoveName = function (arr, index) {
        arr.splice(index, 1);
    };

    /**
     * 
     */
    vm.verifyForm = function () {
        // TODO: Handle form validation.
    };

    /**
     * 
     */
    vm.update = function () {
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