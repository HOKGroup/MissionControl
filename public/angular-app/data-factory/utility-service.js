angular.module('MissionControlApp').factory('UtilityService', UtilityService);

function UtilityService(){
    return {
        /**
         * Used for color formatting by all badge objects in health reports.
         * @returns {{red: string, orange: string, green: string, grey: string}}
         */
        color: function(){
            return {
                red: 'badge progress-bar-danger',
                orange: "badge progress-bar-warning",
                green: "badge progress-bar-success",
                grey: "badge"
            }
        },

        /**
         * Formats number from double to int with % sign.
         * @param value
         * @returns {string}
         */
        formatPercentage: function (value) {
            return parseInt(value).toFixed(0) + '%';
        },

        /**
         * Formats time from ms to hh:mm:ss
         * @param ms
         * @returns {*}
         */
        formatDuration: function (ms) {
            if (ms <= 0) return "0s";

            var seconds = ms / 1000;
            var hours = parseInt(seconds / 3600).toFixed(0); // 3,600 seconds in 1 hour
            seconds = seconds % 3600; // seconds remaining after extracting hours
            var minutes = parseInt(seconds / 60).toFixed(0); // 60 seconds in 1 minute
            seconds = (seconds % 60).toFixed(0);

            var output = "";
            if (hours !== "0") output = hours + ":";
            if (minutes !== "0") output = output + minutes + ":";
            if (seconds !== "0") output = output + seconds;

            return output;
        },

        /**
         * Formats file size from bytes to KiB, MiB...
         * @param bytes
         * @returns {string}
         */
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

        /**
         * Extracts file name from file path assuming that extension is 3 letters.
         * @param path
         */
        fileNameFromPath: function (path) {
            if(!path) return;

            // (Konrad) We retrieve a file name with extension,
            // then remove the last 12 chars (_central.rvt)
            var fileName = path.replace(/^.*[\\\/]/, '');
            var hasCentral = fileName.match(/central/i);
            if(hasCentral){
                // let's slice -central.rvt
                return fileName.slice(0, -12);
            } else {
                // let's only slice the .rvt
                return fileName.slice(0, -4);
            }
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
            if (!order) order = 'asc';
            return function (a, b) {
                if (!a.hasOwnProperty(key) ||
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
        },

        componentToHex: function (c) {
            var hex = c.toString(16);
            return hex.length === 1 ? "0" + hex : hex;
        },

        rgbToHex : function (r, g, b) {
            return "#" + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
        },

        isEmptyObject : function (obj) {
            for(var prop in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, prop)) {
                    return false;
                }
            }
            return true;
        },

        /**
         * Formats Revit file paths to http safe parameter by replacing slashes with pipes.
         * @param centralPath
         * @returns {*}
         */
        getHttpSafeFilePath : function (centralPath){
            var isRevitServer = centralPath.match(/rsn:/i);
            var isBim360 = centralPath.match(/bim 360:/i);
            var rgx;
            if(isRevitServer || isBim360){
                rgx = centralPath.replace(/\//g, "|").toLowerCase();
            } else {
                rgx = centralPath.replace(/\\/g, "|").toLowerCase();
            }
            return rgx;
        },

        /**
         * Converts UTC time stored in DB to local time.
         * @param date
         * @returns {Date}
         */
        convertUTCDateToLocalDate : function convertUTCDateToLocalDate(date) {
            var newDate = new Date(date.getTime()+date.getTimezoneOffset()*60*1000);
            var offset = date.getTimezoneOffset() / 60;
            var hours = date.getHours();
            newDate.setHours(hours - offset);
            return newDate;
        }
    }
}
