/**
 * Created by konrad.sobon on 2017-11-02.
 */

angular.module('MissionControlApp')
    .controller('AddSheetController', AddSheetController);

function AddSheetController($scope, $uibModalInstance, $sce, UtilityService, sheets) {
    $scope.sheet = sheets;
    $scope.template = {
        count: 1,
        assignedTo: '',
        isPlaceholder: true
    };
    $scope.operators = [
        'Prefix/Suffix',
        'Number Series'
    ];
    $scope.currentOperator = {};
    $scope.currentNumberOperators = []; // all operators added to sheet number
    $scope.currentNameOperators = []; // all operators added to sheet name

    $scope.setPlaceholder = function(value) {
        $scope.template.isPlaceholder = value;
    };

    $scope.addOperator = function (type, section) {
        var array = section === 'name' ? $scope.currentNameOperators : $scope.currentNumberOperators;
        if(type === 'Prefix/Suffix'){
            array.push(
                {
                    name: 'Prefix/Suffix',
                    value: '',
                    templateUrl: 'prefixSuffix.html',
                    section: section
                }
            )
        } else if (type === 'Number Series'){
            array.push(
                {
                    name: 'Number Series',
                    start: 0,
                    step: 1,
                    templateUrl: 'numberSeries.html',
                    section: section
                }
            )
        }
    };

    $scope.deleteOperator = function (index) {
        var array = $scope.currentOperator.section === 'name' ? $scope.currentNameOperators : $scope.currentNumberOperators;
        array.splice(index, 1);
    };

    $scope.showRightArrow = function (index) {
        var array = $scope.currentOperator.section === 'name' ? $scope.currentNameOperators : $scope.currentNumberOperators;
        return index < array.length - 1;
    };

    $scope.showLeftArrow = function (index) {
        return index > 0;
    };

    $scope.moveLeft = function (index) {
        var array = $scope.currentOperator.section === 'name' ? $scope.currentNameOperators : $scope.currentNumberOperators;
        UtilityService.move(array, index, index-1);
    };

    $scope.moveRight = function (index) {
        var array = $scope.currentOperator.section === 'name' ? $scope.currentNameOperators : $scope.currentNumberOperators;
        UtilityService.move(array, index, index+1);
    };

    $scope.getButtonLabel = function (operator) {
        if(operator.name === 'Prefix/Suffix'){
            if(operator.value.length > 0) return operator.value;
            else return operator.name;
        } else if (operator.name === 'Number Series'){
            var range = UtilityService.range(operator.start, operator.step, $scope.template.count);
            if(range.length >= 2) return range[0] + '-' + range[range.length - 1];
            else if(range.length === 1) return range[0];
            else return operator.name;
        }
    };

    $scope.setCurrentOperator = function (operator) {
        $scope.currentOperator = operator;
    };

    $scope.process = function () {
        alert($scope.currentOperator.value);
    };

    $scope.dynamicPopover = {
        content: 'Hello, World!',
        templateUrl: 'myPopoverTemplate.html',
        title: 'Title SuperLong'
    };

    $scope.popoverOptions = {
        placement: 'right',
        triggers: 'outsideClick'
    };

    $scope.placement = {
        options: [
            'top',
            'top-left',
            'top-right',
            'bottom',
            'bottom-left',
            'bottom-right',
            'left',
            'left-top',
            'left-bottom',
            'right',
            'right-top',
            'right-bottom'
        ],
        selected: 'top'
    };

    $scope.htmlPopover = $sce.trustAsHtml('<b style="color: red">I can</b> have <div class="label label-success">HTML</div> content');

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}

