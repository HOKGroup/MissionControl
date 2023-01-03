const Global = {
    io : {},
    utilities: {
        /**
         * Utility method for converting URI strings into central file paths.
         * @param uri
         * @returns {*}
         */
        uriToString: function (uri) {
            // (Konrad) Since we cannot pass file path with "\" they were replaced with illegal pipe char "|".
            // (Konrad) RSN and A360 paths will have forward slashes instead of back slashes.
            const isRevitServer = uri.match(/rsn:/i)
            const isCloudModel = uri.match(/^(?!rsn).*:[\\|]{2}/i)

            let rgx
            if (isRevitServer || isCloudModel) {
                rgx = uri.replace(/\|/g, '/').toLowerCase()
            } else {
                rgx = uri.replace(/\|/g, '\\').toLowerCase()
            }

            return rgx
        }
    }
}    
module.exports = Global