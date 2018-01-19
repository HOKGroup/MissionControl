angular.module('MissionControlApp').controller('HealthReportController', HealthReportController);

function HealthReportController($routeParams, HealthRecordsFactory, HealthReportFactory, FamiliesFactory){
    var vm = this;
    vm.projectId = $routeParams.projectId;
    vm.ShowLinkStats = {name: "links", value: false};
    vm.ShowFamiliesStats = {name: "families", value: false};
    vm.ShowWorksetStats = {name: "worksets", value: false};
    vm.ShowViewStats = {name: "views", value: false};
    vm.ShowModelStats = {name: "models", value: false};
    vm.ShowMainPage = {name: "main", value: true};
    vm.HealthRecordNames = [];
    vm.FamilyCollection = null;
    var currentSelection = vm.ShowMainPage.name;

    var allControllers = [vm.ShowLinkStats, vm.ShowFamiliesStats, vm.ShowWorksetStats, vm.ShowViewStats, vm.ShowModelStats, vm.ShowMainPage];
    vm.SelectionChanged = function (name) {
        allControllers.forEach(function (item) {
            item.value = item.name === name;
        })
    };

    getSelectedProject(vm.projectId);

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

    vm.SetProject = function (link){
        vm.selectedHealthRecord = link;
        vm.selectedFileName = vm.fileNameFromPath(link.centralPath);
        vm.AllData = [];

        if(vm.selectedHealthRecord.familyStats !== null){
            FamiliesFactory
                .getById(vm.selectedHealthRecord.familyStats)
                .then(function(resFamilies1){
                    if(!resFamilies1){
                        return;
                    }else{
                        vm.FamilyCollection = resFamilies1.data;
                    }

                    if(vm.FamilyCollection !== null){
                        vm.FamilyData = HealthReportFactory.processFamilyStats(vm.FamilyCollection);
                        if(vm.FamilyData) vm.AllData.push(vm.FamilyData);
                    }

                    vm.WorksetData = HealthReportFactory.processWorksetStats(link);
                    if(vm.WorksetData) vm.AllData.push(vm.WorksetData);

                    var linkData = link.linkStats[link.linkStats.length - 1];
                    vm.LinkData = HealthReportFactory.processLinkStats(linkData);
                    if(vm.LinkData) vm.AllData.push(vm.LinkData);

                    var viewData = link.viewStats[link.viewStats.length - 1];
                    vm.ViewData = HealthReportFactory.processViewStats(viewData);
                    if(vm.ViewData) vm.AllData.push(vm.ViewData);

                    vm.ModelData = HealthReportFactory.processModelStats(link);
                    if(vm.ModelData) vm.AllData.push(vm.ModelData);

                    vm.SelectionChanged(vm.ShowMainPage.name);

                }, function(err){
                    console.log('Unable to load Families Data: ' + err.message);
                })
        }else{
            vm.FamilyCollection = null;
            vm.FamilyData = null;
            vm.ShowFamiliesStats.value = false;

            vm.WorksetData = HealthReportFactory.processWorksetStats(link);
            if(vm.WorksetData) vm.AllData.push(vm.WorksetData);

            var linkData = link.linkStats[link.linkStats.length - 1];
            vm.LinkData = HealthReportFactory.processLinkStats(linkData);
            if(vm.LinkData) vm.AllData.push(vm.LinkData);

            var viewData = link.viewStats[link.viewStats.length - 1];
            vm.ViewData = HealthReportFactory.processViewStats(viewData);
            if(vm.ViewData) vm.AllData.push(vm.ViewData);

            vm.ModelData = HealthReportFactory.processModelStats(link);
            if(vm.ModelData) vm.AllData.push(vm.ModelData);

            vm.SelectionChanged(vm.ShowMainPage.name);
        }
    };

    // Retrieves project by project id
    function getSelectedProject(projectId) {
        HealthRecordsFactory
            .getProjectById(projectId)
            .then(function(resProject){
                if(!resProject) return;

                vm.selectedProject = resProject.data;
                if(resProject.data.healthrecords.length > 0)
                {
                    HealthRecordsFactory
                        .populateProject(projectId)
                        .then(function(resProject1){
                            if(!resProject1) return;

                            vm.selectedProject = resProject1.data;

                            //(Konrad) It makes sense to sort the dropdown by file name.
                            vm.selectedProject.healthrecords.forEach(function (item) {
                                item['fileName'] = vm.fileNameFromPath(item.centralPath);
                                return item;
                            });
                            vm.selectedHealthRecord = vm.selectedProject.healthrecords.sort(dynamicSort('fileName'))[0];
                            vm.selectedFileName = vm.selectedHealthRecord['fileName'];

                            if(vm.selectedHealthRecord.familyStats !== null){
                                FamiliesFactory
                                    .getById(vm.selectedHealthRecord.familyStats)
                                    .then(function(resFamilies){
                                        if(!resFamilies) return;
                                        vm.FamilyCollection = resFamilies.data;
                                        vm.SetProject(vm.selectedHealthRecord);
                                    }, function(err){
                                        console.log('Unable to load Families Data: ' + err.message);
                                    })
                            }else{
                                vm.SetProject(vm.selectedHealthRecord);
                            }
                        }, function(err){
                            console.log('Unable to load Health Records data: ' + err.message);
                        });
                }
            },function(error){
                console.log('Unable to load Health Records data: ' + error.message);
            });
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
            var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
            return result * sortOrder;
        }
    }
}