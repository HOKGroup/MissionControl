angular.module('MissionControlApp').factory('UtilityService', UtilityService);

function UtilityService(){
    return {
        formatDuration: function (ms) {
            var seconds = (ms / 1000).toFixed(0);
            var minutes = (ms / (1000 * 60)).toFixed(0);
            var hours = (ms / (1000 * 60 * 60)).toFixed(0);
            var days = (ms / (1000 * 60 * 60 * 24)).toFixed(0);

            if (seconds < 60) {
                return seconds + "s";
            } else if (minutes < 60) {
                return minutes + "m";
            } else if (hours < 24) {
                return hours + "h";
            } else {
                return days + "d"
            }
        },

        formatNumber: function (bytes) {
            var thresh = 1024;
            if (Math.abs(bytes) < thresh) {
                return bytes + ' B';
            }
            var units = ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
            var u = -1;
            do {
                bytes /= thresh;
                ++u;
            } while (Math.abs(bytes) >= thresh && u < units.length - 1);
            return bytes.toFixed(0) + ' ' + units[u];
        }
    };
}
