/**
 * Created by konrad.sobon on 2018-03-13.
 */
angular.module('MissionControlApp').controller('FilePathHelpController', FilePathHelpController);

function FilePathHelpController($uibModalInstance) {
    var vm = this;

    /**
     * Closes modal dialog.
     */
    vm.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}