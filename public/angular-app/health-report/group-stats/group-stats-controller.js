/**
 * Created by konrad.sobon on 2018-05-16.
 */
angular.module('MissionControlApp').controller('GroupStatsController', GroupStatsController);

function GroupStatsController(){
    var vm = this;
    this.$onInit = function () {
        vm.GroupData = this.processed;
        vm.showTimeSettings = false;
        vm.loading = false;
    }
}