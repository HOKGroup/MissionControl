/**
 * Created by konrad.sobon on 2018-04-19.
 */
angular.module('MissionControlApp').controller('EditProjectController', EditProjectController);

function EditProjectController($routeParams, $window, ProjectFactory, ConfigFactory, ModelsFactory, ngToast, UtilityService){
    var vm = this;
    var toasts = [];
    var filePaths = []; // variable holding file paths for filter
    var queryData = {}; // variable holding date range for filter

    //region Init

    vm.projectId = $routeParams.projectId;
    vm.selectedProject = {
        'address':{},
        'geoLocation':{},
        'geoPolygon':{}
    };
    vm.configurations = [];
    vm.selectedRange = '7 days';
    vm.availableRanges = ['7 days', '14 days', '28 days', '84 days', 'All'];
    vm.loading = false;

    getOpenTimes(vm.projectId);

    //endregion

    /**
     * Filter for activity chart that queries additional data by date range.
     * @param item
     */
    vm.filterRange = function (item) {
        if(vm.selectedRange === item) return;

        vm.loading = true;
        vm.selectedRange = item;
        queryData = {
            centralPaths: filePaths,
            from: new Date(),
            to: new Date()
        };
        switch (item){
            case 'All':
                break;
            case '7 days':
                queryData.from = queryData.from.setDate(queryData.from.getDate() - 7);
                break;
            case '14 days':
                queryData.from = queryData.from.setDate(queryData.from.getDate() - 14);
                break;
            case '28 days':
                queryData.from = queryData.from.setDate(queryData.from.getDate() - 28);
                break;
            case '84 days':
                queryData.from = queryData.from.setDate(queryData.from.getDate() - 84);
                break;
        }

        if(item === 'All'){
            ModelsFactory.getall(queryData)
                .then(function (response) {
                    if(!response || response.status !== 201) throw { message: 'Failed to get data.' };

                    if(response.data[0].opentimes.length === 0 && response.data[0].synchtimes.length === 0){
                        toasts.push(ngToast.warning({
                            dismissButton: true,
                            dismissOnTimeout: true,
                            timeout: 4000,
                            newestOnTop: true,
                            content: 'No activity at all.'
                        }));
                    }

                    setAllData(response.data[0].opentimes, response.data[0].synchtimes);
                })
                .catch(function (err) {
                    toasts.push(ngToast.danger({
                        dismissButton: true,
                        dismissOnTimeout: true,
                        timeout: 4000,
                        newestOnTop: true,
                        content: err.message
                    }));
                });
        } else {
            ModelsFactory.getByDate(queryData)
                .then(function (response) {
                    if(!response || response.status !== 201) throw { message: 'Failed to get data.' };

                    if(response.data[0].opentimes.length === 0 && response.data[0].synchtimes.length === 0){
                        toasts.push(ngToast.warning({
                            dismissButton: true,
                            dismissOnTimeout: true,
                            timeout: 4000,
                            newestOnTop: true,
                            content: 'No activity in more than ' + item + '.'
                        }));
                    }

                    setAllData(response.data[0].opentimes, response.data[0].synchtimes);
                })
                .catch(function (err) {
                    toasts.push(ngToast.danger({
                        dismissButton: true,
                        dismissOnTimeout: true,
                        timeout: 4000,
                        newestOnTop: true,
                        content: err.message
                    }));
                });
        }

        vm.loading = false;
    };

    /**
     * Deletes a project and all associated Configurations.
     */
    vm.deleteProject = function(){
        ProjectFactory.deleteProject(vm.selectedProject._id)
            .then(function(response) {
                if(!response || response.status !== 201) throw { message: 'Unable to delete Project.'};

                var configIds = vm.selectedProject.configurations;
                return ConfigFactory.deleteMany(configIds);
            })
            .then(function (response) {
                if(!response || response.status !== 201) throw { message: 'Unable to delete Configurations.'};

                //(Konrad) Reloads the resources so it should remove project from table.
                $window.location.href = '#/projects/';
            })
            .catch(function (err) {
                toasts.push(ngToast.danger({
                    dismissButton: true,
                    dismissOnTimeout: true,
                    timeout: 4000,
                    newestOnTop: true,
                    content: err.message
                }));
            });
    };

    /**
     * Updates project information.
     */
    vm.updateProject = function(){
        ProjectFactory.updateProject(vm.selectedProject)
            .then(function(response){
                if(!response || response.status !== 202) throw { message: 'Unable to update Project.' };

                toasts.push(ngToast.success({
                    dismissButton: true,
                    dismissOnTimeout: true,
                    timeout: 4000,
                    newestOnTop: true,
                    content: 'Project updated.'
                }));

                $window.location.assign('#/projects/');
            })
            .catch(function (err) {
                toasts.push(ngToast.danger({
                    dismissButton: true,
                    dismissOnTimeout: true,
                    timeout: 4000,
                    newestOnTop: true,
                    content: err.message
                }));
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
     * Retrieves Project and Configurations, then sets initial project activity data.
     * @param projectId
     */
    function getOpenTimes(projectId) {
        ProjectFactory.getProjectByIdPopulateConfigurations(projectId)
            .then(function(response){
                if(!response || response.status !== 200) throw { message: 'Failed to get Project.' };
                vm.selectedProject = response.data;
                vm.configurations = response.data.configurations;

                if(response.data.configurations.length === 0) throw { message: 'Project does not have a Configuration.' };
                filePaths = vm.configurations.map(function (config) {
                    return config.files.map(function (path) {
                        return path.centralPath;
                    });
                }).reduce(function (acc, val) {
                    return acc.concat(val);
                });

                // (Konrad) Set date range filter to query data for last 7 days
                queryData = {
                    centralPaths: filePaths,
                    from: new Date(),
                    to: new Date()
                };
                queryData.from = queryData.from.setDate(queryData.from.getDate() - 7);

                return ModelsFactory.getByDate(queryData);
            })
            .then(function (response) {
                if(!response || response.status !== 201) throw { message: 'Failed to get data.' };

                if(response.data[0].opentimes.length === 0 && response.data[0].synchtimes.length === 0){
                    toasts.push(ngToast.warning({
                        dismissButton: true,
                        dismissOnTimeout: true,
                        timeout: 4000,
                        newestOnTop: true,
                        content: 'No activity in more than 7 days.'
                    }));
                }

                setAllData(response.data[0].opentimes, response.data[0].synchtimes);
            })
            .catch(function (err) {
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
     * @param ot
     * @param st
     */
    function setAllData(ot, st){
        var activity = {};
        var users = {};
        st.forEach(function (item) {
            var aKey = UtilityService.fileNameFromPath(item.centralPath).toUpperCase();
            var a = (activity[aKey] || (activity[aKey] = {'name': aKey, 'opened': 0, 'synched': 0, 'total': 0}));
            a.synched += 1;
            a.total += 1;

            var uKey = item.user.toLowerCase();
            var u = (users[uKey] || (users[uKey] = {'name': uKey, 'opened': 0, 'synched': 0, 'total': 0}));
            u.synched += 1;
            u.total += 1;
        });

        ot.forEach(function (item) {
            var aKey = UtilityService.fileNameFromPath(item.centralPath).toUpperCase();
            var a = (activity[aKey] || (activity[aKey] = {'name': aKey, 'opened': 0, 'synched': 0, 'total': 0}));
            a.opened += 1;
            a.total += 1;

            var uKey = item.user.toLowerCase();
            var u = (users[uKey] || (users[uKey] = {'name': uKey, 'opened': 0, 'synched': 0, 'total': 0}));
            u.opened += 1;
            u.total += 1;
        });

        if(users.hasOwnProperty('unknown')){
            vm.unknownUserData = users['unknown'];
            delete users['unknown'];
        } else {
            vm.unknownUserData = {'name': 'unknown', 'opened': 0, 'synched': 0, 'total': 0};
        }

        vm.userData = Object.keys(users).map(function(item) { return users[item]; });
        vm.chartData = Object.keys(activity).map(function(item) { return activity[item]; });
    }

    //endregion
}
