/**
 * Created by konrad.sobon on 2018-04-19.
 */
angular.module('MissionControlApp').controller('ProjectController', ProjectController);

function ProjectController(ProjectFactory, $location, DTColumnDefBuilder){
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
     * Initiates DataTables options.
     */
    function createTable() {
        vm.dtOptions = {
            paginationType: 'simple_numbers',
            lengthMenu: [[25, 50, 100, -1], [25, 50, 100, 'All']],
            order: [[0, 'desc']]
        };

        vm.dtColumnDefs = [
            DTColumnDefBuilder.newColumnDef(0), //number
            DTColumnDefBuilder.newColumnDef(1), //name
            DTColumnDefBuilder.newColumnDef(2), //office
            DTColumnDefBuilder.newColumnDef(3) //address
        ];
    }

    //endregion
}