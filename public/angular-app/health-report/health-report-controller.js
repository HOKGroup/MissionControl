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
                            vm.selectedHealthRecord = vm.selectedProject.healthrecords[0];
                            vm.selectedFileName = vm.fileNameFromPath(vm.selectedHealthRecord.centralPath);

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
                            }
                        }, function(err){
                            console.log('Unable to load Health Records data: ' + err.message);
                        });
                }
            },function(error){
                console.log('Unable to load Health Records data: ' + error.message);
            });
    }

    function setFamilyStats(){

    }
}