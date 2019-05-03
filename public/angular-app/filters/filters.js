angular.module('MissionControlApp')
    .filter('split', function() {
        return function(input) {
            return input.replace(/^.*[\\\/]/, '').slice(0, -4); //removed file extension
        };
    });
