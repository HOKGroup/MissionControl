/**
 * Created by konrad.sobon on 2018-04-19.
 */
angular.module('MissionControlApp').controller('FakerController', FakerController);

function FakerController(FakerFactory, $window, ngToast){
    var vm = this;
    /**
     * Adds a new Project to MongoDB.
     */
    vm.createFakes = function(){
        console.log("FAKE");
      FakerFactory.createFakes();
    };
}
