/**
 * Created by konrad.sobon on 2018-04-19.
 */
angular.module('MissionControlApp').controller('ProjectController', ProjectController);

function ProjectController(ProjectFactory, ModelsFactory, UtilityService, $location, $compile, $scope, DTOptionsBuilder, DTColumnBuilder){
    var vm = this;
    vm.projects = null;

    getProjects();

    /**
     * Navigates to project page.
     * @param path
     */
    vm.go = function(path){
        $location.path(path);
    };

    //region Utilities

    /**
     * Retrieves projects from the DB.
     */
    function getProjects() {
        ProjectFactory.getProjects()
            .then(function (response) {
                if(!response || response.status !== 200) return;

                vm.projects = response.data;
                createTable();
            })
            .catch(function (err) {
                console.log('Unable to load project data: ' + err.message);
            });
    }

    /**
     * Creates Warnings Table
     */
    function createTable() {
        vm.dtInstance = {};
        vm.dtOptions = DTOptionsBuilder.newOptions()
            .withOption('ajax', {
                url: '/api/v2/projects/datatable',
                type: 'POST'
            })
            .withDataProp('data')
            .withOption('processing', true)
            .withOption('serverSide', true)
            .withPaginationType('simple_numbers')
            .withOption('autoWidth', false)
            .withOption('lengthMenu', [[15, 50, 100, -1], [15, 50, 100, 'All']])
            .withOption('createdRow', function(row) {
                // (Konrad) Recompiling so we can bind Angular directive to the DT
                $compile(angular.element(row).contents())($scope);
            });

        vm.dtColumns = [
            DTColumnBuilder.newColumn('number')
                .withTitle('Project Number')
                .withOption('width', '15%')
                .renderWith(function (data, type, full) {
                    return '<div ng-click="vm.go(\'/projects/edit/' + full._id + '\')">' + full.number +'</div>';
                }),
            DTColumnBuilder.newColumn('name')
                .withTitle('Project Name')
                .withOption('width', '45%')
                .renderWith(function (data, type, full) {
                    return '<div ng-click="vm.go(\'/projects/edit/' + full._id + '\')">' + full.name +'</div>';
                }),
            DTColumnBuilder.newColumn('office')
                .withTitle('Office')
                .withOption('width', '10%')
                .withOption('className', 'text-center')
                .renderWith(function (data, type, full) {
                    return '<div ng-click="vm.go(\'/projects/edit/' + full._id + '\')">' + full.office +'</div>';
                }),
            DTColumnBuilder.newColumn('address')
                .withTitle('Project Address')
                .withOption('width', '15%')
                .renderWith(function (data, type, full) {
                    return '<div ng-click="vm.go(\'/projects/edit/' + full._id + '\')">' + full.address.city + ', ' + full.address.state +'</div>';
                }),
            DTColumnBuilder.newColumn('activity')
                .withTitle('Activity')
                .withOption('width', '15%')
                .renderWith(function (data, type, full) {
                    console.log(full);
                    return '<div>Activity</div>';
                })
        ];
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

        console.log(vm.userData);
    }

    //endregion
}