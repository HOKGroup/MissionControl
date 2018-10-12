/**
 * Created by konrad.sobon on 2018-10-05.
 */
angular.module('MissionControlApp').controller('FilePathButtonsController', FilePathButtonsController);

function FilePathButtonsController($location){
    var vm = this;
    this.$onInit = function () {
        vm.item = this.item;
        console.log(vm.item);

        /**
         * Navigates to given page.
         * @param path
         */
        vm.go = function(path){
            $location.path(path);
        };

        /**
         * Calls a method in the parent VM to disable an item.
         */
        vm.toggle = function (item) {
            item.isDisabled = !item.isDisabled;
            this.onDisable({item: item});
        };
    };
}