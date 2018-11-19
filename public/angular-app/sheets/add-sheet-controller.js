/**
 * Created by konrad.sobon on 2017-11-02.
 */
angular.module('MissionControlApp').controller('AddSheetController', AddSheetController);

function AddSheetController($uibModalInstance, UtilityService, ModelsFactory, models) {
    var vm = this;

    // (Konrad) We can exclude 'All' from the model list.
    vm.models = models.filter(function(item){
        return item.name !== 'All';
    });
    vm.selectedModel = vm.models[0];
    vm.userNames = null;

    var path = UtilityService.getHttpSafeFilePath(vm.selectedModel.centralPath);
    getUserNames(path);

    /**
     * Retrieves all user names that ever opened the model.
     * @param centralPath
     */
    function getUserNames(centralPath) {
        ModelsFactory.getUserNamesByCentralPath(centralPath)
            .then(function (response) {
                if(!response || response.status !== 200) return;

                // (Konrad) We need all unique user names of people that ever opened the model.
                // These will be used to populate dropdowns when assigning tasks. It will allow
                // us to only assign tasks to people that actually work in the model.
                var userNamesSet = new Set(response.data.filter(function (item) {
                    return item.user;
                }).map(function (item) {
                    return item.user;
                }));

                vm.userNames = Array.from(userNamesSet);
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    vm.template = {
        count: 1,
        assignedTo: '',
        isPlaceholder: false,
        message: ''
    };
    vm.popoverOptions = {
        placement: 'right',
        triggers: 'outsideClick'
    };
    vm.operators = [
        'Prefix/Suffix',
        'Number Series',
        'Letter Series'
    ];
    vm.currentOperator = {};
    vm.currentNumberOperators = [
        {
            name: 'Prefix/Suffix',
            value: 'A',
            templateUrl: 'prefixSuffix.html',
            section: 'number'
        },
        {
            name: 'Number Series',
            start: 100,
            step: 1,
            range: [100],
            templateUrl: 'numberSeries.html',
            section: 'number'
        }
    ]; // all operators added to sheet number
    vm.currentNameOperators = [
        {
            name: 'Prefix/Suffix',
            value: 'SHEET NAME',
            templateUrl: 'prefixSuffix.html',
            section: 'name'
        }
    ]; // all operators added to sheet name
    vm.selectedSheetType = 'Architecture';
    vm.availableSheetTypes = [
        'Architecture',
        'Interiors',
        'Structure'
    ];

    vm.setSheetTypeTemplate = function (type) {
        vm.selectedSheetType = type;

        // (Konrad) Clean current setup
        vm.currentNumberOperators = [];
        vm.currentNameOperators = [];

        // (Konrad) Get prefix
        var prefix = '';
        if(type === 'Architecture') prefix = 'A';
        if(type === 'Interiors') prefix = 'I';
        if(type === 'Structure') prefix = 'S';

        // (Konrad) Create new setup.
        vm.currentNumberOperators = [
            {
                name: 'Prefix/Suffix',
                value: prefix,
                templateUrl: 'prefixSuffix.html',
                section: 'number'
            },
            {
                name: 'Number Series',
                start: 100,
                step: 1,
                templateUrl: 'numberSeries.html',
                section: 'number'
            }
        ];
        vm.currentNameOperators = [
            {
                name: 'Prefix/Suffix',
                value: 'SHEET NAME',
                templateUrl: 'prefixSuffix.html',
                section: 'name'
            }
        ];
    };

    vm.setPlaceholder = function(value) {
        vm.template.isPlaceholder = value;
    };

    vm.addOperator = function (type, section) {
        var array = section === 'name' ? vm.currentNameOperators : vm.currentNumberOperators;
        if(type === 'Prefix/Suffix'){
            array.push(
                {
                    name: 'Prefix/Suffix',
                    value: '',
                    templateUrl: 'prefixSuffix.html',
                    section: section
                }
            );
        } else if (type === 'Number Series'){
            array.push(
                {
                    name: 'Number Series',
                    start: 100,
                    step: 1,
                    range: [100],
                    templateUrl: 'numberSeries.html',
                    section: section
                }
            );
        } else if (type === 'Letter Series'){
            array.push(
                {
                    name: 'Letter Series',
                    start: 'A',
                    step: 1,
                    range: ['A'],
                    templateUrl: 'letterSeries.html',
                    section: section
                }
            );
        }
    };

    vm.deleteOperator = function (index) {
        var array = vm.currentOperator.section === 'name' ? vm.currentNameOperators : vm.currentNumberOperators;
        array.splice(index, 1);
    };

    vm.showRightArrow = function (index) {
        var array = vm.currentOperator.section === 'name' ? vm.currentNameOperators : vm.currentNumberOperators;
        return index < array.length - 1;
    };

    vm.showLeftArrow = function (index) {
        return index > 0;
    };

    vm.moveLeft = function (index) {
        var array = vm.currentOperator.section === 'name' ? vm.currentNameOperators : vm.currentNumberOperators;
        UtilityService.move(array, index, index-1);
    };

    vm.moveRight = function (index) {
        var array = vm.currentOperator.section === 'name' ? vm.currentNameOperators : vm.currentNumberOperators;
        UtilityService.move(array, index, index+1);
    };

    vm.getButtonLabel = function (operator) {
        if(operator.name === 'Prefix/Suffix'){
            if(operator.value.length > 0) return operator.value;
            else return operator.name;
        } else if (operator.name === 'Number Series'){
            var range = UtilityService.range(operator.start, operator.step, vm.template.count);
            operator.range = range; // save new range into operator
            if(range.length >= 2) return range[0] + '-' + range[range.length - 1];
            else if(range.length === 1) return range[0];
            else return operator.name;
        } else if (operator.name === 'Letter Series'){
            var charRange = UtilityService.charRange(operator.start, operator.step, vm.template.count);
            operator.range = charRange; // save new range into operator
            if(charRange.length >= 2) return charRange[0] + '-' + charRange[charRange.length - 1];
            else if (charRange.length === 1) return charRange[0];
            else return operator.name;
        }
    };

    vm.setCurrentOperator = function (operator) {
        vm.currentOperator = operator;
    };

    /**
     * Creates an array with sheet item objects
     */
    vm.create = function () {
        var newSheets = [];
        for(var i = 0; i < vm.template.count; i++){
            var sheetName = buildName(vm.currentNameOperators, i);
            var sheetNumber = buildName(vm.currentNumberOperators, i);
            newSheets.push(
                {
                    name: sheetName,
                    number: sheetNumber,
                    uniqueId: '',
                    revisionNumber: '',
                    isSelected: false,
                    identifier: '',
                    isPlaceholder: vm.template.isPlaceholder,
                    isDeleted: false,
                    collectionId: vm.selectedModel.collectionId,
                    centralPath: vm.selectedModel.centralPath,
                    fileName: vm.selectedModel.name,
                    isNewSheet: true,
                    tasks: [{
                        name: sheetName,
                        number: sheetNumber,
                        uniqueId: '',
                        revisionNumber: '',
                        isSelected: false,
                        identifier: '',
                        isPlaceholder: vm.template.isPlaceholder,
                        isDeleted: false,
                        collectionId: vm.selectedModel.collectionId,
                        centralPath: vm.selectedModel.centralPath,
                        fileName: vm.selectedModel.name,
                        isNewSheet: true,
                        assignedTo: vm.template.assignedTo,
                        message: vm.template.message,
                        comments: '',
                        submittedOn: Date.now(),
                        submittedBy: 'webuser',
                        completedOn: '',
                        completedBy: ''
                    }]
                }
            );
        }

        $uibModalInstance.close({collectionId: vm.selectedModel.collectionId, sheets: newSheets});
    };

    var buildName = function(operators, index){
        var name = '';
        operators.forEach(function(item){
            if(item.name === 'Prefix/Suffix'){
                name = name + item.value;
            } else if (item.name === 'Number Series'){
                name = name + item.range[index];
            } else if (item.name === 'Letter Series'){
                name = name + item.range[index];
            }
        });

        return name;
    };

    vm.clear = function () {
        vm.currentNumberOperators = [];
        vm.currentNameOperators = [];
    };

    vm.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}

