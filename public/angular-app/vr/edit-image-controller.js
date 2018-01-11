/**
 * Created by konrad.sobon on 2018-01-11.
 */
angular.module('MissionControlApp').controller('EditImageController', EditImageController);

function EditImageController($uibModalInstance, image) {
    var vm = this;
    vm.image = image;

    vm.submit = function () {
        // TODO: Handle submitting image changes to DB.
    };

    /**
     * Closes modal window.
     */
    vm.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}