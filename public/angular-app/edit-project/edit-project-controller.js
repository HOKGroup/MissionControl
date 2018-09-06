/**
 * Created by konrad.sobon on 2018-04-19.
 */
angular.module('MissionControlApp').controller('EditProjectController', EditProjectController);

function EditProjectController($routeParams, ProjectFactory, ConfigFactory, $window, SynchTimesFactory,
                               OpenTimesFactory, ngToast, UtilityService){
    var vm = this;
    var toasts = [];
    var filePaths = [];

    //region Init

    vm.status = '';
    vm.projectId = $routeParams.projectId;
    vm.selectedProject = {
        'address':{},
        'geoLocation':{},
        'geoPolygon':{}
    };
    vm.configurations = [];
    vm.chartData = [];
    vm.selectedRange = '7 days';
    vm.availableRanges = ['7 days', '14 days', '28 days', '84 days', 'All'];

    getOpenTimes(vm.projectId);

    //endregion

    /**
     *
     * @param item
     */
    vm.filterRange = function (item) {
        vm.selectedRange = item;
        var data = {
            centralPaths: filePaths,
            from: new Date(),
            to: new Date()
        };
        switch (item){
            case 'All':
                break;
            case '7 days':
                data.from = data.from.setDate(data.from.getDate() - 7);
                break;
            case '14 days':
                data.from = data.from.setDate(data.from.getDate() - 14);
                break;
            case '28 days':
                data.from = data.from.setDate(data.from.getDate() - 28);
                break;
            case '84 days':
                data.from = data.from.setDate(data.from.getDate() - 84);
                break;
        }

        if(item === 'All'){
            OpenTimesFactory.getAll(filePaths)
                .then(function (response) {
                    if(!response || response.status !== 201) throw response;

                    vm.openTimes = response.data;
                    return SynchTimesFactory.getByDate(data);
                })
                .then(function (response) {
                    if(!response || response.status !== 201) throw response;

                    setChartData(vm.openTimes, response.data);
                })
                .catch(function (err) {
                    console.log(err);
                    toasts.push(ngToast.danger({
                        dismissButton: true,
                        dismissOnTimeout: true,
                        timeout: 4000,
                        newestOnTop: true,
                        content: err.message
                    }));
                })
        } else {
            OpenTimesFactory.getByDate(data)
                .then(function (response) {
                    if(!response || response.status !== 201) throw response;

                    vm.openTimes = response.data;
                    return SynchTimesFactory.getByDate(data);
                })
                .then(function (response) {
                    if(!response || response.status !== 201) throw response;

                    setChartData(vm.openTimes, response.data);
                })
                .catch(function (err) {
                    console.log(err);
                    toasts.push(ngToast.danger({
                        dismissButton: true,
                        dismissOnTimeout: true,
                        timeout: 4000,
                        newestOnTop: true,
                        content: err.message
                    }));
                })
        }
    };

    /**
     * Deletes a project and all associated Configurations.
     * TODO: Do we need to delete all Sheets, Families, WorksetStats, ModelStats etc.
     * TODO: We could leave them here, and then potentially re-connect them if needed.
     */
    vm.deleteProject = function(){
        ProjectFactory.deleteProject(vm.selectedProject._id)
            .then(function(response) {
                if(!response || response.status !== 201) return;

                var configIds = vm.selectedProject.configurations;
                return ConfigFactory.deleteMany(configIds)
            })
            .then(function (response) {
                if(!response || response.status !== 201) return;

                //(Konrad) Reloads the resources so it should remove project from table.
                $window.location.href = '#/projects/';
            })
            .catch(function (err) {
                console.log(err);
                vm.status = 'Unable to delete Project and its Configurations: ' + err.message;
            });
    };

    /**
     * Updates project information.
     */
    vm.updateProject = function(){
        ProjectFactory.updateProject(vm.selectedProject)
            .then(function(response){
                if(!response || response.status !== 202) return;

                vm.status = 'Project updated';
                $window.location.assign('#/projects/');
            })
            .catch(function (err) {
                console.log(err.message);
                vm.status = 'Unable to update Project: ' + err.message;
            });
    };

    /**
     * Checks that all required fields are filled out.
     * @returns {boolean}
     */
    vm.verifyForm = function () {
        return !vm.selectedProject.number || !vm.selectedProject.name || vm.selectedProject.name.length > 35 || !vm.selectedProject.office;
    };

    /**
     * Returns to projects page.
     */
    vm.cancel = function () {
        $window.location.href = '#/projects/';
    };

    //region Utilities

    /**
     *
     * @param projectId
     */
    function getOpenTimes(projectId) {
        ProjectFactory.getProjectByIdPopulateConfigurations(projectId)
            .then(function(response){
                if(!response || response.status !== 200) throw response;

                vm.selectedProject = response.data;
                vm.configurations = response.data.configurations;

                filePaths = vm.configurations.map(function (config) {
                    return config.files.map(function (path) {
                        return path.centralPath;
                    });
                }).reduce(function (acc, val) {
                    return acc.concat(val);
                });

                return OpenTimesFactory.getAll(filePaths);
            })
            .then(function (response) {
                if(!response || response.status !== 201) throw response;

                vm.openTimes = response.data;
                return SynchTimesFactory.getAll(filePaths);
            })
            .then(function (response) {
                if(!response || response.status !== 201) throw response;

                setChartData(vm.openTimes, response.data);
            })
            .catch(function (err) {
                console.log(err);
                toasts.push(ngToast.danger({
                    dismissButton: true,
                    dismissOnTimeout: true,
                    timeout: 4000,
                    newestOnTop: true,
                    content: err.message
                }));
            });
    }

    /**
     *
     * @param openTimes
     * @param synchTimes
     */
    function setChartData(openTimes, synchTimes) {
        var data = synchTimes.reduce(function (data, item) {
            var key = UtilityService.fileNameFromPath(item.centralPath).toUpperCase();
            var created = (data[key] || (data[key] = {'name': key, 'opened': 0, 'synched': 0, 'total': 0}));
            created['synched'] += 1;
            created['total'] += 1;

            return data;
        }, {});

        var data1 = openTimes.reduce(function (data, item) {
            var key = UtilityService.fileNameFromPath(item.centralPath).toUpperCase();
            var created = (data[key] || (data[key] = {'name': key, 'opened': 0, 'synched': 0, 'total': 0}));
            created['opened'] += 1;
            created['total'] += 1;

            return data;
        }, data);

        // (Konrad) Set data for the histogram chart. IE doesn't support Object.values
        vm.chartData = Object.keys(data1).map(function(item) { return data1[item]; });
    }

    //endregion
}
