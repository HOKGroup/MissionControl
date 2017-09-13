// Splits string at character and returns
angular.module('MissionControlApp').filter('split', function() {
        return function(input, splitChar) {
            var splits = input.split(splitChar);
            return splits[splits.length - 1];
        }
});
