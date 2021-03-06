/**
 * Created by konrad.sobon on 2019-05-02.
 */
angular.module('MissionControlApp').controller('SettingsController', SettingsController);

function SettingsController(SettingsFactory, ngToast, $route, UtilityService) {
    var vm = this;
    var toasts = [];

    vm.settings = null;
    vm.office = {
        name: null,
        code: null
    };
    vm.state = null;
    vm.localFilePath = null;
    vm.userLocationsOptions = UtilityService.userLocationsOptions();
    vm.tempLocationsOptions = UtilityService.tempLocationsOptions();
    vm.projectInfoSources = UtilityService.projectInfoSources();
    vm.authorized = false;

    getSettings();

    /**
     * Utility method for converting camelCase property names to Sentence Case. 
     */
    vm.processPropertyName = function(name) {
        var result = name.replace( /([A-Z])/g, ' $1');
        return result.charAt(0).toUpperCase() + result.slice(1);
    };

    /**
     * Utility method for validating input Regex pattern.
     */
    vm.isValidRegex = function(pattern) {
        if (vm.settings === null) return false;

        var isValidPattern = true;
        try {
            new RegExp(pattern);
        } catch(err) {
            isValidPattern = false;
        }
    
        return vm.settings && isValidPattern;
    };

    /**
     * 
     */
    vm.setProjectInfoSource = function (o, action) {
        switch (action) {
            case 'Location':
                vm.settings.projectInfo.source = o;
                break;
            case 'Name':
                break;
            case 'Number':
                break;
        }
    },

    /**
     * 
     */
    vm.setLocationSource = function (source, action) {
        switch (action) {
            case 'Office':
                vm.settings.userLocation.source = source;
                break;
            case 'Temp':
                vm.settings.tempLocationsOptions = source;
                break;
        }
    };

    /**
     * 
     */
    vm.addValue = function (arr, action) {
        switch (action) {
            case 'Office':
                if (!vm.office.name.trim() || !vm.office.code.trim()) return;

                arr.push({
                    name: vm.office.name,
                    code: vm.office.code.split(',')
                });
                vm.office = {
                    name: null,
                    code: null
                };
                break;
            case 'State':
                if (!vm.state.trim()) return;

                arr.push(vm.state);
                vm.state = null;
                break;
            case 'LocalFilePath':
                if (!vm.localFilePath.trim()) return;

                arr.push(vm.localFilePath);
                vm.localFilePath = null;
                break;
        }
    };

    /**
     * Triggers AddOfficeName function on Enter key.
     * @param event
     * @param arr
     * @param action
     */
    vm.onEnter = function (event, arr, action) {
        if (event.which !== 13) return;

        vm.addValue(arr, action);
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
        if (!vm.settings.offices.some(function (item) {
                return item.name === 'All';
            })) {
            vm.settings.offices.push({
                name: 'All',
                code: ['All']
            });
        }

        SettingsFactory.update(vm.settings)
            .then(function (response) {
                if (!response || response.status !== 201) throw {
                    message: 'Unable to update Settings.'
                };

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
                if (!response || response.status !== 200) {
                    vm.authorized = false;
                    throw {
                        message: 'Unable to retrieve the Settings.'
                    };
                }
                vm.authorized = true;
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