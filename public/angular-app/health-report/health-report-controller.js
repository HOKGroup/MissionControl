angular.module('MissionControlApp').controller('HealthReportController', HealthReportController);

function HealthReportController($routeParams, HealthRecordsFactory, ProjectFactory, HealthReportFactory, FamiliesFactory){
    var vm = this;
    vm.projectId = $routeParams.projectId;
    vm.ShowLinkStats = {name: "links", value: false};
    vm.ShowFamiliesStats = {name: "families", value: false};
    vm.ShowWorksetStats = {name: "worksets", value: false};
    vm.ShowViewStats = {name: "views", value: false};
    vm.ShowModelStats = {name: "models", value: false};
    vm.ShowMainPage = {name: "main", value: true};
    vm.FamilyCollection = null;
    vm.HealthRecords = [];
    vm.loading = false;
    var allControllers = [vm.ShowLinkStats, vm.ShowFamiliesStats, vm.ShowWorksetStats, vm.ShowViewStats, vm.ShowModelStats, vm.ShowMainPage];

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
                if(!response || response.status !== 200) return;

                vm.HealthRecords = response.data;
                var selected = response.data.sort(dynamicSort('centralPath'))[0];
                vm.selectedFileName = vm.fileNameFromPath(selected.centralPath);

                vm.SetProject(selected);
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
        allControllers.forEach(function (item) {
            item.value = item.name === name;
        })
    };

    /**
     * Returns file name from full file path.
     * @param path
     */
    vm.fileNameFromPath = function (path){
        if(!path) return;
        return path.replace(/^.*[\\\/]/, '').slice(0, -4);
    };

    /**
     * Custom sort function to show files sorted by file name.
     * @param file
     */
    vm.sortFiles = function (file) {
        return vm.fileNameFromPath(file.centralPath);
    };

    /**
     * Sets currently selected project by retrieving all stats.
     * @param link
     * @constructor
     */
    vm.SetProject = function (link){
        vm.loading = true;
        HealthRecordsFactory.getById(link._id)
            .then(function (response) {
                if(!response || response.status !== 200) return;

                vm.selectedHealthRecord = response.data;
                vm.selectedFileName = vm.fileNameFromPath(response.data.centralPath);
                vm.AllData = [];

                vm.WorksetData = HealthReportFactory.processWorksetStats(response.data);
                if(vm.WorksetData) vm.AllData.push(vm.WorksetData);

                var linkData = response.data.linkStats[response.data.linkStats.length - 1];
                vm.LinkData = HealthReportFactory.processLinkStats(linkData);
                if(vm.LinkData) vm.AllData.push(vm.LinkData);

                var viewData = response.data.viewStats[response.data.viewStats.length - 1];
                vm.ViewData = HealthReportFactory.processViewStats(viewData);
                if(vm.ViewData) vm.AllData.push(vm.ViewData);

                vm.ModelData = HealthReportFactory.processModelStats(response.data);
                if(vm.ModelData) vm.AllData.push(vm.ModelData);

                if(vm.selectedHealthRecord.familyStats
                    && vm.selectedHealthRecord.familyStats !== null
                    && vm.selectedHealthRecord.familyStats !== ''){
                    FamiliesFactory.getById(vm.selectedHealthRecord.familyStats)
                        .then(function(response){
                            if(!response || response.status !== 200) return;

                            vm.FamilyCollection = response.data;
                            vm.FamilyData = HealthReportFactory.processFamilyStats(vm.FamilyCollection);
                            if(vm.FamilyData) vm.AllData.push(vm.FamilyData);

                            vm.SelectionChanged(vm.ShowMainPage.name);
                            vm.loading = false;
                        })
                        .catch(function(err){
                            console.log('Unable to load Families Data: ' + err.message);
                        })
                } else {
                    vm.FamilyCollection = null;
                    vm.FamilyData = null;
                    vm.ShowFamiliesStats.value = false;

                    vm.SelectionChanged(vm.ShowMainPage.name);
                    vm.loading = false;
                }
            })
            .catch(function (err) {
                console.log(err);
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