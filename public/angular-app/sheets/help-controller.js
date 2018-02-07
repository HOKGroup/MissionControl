/**
 * Created by konrad.sobon on 2018-02-07.
 */

angular.module('MissionControlApp').controller('SheetHelpController', SheetHelpController);

function SheetHelpController($uibModalInstance) {
    var vm = this;

    /**
     * Closes modal dialog.
     */
    vm.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}