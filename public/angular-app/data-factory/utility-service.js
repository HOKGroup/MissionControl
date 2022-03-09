angular.module('MissionControlApp').factory('UtilityService', UtilityService);

function UtilityService() {
    return {
        /**
         * Method for obtaining an array of available User Location options. 
         * This should match what we have in Settings Schema/Mongoose.
         */
        tempLocationsOptions: function () {
            return ['MachineName'];
        },

        /**
         * Method for obtaining an array of available User Location options. 
         * This should match what we have in Settings Schema/Mongoose.
         */
        userLocationsOptions: function () {
            return ['MachineName'];
        },

        /**
         * 
         */
        projectInfoSources: function () {
            return ['FilePath'];
        },

        /**
         * Used for color formatting by all badge objects in health reports.
         * @returns {{red: string, orange: string, green: string, grey: string}}
         */
        color: function () {
            return {
                red: 'badge progress-bar-danger',
                orange: 'badge progress-bar-warning',
                green: 'badge progress-bar-success',
                grey: 'badge'
            };
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
            if (ms <= 0) return '0s';

            var seconds = ms / 1000;
            var hours = parseInt(seconds / 3600).toFixed(0); // 3,600 seconds in 1 hour
            seconds = seconds % 3600; // seconds remaining after extracting hours
            var minutes = parseInt(seconds / 60).toFixed(0); // 60 seconds in 1 minute
            seconds = (seconds % 60).toFixed(0);

            var output = '';
            if (hours !== '0') output = hours + 'h:';
            if (minutes !== '0') output = output + minutes + 'm:';
            if (seconds !== '0') output = output + seconds + 's';

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
            if (!path) return;

            // (Konrad) We retrieve a file name with extension,
            // then remove the last 12 chars (_central.rvt)
            var fileName = path.replace(/^.*[\\\/]/, '');
            var hasCentral = fileName.match(/central/i);
            if (hasCentral) {
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

        charRange: function (start, step, count) {
            var data = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
            var startIndex = data.indexOf(start);
            var range = [];
            for (var i = 0; i < count; i++) {
                range.push(data[startIndex + (i * step)]);
            }
            return range;
        },

        move: function (array, from, to) {
            array.splice(to, 0, array.splice(from, 1)[0]);
        },

        componentToHex: function (c) {
            var hex = c.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        },

        rgbToHex: function (r, g, b) {
            return '#' + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
        },

        isEmptyObject: function (obj) {
            for (var prop in obj) {
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
        getHttpSafeFilePath: function (centralPath) {
            var isRevitServer = centralPath.match(/rsn:/i);
            var isBim360 = centralPath.match(/bim 360:/i);
            var rgx;
            if (isRevitServer || isBim360) {
                rgx = centralPath.replace(/\//g, '|').toLowerCase();
            } else {
                rgx = centralPath.replace(/\\/g, '|').toLowerCase();
            }
            return rgx;
        },

        /**
         * Converts UTC time stored in DB to local time.
         * @param date
         * @returns {Date}
         */
        convertUTCDateToLocalDate: function convertUTCDateToLocalDate(date) {
            var newDate = new Date(date.getTime() + date.getTimezoneOffset() * 60 * 1000);
            var offset = date.getTimezoneOffset() / 60;
            var hours = date.getHours();
            newDate.setHours(hours - offset);
            return newDate;
        },

        /**
         * Retrieves a list of all Revit versions that we support.
         * @returns {[string,string,string,string,string,string]}
         */
        getRevitVersions: function () {
            return ['All', '2017', '2018', '2019', '2020', '2021', '2022'];
        }
    };
}
