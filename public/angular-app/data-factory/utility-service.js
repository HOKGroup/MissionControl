angular.module('MissionControlApp').factory('UtilityService', UtilityService);

function UtilityService(){
    return {
        formatPercentage: function (value) {
            return parseInt(value).toFixed(0) + '%';
        },

        formatDuration: function (ms) {
            if (ms <= 0) return "0s";

            var seconds = ms / 1000;
            var hours = parseInt(seconds / 3600).toFixed(0); // 3,600 seconds in 1 hour
            seconds = seconds % 3600; // seconds remaining after extracting hours
            var minutes = parseInt(seconds / 60).toFixed(0); // 60 seconds in 1 minute
            seconds = (seconds % 60).toFixed(0);

            var output = "";
            if (hours !== "0") output = hours + "h:";
            if (minutes !== "0") output = output + minutes + "m:";
            if (seconds !== "0") output = output + seconds + "s";

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
        },

        fileNameFromPath: function (path) {
            if (!path) return;
            return path.replace(/^.*[\\\/]/, '').slice(0, -4); //removed file extension
        },

        range: function (start, step, count) {
            var range = [];
            for (var i = 0; i < count; i++) {
                range.push(start + (i * step));
            }
            return range;
        },

        charRange: function(start, step, count){
            var data = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
            var startIndex = data.indexOf(start);
            var range = [];
            for (var i = 0; i < count; i++){
                range.push(data[startIndex + (i * step)]);
            }
            return range;
        },

        move: function(array, from, to) {
            array.splice(to, 0, array.splice(from, 1)[0]);
        },

        componentToHex: function (c) {
            var hex = c.toString(16);
            return hex.length === 1 ? "0" + hex : hex;
        },

        rgbToHex : function (r, g, b) {
            return "#" + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
        }
    }
}
