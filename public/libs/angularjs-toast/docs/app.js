'use strict';

var app = angular.module('myApp', ['angularjsToast']);

app.controller('mainController', ['$scope', 'toast', function ($scope, toast) {

  var array = [
    'Lorem ispsum',
    'Lorem ipsum dolor cadet',
    'angularjs-toast',
    'a simple toast message',
    'another simple toast message'
  ];

  $scope.dismiss = false;

  function random() {
    return array[Math.floor(Math.random() * array.length)];
  }

  $scope.toast = function (cls) {
    toast({
      masterClass: 'masterClass',
      className: cls,
      duration: 5000,
      message: random(),
      position: 'left',
      container: '#appendAlert',
      maxToast: 4
    });

    $scope.dismiss = true;
  };

}]);
