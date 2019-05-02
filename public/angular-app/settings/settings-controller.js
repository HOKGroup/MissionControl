/**
 * Created by konrad.sobon on 2019-05-02.
 */
angular.module('MissionControlApp').controller('SettingsController', SettingsController);

function SettingsController(SettingsFactory, ngToast){
    var vm = this;
    var toasts = [];
    vm.settings = null;

    getSettings();

    /**
     * Retrieves projects from the DB.
     */
    function getSettings() {
        SettingsFactory.get()
            .then(function (response) {
                console.log(response);
                if(!response || response.status !== 200) throw { message: 'Unable to delete Project.'};

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