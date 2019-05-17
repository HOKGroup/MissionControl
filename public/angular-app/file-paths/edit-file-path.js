/**
 * Created by konrad.sobon on 2018-11-15.
 */
angular.module('MissionControlApp').controller('EditFilePathController', EditFilePathController);

function EditFilePathController(FilePathsFactory, SettingsFactory, $uibModalInstance, id) {
    var vm = this;
    
    vm.settings = null;
    vm.filePath = null;

    getSettings();
    getFilePath(id);

    /**
     * Calls DB with a new Office Location for given File Path.
     */
    vm.setOffice = function(office) {
        vm.filePath.fileLocation = office.code[0];

        FilePathsFactory.update(vm.filePath)
        .then(function (response){
            if (!response || response.status !== 201) return;

            $uibModalInstance.close();
        })
        .catch(function(err){
            console.log(err);
        });
    };

    /**
     * Closes modal dialog.
     */
    vm.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

    /**
     * Retrieves Mission Control Settings from the DB.
     */
    function getSettings() {
        SettingsFactory.get()
            .then(function (response) {
                if (!response || response.status !== 200) return;

                vm.settings = response.data;
            })
            .catch(function (err) {
                console.log(err.message);
            });
    };

    /**
     * Retrieves information about the File Path.
     * @param id
     */
    function getFilePath(id) {
        FilePathsFactory.findById(id)
            .then(function (response) {
                if (!response || response.status !== 200) return;

                vm.filePath = response.data;
            })
            .catch(function (error) {
                console.log(error);
            });
    };
}