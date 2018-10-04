/**
 * Created by konrad.sobon on 2018-10-04.
 */
angular.module('MissionControlApp').controller('FilePathsController', FilePathsController);

function FilePathsController(FilePathsFactory){
    var vm = this;
    vm.files = [];

    getFiles();

    function getFiles(){
        FilePathsFactory.getAll()
            .then(function (response) {
                if(!response || response.status !== 200){
                    return;
                }

                vm.files = response.data;
            }).catch(function (error) {
                console.log(error);
        });
    }
}