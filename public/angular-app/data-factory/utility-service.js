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

        guid: function () {
            function gen(count) {
                var out = "";
                for (var i=0; i<count; i++) {
                    out += (((1+Math.random())*0x10000)|0).toString(16).substring(1);
                }
                return out;
            }

            return [gen(2), gen(1), gen(1), gen(1), gen(3)].join("-");
        },

        removeDuplicates: function (arr, key) {
            var values = {};
            return arr.filter(function(item){
                var val = item[key];
                var exists = values[val];
                values[val] = true;
                return !exists;
            });
        },

        /**
         * Converts binary array buffer to base64 encoded string.
         * @param buffer
         * @returns {string}
         */
        arrayBufferToBase64: function arrayBufferToBase64(buffer) {
            var binary = '';
            var bytes = new Uint8Array(buffer);
            var len = bytes.byteLength;
            for (var i = 0; i < len; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            return window.btoa(binary);
        },

        validateEmail: function validateEmail(email) {
            var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(String(email).toLowerCase());
        },

        compareValues: function compareValues(key, order) {
            if(!order) order = 'asc';
            return function(a, b) {
                if(!a.hasOwnProperty(key) ||
                    !b.hasOwnProperty(key)) {
                    return 0;
                }

                const varA = (typeof a[key] === 'string') ?
                    a[key].toUpperCase() : a[key];
                const varB = (typeof b[key] === 'string') ?
                    b[key].toUpperCase() : b[key];

                var comparison = 0;
                if (varA > varB) {
                    comparison = 1;
                } else if (varA < varB) {
                    comparison = -1;
                }
                return (
                    (order === 'desc') ?
                        (comparison * -1) : comparison
                );
            };
        }
    }
}
