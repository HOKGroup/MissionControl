/**
 * Created by konrad.sobon on 2018-04-04.
 */
angular.module('MissionControlApp').controller('HealthScoreSummaryController', HealthScoreSummaryController);

function HealthScoreSummaryController(){
    var vm = this;
    this.$onInit = function () {
        vm.data = this.data;
        vm.description = this.description;
        vm.bullets = this.bullets;
        vm.title = this.title;
        vm.showDetails = this.details;
        vm.name = this.name;

        console.log(vm.data);

        if (vm.showDetails){
            vm.descriptionClass = 'col-md-5';
        } else {
            vm.descriptionClass = 'col-md-9';
        }

        vm.toggleDetails = function () {
            vm.showDetails = !vm.showDetails;
            if (vm.showDetails){
                // contract description
                vm.descriptionClass = 'col-md-5';
                vm.showDetails = true;
            } else {
                // expand description
                vm.descriptionClass = 'col-md-9';
                vm.showDetails = false;
            }
        }
    };
}