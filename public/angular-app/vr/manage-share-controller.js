/**
 * Created by konrad.sobon on 2018-02-13.
 */
angular.module('MissionControlApp').controller('ManageShareController', ManageShareController);

function ManageShareController($uibModalInstance, UtilityService, bucket) {
    var vm = this;
    vm.bucket = bucket;
    vm.emails = [{id: 'konrad.sobon@hok.com', type: 'EMAIL'}, {id: 'sobon.konrad@gmail.com', type: 'EMAIL'}];
    vm.email = '';
    vm.emailWarning = '';

    vm.submit = function () {
        $uibModalInstance.close({response: vm.image});
    };

    vm.removeEmail = function (email) {
        var index = vm.emails.findIndex(function (item) {
            return item.id === email.id;
        });

        if(index !== -1) vm.emails.splice(index, 1);
    };

    vm.onEnter = function (bucket, event) {
        if(event.which !== 13) return;

        vm.addEmail();
    };

    vm.addEmail = function () {
        var re = /\s*;\s*/;
        vm.email.split(re).forEach(function (item) {
            if(UtilityService.validateEmail(item)){
                vm.emails.push({
                    id: item,
                    type: 'EMAIL'
                });
                vm.email = '';
                vm.emailWarning = '';
            } else {
                vm.emailWarning = 'Invalid email address. Please verify and try again.'
            }
        });
    };

    /**
     * Closes modal window.
     */
    vm.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}