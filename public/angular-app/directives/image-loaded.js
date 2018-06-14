/**
 * Created by konrad.sobon on 2018-02-13.
 */

/**
 * We need to wait for the image source to be streamed from Trimble Connect.
 * To do that we can subscribe to "load" event on the image and broadcast it to other divs.
 */
angular.module('MissionControlApp').directive('imageLoaded', ['$rootScope', function ($rootScope) {
    return {
        restrict: 'A',
        link: function ($scope, ele, attrs) {
            ele.bind('load', function() {
                $rootScope.$broadcast('IMAGE_LOADED', ele[0].id);
            });
        }
    };
}]);

/**
 * This directive listens for image loaded event and either enables
 * hovereffect class for the parent div, or disables the none class for the child divs
 */
angular.module('MissionControlApp').directive('onImageLoaded', [function () {
    return {
        restrict: 'A',
        link: function ($scope, $ele, attrs) {
            $scope.$on('IMAGE_LOADED', function (event, args) {
                if(args + "_hover" === $ele[0].id){
                    $ele.addClass('hovereffect')
                } else if (args + "_show" === $ele[0].id){
                    $ele.removeClass('none')
                }
            })
        }
    };
}]);