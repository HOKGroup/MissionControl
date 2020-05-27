/**
 * Created by dan.siroky on 2020-03-05.
 */
angular.module('MissionControlApp').controller('ErrorController', ErrorController);

function ErrorController($routeParams){
    var vm = this;
    vm.error = $routeParams.error || 'Unknown error';
    vm.errorDescription = $routeParams.error_desc || 'An unknown error occurred.';
}