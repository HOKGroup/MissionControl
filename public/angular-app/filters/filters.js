angular.module('MissionControlApp')
    .filter('split', function() { // Splits string at character and returns
        return function(input, splitChar) {
            var splits = input.split(splitChar);
            return splits[splits.length - 1];
        }
    });
