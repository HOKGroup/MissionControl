angular.module('MissionControlApp').controller('EditProjectController', EditProjectController);

function EditProjectController($routeParams, ProjectFactory, $window){
    var vm = this;
    vm.status;
    vm.projectId = $routeParams.projectId;
    vm.selectedProject = {
        'address':{},
        'geoLocation':{},
        'geoPolygon':{}
    };
    vm.initialized = false;

    (function init(){
        //initialize FME
        FMEServer.init({
            server: "http://fme.hok.com",
            token: "4919b579f13ce37d6ac3917f655b8b6143f203d3"
        });

        ProjectFactory.getProjectById(vm.projectId)
            .then(function(response) {
                vm.selectedProject = response.data;
                vm.initialized = true;
            }, function(error){
                vm.status = 'Unable to get project by Id: ' + vm.projectId + '  ' + error.message;
            });
    })();

    function getProjectById(id){
        ProjectFactory.getProjectById(id)
            .then(function(response) {
                vm.selectedProject = response.data;
            }, function(error){
                vm.status = 'Unable to get project by Id: '+id+'  '+error.message;
            });
    }

    vm.deleteProject = function(){
        ProjectFactory
            .deleteProject(vm.selectedProject._id).then(function(response) {
                vm.status = 'Deleted Project.';
                //delete configurations
                for(var j = 0; j < vm.selectedProject.configurations.length; j++){
                    var configId = vm.selectedProject.configurations[j];
                    ProjectFactory
                        .deleteConfiguration(configId).then(function(response){
                            vm.status = 'Configuration Deleted';
                        },function(error){
                            vm.status = 'Unable to delete configuration' +error.message;
                        });
                }
                // (Konrad) Makes sure that resources are reloaded.
                $window.location.href = '#/projects/';
            }, function(error){
                vm.status = 'Unable to delete project:' +error.message;
            });
    };

    vm.updateProject = function(){
        ProjectFactory.updateProject(vm.selectedProject)
            .then(function(response){
                vm.status = 'Project updated';
                $window.location.assign('#/projects/');
            }, function(error){
                vm.status = 'Unabl to update project: ' + error.message;
            });
    };

    vm.downloadPDF = function(){
        var repositoryName = 'MissionControl';
        var workspaceName = 'MissionControl_PDFCreator.fmw';
        var parameters= 'ProjectId=' + vm.projectId;

        FMEServer.runDataDownload(repositoryName, workspaceName, parameters, showResults);
    };

    function showResults(json){
        var downloadURL = json.serviceResponse.url;
        var downloadLink = angular.element('<a> HOK Mission Control - Download Project PDF </a>');
        downloadLink.attr('href',downloadURL);
        downloadLink[0].click();
    }
}
