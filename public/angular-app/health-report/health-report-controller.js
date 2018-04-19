angular.module('MissionControlApp').controller('HealthReportController', HealthReportController);

function HealthReportController($routeParams, HealthRecordsFactory, ProjectFactory, HealthReportFactory){
    var vm = this;
    vm.projectId = $routeParams.projectId;
    vm.FamilyCollection = null;
    vm.HealthRecords = [];
    vm.AllData = [{
        show: {name: "main", value: true}
    }];

    getSelectedProject(vm.projectId);

    // Retrieves project by project id
    function getSelectedProject(projectId) {
        ProjectFactory.getProjectById(projectId)
            .then(function(response){
                if(!response || response.status !== 200) return;

                vm.selectedProject = response.data;
                if(response.data.healthrecords.length > 0) {
                    return HealthRecordsFactory.getNames(response.data.healthrecords);
                } else {
                    return {status: 500};
                }
            })
            .then(function (response) {
                if(!response || response.status !== 200) {
                    vm.showMenu = false;
                    return;
                }

                vm.HealthRecords = response.data;
                var selected = response.data.sort(dynamicSort('centralPath'))[0];
                vm.selectedFileName = vm.fileNameFromPath(selected.centralPath);

                vm.SetProject(selected, false);
            })
            .catch(function(err){
                console.log('Unable to load Health Records data: ' + err.message);
            });
    }

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
     * Returns file name from full file path.
     * @param path
     */
    vm.fileNameFromPath = function (path){
        if(!path) return;

        // (Konrad) We retrieve a file name with extension,
        // then remove the last 12 chars (_central.rvt)
        return path.replace(/^.*[\\\/]/, '').slice(0, -12);
    };

    /**
     * Custom sort function to show files sorted by file name.
     * @param file
     */
    vm.sortFiles = function (file) {
        return vm.fileNameFromPath(file.centralPath);
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
        vm.selectedFileName = vm.fileNameFromPath(link.centralPath);
        vm.showMenu = true;

        if (reset) vm.AllData = [{
            show: {name: "main", value: true}
        }];

        // (Konrad) By default we will take only last month worth of data.
        // Users can change that range in specific needs.
        var dtFrom = new Date();
        dtFrom.setMonth(dtFrom.getMonth() - 1);
        var dateRange = {
            from: dtFrom,
            to: new Date()
        };

        HealthReportFactory.processModelStats(link._id, dateRange, function (result) {
            if(result){
                vm.ModelData = result;
                vm.AllData.splice(0, 0, result);
            }
            vm.SelectionChanged('main');
        });

        HealthReportFactory.processFamilyStats(link._id, function (result) {
            if(result){
                vm.FamilyData = result;
                vm.AllData.splice(0, 0, result);
            }
            vm.SelectionChanged('main');
        });

        HealthReportFactory.processStyleStats(link._id, dateRange, function (result) {
            if(result){
                vm.StyleData = result;
                vm.AllData.splice(0, 0, result);
            }
            vm.SelectionChanged('main');
        });

        HealthReportFactory.processLinkStats(link._id, dateRange, function (result) {
            if(result){
                vm.LinkData = result;
                vm.AllData.splice(0, 0, result);
            }
            vm.SelectionChanged('main');
        });

        HealthReportFactory.processViewStats(link._id, dateRange, function (result) {
            if(result){
                vm.ViewData = result;
                vm.AllData.splice(0, 0, result);
            }
            vm.SelectionChanged('main');
        });

        HealthReportFactory.processWorksetStats(link._id, dateRange, function (result) {
            if(result) {
                vm.WorksetData = result;
                vm.AllData.splice(0, 0, result);
            }
            vm.SelectionChanged('main');
        });
    };

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
            var prop1 = vm.fileNameFromPath(a[property]);
            var prop2 = vm.fileNameFromPath(b[property]);
            var result = (prop1 < prop2) ? -1 : (prop1 > prop2) ? 1 : 0;
            return result * sortOrder;
        }
    }
}