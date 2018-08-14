var app = angular.module('MissionControlApp').controller('FamilyStatsController', FamilyStatsController);

function FamilyStatsController($routeParams, $uibModal, $scope, DTColumnDefBuilder, UtilityService) {
    var vm = this;
    this.$onInit = function () {
        vm.projectId = $routeParams.projectId;
        vm.FamilyData = this.processed;

        console.log(vm.FamilyData);

        processData();

        /**
         * Since all health report components are initiated when data is finished loading
         * none of them are yet visible. The DOM has not yet loaded the divs etc. This means
         * that all divs have a width of 0 and table is initiated with that width as well.
         * By watching this variable we can detect when user selected to see this page.
         */
        $scope.$watch('vm.FamilyData.show.value', function (newValue) {
            if(newValue)reloadTable();
        });

        /**
         * Applies selected filer and reloads DataTable.
         * @constructor
         */
        vm.FilterTable = function () {
            if(vm.dtInstance) {vm.dtInstance.reloadData(false);}
        };

        /**
         * Handler for brushing event on Parallel Coordinates chart.
         * @param item
         * @constructor
         */
        vm.OnBrush = function(item){
            vm.AllFamilies = vm.FamilyData.familyStats.families.filter(function(family){
                var found = false;
                for (var i = 0; i < item.length; i++){
                    if(item[i].name === family.name){
                        found = true;
                        break;
                    }
                }
                return found;
            });
        };

        /**
         * Returns file size as string ex. KiB, MiB
         * @param item
         * @returns {string|*}
         */
        vm.formatValue = function(item){
            return UtilityService.formatNumber(item);
        };

        /**
         * Checks if family has tasks. If tasks are not completed it returns red.
         * @param f
         * @returns {*}
         */
        vm.evaluateTasks = function (f) {
            if(f.tasks.length === 0) return;

            var open = f.tasks.find(function (item) {
                return !!item.completedBy;
            });
            return !!open ? {"color": "#5cb85c"} : {"color": "#D9534F"};
        };

        /**
         * Evaluates family health and returns score between 0-3. 0 is good. 3 is bad.
         * @param f
         * @returns {number}
         */
        vm.evaluateFamily = function (f) {
            if(f.tasks.length > 0){
                var override = f.tasks.find(function(item){
                    return item.completedBy !== null;
                });
                if(override !== null) return 0;
            }

            var score = 0;
            if (f.sizeValue > 1000000) score++;
            if (!vm.FamilyData.nameCheckValues.some(function (x) {
                    return f.name.indexOf(x) !== -1;
                })) score++;
            if (f.instances === 0) score++;

            return score;
        };

        /**
         * Checks if file name contains values defined in Configuration.
         * @param f
         * @returns {boolean}
         */
        vm.evaluateName = function(f){
            if(f.tasks.length > 0){
                var override = f.tasks.find(function(item){
                    return item.completedBy !== null;
                });
                if(override) return true;
            }

            return vm.FamilyData.nameCheckValues.some(function (x) {
                return f.name.indexOf(x) !== -1;
            });
        };

        /**
         * Checks if there are more than 0 instances.
         * @param f
         * @returns {boolean}
         */
        vm.evaluateInstances = function(f){
            if(f.tasks.length > 0){
                var override = f.tasks.find(function(item){
                    return item.completedBy !== null;
                });
                if(override) return true;
            }

            return f.instances > 0;
        };

        /**
         * Checks if file is smaller than 1MB
         * @param f
         * @returns {boolean}
         */
        vm.evaluateSize = function(f){
            if(f.tasks.length > 0){
                var override = f.tasks.find(function(item){
                    return item.completedBy !== null;
                });
                if(override) return true;
            }

            return f.sizeValue < 1000000;
        };

        /**
         * Launches appropriate modal window.
         * @param family
         * @param userNames
         */
        vm.launchEditor = function (family, userNames) {
            if(family.tasks.length > 0){
                openAllTasks('lg', family, userNames);
            } else {
                openEditTask('lg', family, null, 'Add Task', userNames)
            }
        };

        /**
         * Launches all tasks dialog.
         * @param size
         * @param family
         * @param userNames
         */
        var openAllTasks = function (size, family, userNames) {
            $uibModal.open({
                animation: true,
                templateUrl: 'angular-app/health-report/family-stats/all-tasks.html',
                controller: 'AllFamilyTasksController as vm',
                size: size,
                resolve: {
                    family: function (){
                        return family;
                    },
                    userNames: function(){
                        return userNames;
                    }}
            }).result.then(function(request){
                if(!request) return;
                if(request.action === 'Delete Family Task'){
                    // (Konrad) We clear the tasks array to update UI, without reloading the page
                    request.deletedIds.forEach(function (id) {
                        var index = family.tasks.findIndex(function (x) {
                            return x._id.toString() === id.toString();
                        });
                        if(index !== -1) family.tasks.splice(index, 1);
                    });
                }
            }).catch(function(){
                console.log("All Tasks Dialog dismissed...");
            });
        };

        /**
         * Launches add task dialog.
         * @param size
         * @param family
         * @param task
         * @param action
         * @param userNames
         */
        var openEditTask = function (size, family, task, action, userNames) {
            $uibModal.open({
                animation: true,
                templateUrl: 'angular-app/health-report/family-stats/edit-task.html',
                controller: 'EditFamilyTaskController as vm',
                size: size,
                resolve: {
                    family: function (){
                        return family;
                    },
                    task: function(){
                        return task;
                    },
                    action: function(){
                        return action;
                    },
                    userNames: function(){
                        return userNames;
                    }}
            }).result.then(function(request){
                if(!request) return;

                // (Konrad) This can only return "Add Task".
                // Otherwise the all tasks menu would come up and
                // return value will be handled by that controller.
                if(action === 'Add Task'){
                    var newTask = request.response.data;
                    family.tasks.push(newTask);
                }
            }).catch(function(){
                console.log("All Tasks Dialog dismissed...");
            });
        };

        //region Utilities

        /**
         * Parses through all data before charts and tables can be rendered.
         */
        function processData() {
            vm.AllFamilies = [];
            vm.FamilyData.familyStats.families.forEach(function (item) {
                if(!item.isDeleted && item.isFailingChecks){
                    item['collectionId'] = vm.FamilyData.familyStats._id;
                    item['centralPath'] = vm.FamilyData.familyStats.centralPath;
                    vm.AllFamilies.push(item);
                }
            });

            vm.pcoordinatesData = [];
            vm.AllFamilies.forEach(function(item){
                vm.pcoordinatesData.push({
                    name: item.name,
                    "Size": item.sizeValue,
                    "Instances": item.instances,
                    "Parameters": item.parametersCount,
                    "Nested Families": item.nestedFamilyCount,
                    "Voids": item.voidCount,
                    "Ref. Planes": item.refPlaneCount,
                    "Arrays": item.arrayCount
                })
            });
            createTable();
        }

        /**
         * Method to recalculate data table contents and reload it.
         */
        function reloadTable() {
            if(vm.dtInstance) {vm.dtInstance.reloadData(false);}
            if(vm.dtInstance) {vm.dtInstance.rerender();}
        }

        /**
         * Creates options for the DataTables.
         */
        function createTable() {
            vm.dtInstance = {};
            vm.dtOptions = {
                paginationType: 'simple_numbers',
                lengthMenu: [[10, 25, 50, 100, -1], [10, 25, 50, 100, 'All']],
                stateSave: true,
                deferRender: true
            };

            vm.dtColumnDefs = [
                DTColumnDefBuilder.newColumnDef(0), //index
                DTColumnDefBuilder.newColumnDef(1), //name
                DTColumnDefBuilder.newColumnDef(2).withOption('orderData', '3'), //tasks
                DTColumnDefBuilder.newColumnDef(3).notVisible(), //task count
                DTColumnDefBuilder.newColumnDef(4), //instances
                DTColumnDefBuilder.newColumnDef(5).withOption('orderData', '6'), //size
                DTColumnDefBuilder.newColumnDef(6).notVisible() //sizeValue
            ];
        }

        //endregion
    };
}