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
    };
}