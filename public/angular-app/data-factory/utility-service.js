angular.module('MissionControlApp').factory('UtilityService', UtilityService);

function UtilityService(){
    return {
        formatDuration: function (ms) {
            if(ms <= 0) return "0s";

            var seconds = ms / 1000;
            var hours = parseInt(seconds / 3600).toFixed(0); // 3,600 seconds in 1 hour
            seconds = seconds % 3600; // seconds remaining after extracting hours
            var minutes = parseInt(seconds / 60).toFixed(0); // 60 seconds in 1 minute
            seconds = (seconds % 60).toFixed(0);

            var output = "";
            if(hours !== "0") output = hours + "h:";
            if(minutes !== "0") output = output + minutes + "m:";
            if(seconds !== "0") output = output + seconds + "s";

            return output;
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
            return bytes.toFixed(1) + units[u];
        }
    };
}
