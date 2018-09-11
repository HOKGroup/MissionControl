// /**
//  * Created by konrad.sobon on 2018-04-26.
//  */
// angular.module('MissionControlApp').factory('WorksetsFactory', WorksetsFactory);
//
// function WorksetsFactory($http){
//     return {
//         updateFilePath: function updateFilePath(id, data){
//             return $http.put('/api/v2/worksets/' + id + '/updatefilepath', data).then(complete).catch(failed);
//         },
//
//         getWorksetStats: function getWorksetStats(data) {
//             return $http.post('/api/v2/worksets/worksetstats', data).then(complete).catch(failed);
//         }
//     };
//
//     function complete(response) {
//         return response;
//     }
//
//     function failed(error) {
//         console.log(error.statusText);
//         return error;
//     }
// }