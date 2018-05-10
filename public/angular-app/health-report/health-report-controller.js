angular.module('MissionControlApp').controller('HealthReportController', HealthReportController);

function HealthReportController($routeParams, ProjectFactory, HealthReportFactory){
    var vm = this;
    vm.projectId = $routeParams.projectId;
    vm.FamilyCollection = null;
    vm.HealthRecords = [];
    vm.AllData = [{
        show: {name: "main", value: true}
    }];
    vm.files = [];

    getSelectedProject(vm.projectId);

    /**
     * Retrieves project by project id.
     * @param projectId
     */
    function getSelectedProject(projectId) {
        ProjectFactory.getProjectByIdPopulateConfigurations(projectId)
            .then(function(response){
                if(!response || response.status !== 200){
                    vm.showMenu = false;
                    return;
                }

                vm.selectedProject = response.data;
                vm.selectedProject.configurations.forEach(function (config) {
                    config.files.forEach(function (file) {
                        file.name = fileNameFromPath(file.centralPath);
                        vm.files.push(file);
                    });
                });

                var selected = vm.files.sort(dynamicSort('centralPath'))[0];
                vm.SetProject(selected, false);

                vm.showMenu = true;
            })
            .catch(function(err){
                console.log('Unable to load Health Records data: ' + err.message);
            });
    }

    //region Utilities

    /**
     * Returns file name from full file path.
     * @param path
     */
    function fileNameFromPath(path){
        if(!path) return;

        // (Konrad) We retrieve a file name with extension,
        // then remove the last 12 chars (_central.rvt)
        var fileName = path.replace(/^.*[\\\/]/, '');
        var hasCentral = fileName.match(/-central/i);
        if(hasCentral){
            // let's slice -central.rvt
            return fileName.slice(0, -12);
        } else {
            // let's only slice the .rvt
            return fileName.slice(0, -4);
        }
    }

    /**
     * Returns a sort order for objects by a given property on that object.
     * Credit: https://stackoverflow.com/questions/1129216/sort-array-of-objects-by-string-property-value-in-javascript
     * @param property
     * @returns {Function}
     */
    function dynamicSort(property) {
        var sortOrder = 1;
        if(property[0] === "-") {
            sortOrder = -1;
            property = property.substr(1);
        }
        return function (a,b) {
            var prop1 = fileNameFromPath(a[property]);
            var prop2 = fileNameFromPath(b[property]);
            var result = (prop1 < prop2) ? -1 : (prop1 > prop2) ? 1 : 0;
            return result * sortOrder;
        }
    }

    //endregion

    /**
     * Handles changing of stat type.
     * @param name
     * @constructor
     */
    vm.SelectionChanged = function (name) {
        vm.AllData.forEach(function (item) {
            item.show.value = item.show.name === name;
        });
    };

    /**
     * Checks if data was loaded for given asset and returns true/false.
     * @param name
     * @returns {boolean}
     * @constructor
     */
    vm.LoadPage = function (name) {
        return vm.AllData.some(function (item) {
            return item.show.name === name;
        });
    };

    /**
     * Checks if given asset was toggled on/off and returns true/false.
     * @param name
     * @returns {boolean}
     * @constructor
     */
    vm.ShowPage = function (name) {
        return vm.AllData.some(function(item){
            if (item.show.name === name){
                return item.show.value;
            }
        });
    };

    /**
     * Sets currently selected project by retrieving all stats.
     * @param link
     * @param reset
     * @constructor
     */
    vm.SetProject = function (link, reset){
        vm.selectedFileName = link.name;
        vm.noData = true;

        if (reset) vm.AllData = [{
            show: {name: "main", value: true}
        }];

        // (Konrad) By default we will take only last month worth of data.
        // Users can change that range in specific needs.
        var dtFrom = new Date();
        dtFrom.setMonth(dtFrom.getMonth() - 1);
        var data = {
            from: dtFrom,
            to: new Date(),
            centralPath: link.centralPath
        };

        HealthReportFactory.processModelStats(data, function (result) {
            if( result &&
                result.modelStats.modelSizes.length > 0 &&
                result.modelStats.openTimes.length > 0 &&
                result.modelStats.synchTimes.length > 0 &&
                result.modelStats.worksets.onOpened.length > 0 &&
                result.modelStats.worksets.onSynched.length > 0){
                vm.noData = false;
                vm.ModelData = result;
                vm.AllData.splice(0, 0, result);
            }
            vm.SelectionChanged('main');
        });

        HealthReportFactory.processFamilyStats(data, function (result) {
            if(result){
                vm.noData = false;
                vm.FamilyData = result;
                vm.AllData.splice(0, 0, result);
            }
            vm.SelectionChanged('main');
        });

        HealthReportFactory.processStyleStats(data, function (result) {
            if(result && result.styleStats.length > 0){
                vm.noData = false;
                vm.StyleData = result;
                vm.AllData.splice(0, 0, result);
            }
            vm.SelectionChanged('main');
        });

        HealthReportFactory.processLinkStats(data, function (result) {
            if(result && result.linkStats.linkStats.length > 0){
                vm.noData = false;
                vm.LinkData = result;
                vm.AllData.splice(0, 0, result);
            }
            vm.SelectionChanged('main');
        });

        HealthReportFactory.processViewStats(data, function (result) {
            if(result && result.viewStats.viewStats.length > 0){
                vm.noData = false;
                vm.ViewData = result;
                vm.AllData.splice(0, 0, result);
            }
            vm.SelectionChanged('main');
        });

        HealthReportFactory.processWorksetStats(data, function (result) {
            if( result &&
                result.worksetStats.onOpened.length > 0 &&
                result.worksetStats.onSynched.length > 0 &&
                result.worksetStats.itemCount.length > 0) {
                    vm.noData = false;
                    vm.WorksetData = result;
                    vm.AllData.splice(0, 0, result);
            }
            vm.SelectionChanged('main');
        });
    };
}