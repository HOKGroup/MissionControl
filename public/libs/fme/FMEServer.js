/*****************************************************************************
 * FMEServer.js
 * 2013 Safe Software
 * support@safe.com
 *
 * Unofficial JavaScript Library for FME Server >= 2014. This is not intended to
 * be a complete API like the C++, C# and Java APIs, but rather a collection
 * of boilerplate methods for REST API calls typically needed in a web page
 * interfacing with FME Server.
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2013 Safe Software
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 *****************************************************************************/

/**
 * FME Server Library
 * @author Safe Software
 * @version 1.1
 * @this FMEServer
 * @return {FMEServer} fme - FME Server connection object
 */
var FMEServer = ( function() {
    /**
     * Add indexOf and trim method for Strings and Array's in older browsers
     */
    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function(obj, start) {
            for (var i = (start || 0), j = this.length; i < j; i++) {
                if (this[i] === obj) { return i; }
            }
            return -1;
        };
    }
    
    if (typeof String.prototype.trim !== 'function') {
        String.prototype.trim = function() {
            return this.replace(/^\s+|\s+$/g, ''); 
        };
    }

    /**
     * Configuration object, holds instance configuration
     */
    var config = { version : 'v2' };

    /**
     * Get Configuration Method
     * @param {String} name - Name of setting
     * @return {String} - individual parameter, or {Object} - config
     */
    function getConfig(param) {
        param = param || null;
        if (param) {
            return config[param];
        }
        return config;
    }

    /**
     * Get Simple Response Type
     * @return {String} - The extracted simple accept type from the config
     */
    function getResponseType() {
        var type = getConfig('accept'),
            accept = 'json';
        if (type.indexOf('/') !== -1) {
            type = type.split(/\//g);
            if (type[1].length > 0) {
                accept = type[1];
            }
        }
        return accept;
    }

    /**
     * Check Config Status
     */
    function checkConfig() {
        if(getConfig('server') && getConfig('token')){
            return true;
        }
        throw new Error('You must initialize FMEServer using the FMEServer.init() method.');
    }

    /**
     * AJAX Method
     * @param {String} url - The request URL
     * @param {Function} callback - Callback function accepting json response
     * @param {String} rtyp - Type of request ex: PUT, GET(Default)
     * @param {String} params - The json or name=value pair string or parameters
     * @param {String} ctyp - Content type as a string (optional)
     * @param {String} atyp - Accept type as a string (optional)
     */
    function ajax(url, callback, rtyp, params, ctyp, atyp) {
        if (checkConfig()) {
            if(callback === null || typeof callback != 'function') {
                throw new Error('A callback function must be defined in order to use the FME Server REST API.');
            }
            var req;
            rtyp = rtyp || 'GET';
            params = params || null;
            ctyp = ctyp || null;
            atyp = atyp || getConfig('accept');
            
            if (url.indexOf('?') != -1) {
                url += '&detail=' + getConfig('detail');
            } else {
                url += '?detail=' + getConfig('detail');
            }

            if (getConfig('xdomain')) {
                if (rtyp == 'GET') {
                    req = new XDomainRequest();
                    url += '&token=' + getConfig('token');
                    req.open(rtyp, url);
                    req.onload = function() {
                        var resp;
                        resp = req.responseText;
                        try {
                            resp = JSON.parse(resp);
                        } catch (e) {
                            // Not a JSON response
                        } finally {
                            callback(resp);
                        }
                    };
                    req.send();
                } else {
                    throw new Error('IE8 and IE9 Only support CORS requests through GET methods. Only partial functionality is available.');
                }
            } else {
                req = new XMLHttpRequest();
                req.open(rtyp, url, true);
                req.setRequestHeader('Authorization', 'fmetoken token='+getConfig('token'));

                if (atyp !== null) {
                    req.setRequestHeader('Accept', atyp);
                }
                if (ctyp !== null && ctyp != 'attachment') {
                    req.setRequestHeader('Content-type', ctyp);
                }
                if (ctyp == 'attachment') {
                    req.setRequestHeader('Content-type', 'application/octet-stream');
                    req.setRequestHeader('Content-Disposition', 'attachment; filename="'+params.name+'"');
                    params = params.contents;
                }

                req.onreadystatechange = function() {
                    var done = 4;
                    if (req.readyState == done) {
                        var resp;
                        try {
                            resp = req.responseText;
                            if (resp.length === 0 && req.status == 204) {
                                resp = '{ "delete" : "true" }';
                            } else if (resp.length === 0 && req.status == 202) {
                                resp = '{ "value" : "true" }';
                            }
                            resp = JSON.parse(resp);
                        } catch (e) {
                            resp = req.response;
                        } finally {
                            callback(resp);
                        }
                    }
                };
                req.send(params);
            }
        }
    }

    /**
     * Build URL from config Method.
     * @param {String} url - URL with placeholders
     * @return {String} url - The result url
     */
    function buildURL(url) {
        url = url.replace(/{{svr}}/g, getConfig('server'));
        url = url.replace(/{{ver}}/g, getConfig('version'));
        return url;
    }

    // The FME Server Connection Object
    var fme = {
        
        /**
         * Initialize the FME Server connection object
         * @param {Object} config - The object holding the configuration
         *      { server : server_url,
         *        token : token_string,
         *        format : json_xml_or_http,
         *        detail : high_or_low,
         *        port : port_number_string,
         *        ssl : true_or_false
         *      }
         * -------------------- OR: LEGACY PARAMETERS BELOW --------------------
         * @param {String} server - Server URL
         * @param {String} token - Obtained from http://yourfmeserver/fmetoken
         * @param {String} format - Output format desired, json (default), xml, or html
         * @param {String} detail - high (default) or low
         * @param {Number} port - Port, default is 80 - string
         * @param {Boolean} ssl - Connect to the server via HTTPS
         */
        init : function(server, token, format, detail, port, ssl) {
            /**
             * Check for the server url and the token parameters - required for connection
             * @return null - if not valid
             */
            if (server === undefined || (typeof server === 'object' && server.server === undefined)) {
                throw new Error('You did not specify a server URL in your configuration paramaters.');
            } else if (token === undefined && (typeof server === 'object' && server.token === undefined)) {
                throw new Error('You did not specify a token in your configuration paramaters.');
            }

            /**
             * Check for String paramaters vs. object, and build the configuration
             */
            if (typeof server == 'object') {
                getConfig().server = server.server;
                getConfig().token = server.token;
                getConfig().accept = server.format || 'application/json';
                getConfig().detail =  server.detail || 'high';
                getConfig().port = server.port || '80';
                getConfig().ssl = server.ssl || false;
                getConfig().xdomain = false;
            } else {
                getConfig().server = server;
                getConfig().token = token;
                getConfig().accept = format || 'application/json';
                getConfig().detail =  detail || 'high';
                getConfig().port = port || '80';
                getConfig().ssl = ssl || false;
                getConfig().xdomain = false;
            }

            /**
             * Remove trailing slash from sever if present
             */
            if (getConfig('server').charAt(getConfig('server').length - 1) == '/') {
                getConfig().server = getConfig('server').substr(0, getConfig('server').length - 1);
            }

            /**
             * Converts server host to URL
             */
            if (getConfig('server').substring(0, 4) != 'http') {
                getConfig().server = 'http://' + getConfig('server');
            }

            /**
             * Changes http:// to https:// if SSL is required
             */
            if (getConfig('ssl')) {
                getConfig().server = getConfig('server').replace('http://','https://');
            }

            /**
             * Set IE8 / IE9 CORS mode if required
             */
            if (location.host != getConfig('server').split('//')[1].split('/')[0] &&
                navigator.appName == 'Microsoft Internet Explorer' &&
                (navigator.appVersion.indexOf('MSIE 9') !== -1 || navigator.appVersion.indexOf('MSIE 8') !== -1)
               )
            {
                getConfig().xdomain = true;
            }

            /**
             * Attaches port to server URL if not a standard port
             */
            var stdPorts = ['80', '443'];
            if (stdPorts.indexOf(getConfig('port')) === -1) {
                getConfig().server = getConfig('server') + ':' + getConfig('port');
            }
        },

        /**
         * Gets the current session from FME Server. You can use this to get the path to any
         * files added through the file upload service.
         * @param {String} repository - The repository on the FME Server
         * @param {String} workspace - The name of the workspace on FME Server, i.e. workspace.fmw
         * @param {Function} callback - Callback function accepting sessionID as a string
         */
        getSession : function(repository, workspace, callback){
            callback = callback || null;
            var url = buildURL('{{svr}}/fmedataupload/' + repository + '/' + workspace);
            var params = 'opt_extractarchive=false&opt_pathlevel=3&opt_fullpath=true&token=' + getConfig('token');
            ajax(url, callback, 'POST', params, 'application/x-www-form-urlencoded');
        },

        /**
         * Returns a WebSocket connection to the specified server
         * @param {String} id - A name for the desired WebSocket stream id
         * @param {Function} callback - Callback function to run after connection is opened (optional)
         * @return {WebSocket} ws - A WebSocket connection
         */
        getWebSocketConnection : function(id, callback) {
            callback = callback || null;
            var url;
            if (getConfig('server').indexOf('https://') != -1) {
                url = getConfig('server').replace('https://','wss://');
            } else {
                url = getConfig('server').replace('http://','ws://');
            }
            var ws = new WebSocket(url + ':7078/websocket');
            ws.onopen = function() {
                var openMsg = {
                    ws_op : 'open',
                    ws_stream_id : id
                };
                ws.send(JSON.stringify(openMsg));
                if (callback !== null){
                    callback();
                }
            };
            return ws;
        },

        /**
         * Runs a workspace using the Data Download service and returns json
         * @param {String} repository - The repository on the FME Server
         * @param {String} workspace - The name of the workspace on FME Server, i.e. workspace.fmw
         * @param {String} params - Any workspace-specific parameter values
         * @param {Function} callback - Callback function accepting the json return value
         */
        runDataDownload : function(repository, workspace, params, callback){
            callback = callback || null;
            var url = buildURL('{{svr}}/fmedatadownload/' + repository + '/' + workspace);
            if (params && params.length > 0) {
                params = '&' + params;
            }
            params = 'opt_responseformat=' + getResponseType() + '&opt_showresult=true&token=' + getConfig('token') + params;
            ajax(url, callback, 'POST', params, 'application/x-www-form-urlencoded');
        },

        /**
         * Runs a workspace using the Data Streaming service and returns the workspace output
         * @param {String} repository - The repository on the FME Server
         * @param {String} workspace - The name of the workspace on FME Server, i.e. workspace.fmw
         * @param {String} params - Any workspace-specific parameter values
         * @param {Function} callback - Callback function accepting the workspace return value
         */
        runDataStreaming : function(repository, workspace, params, callback){
            callback = callback || null;
            var url = buildURL('{{svr}}/fmedatastreaming/' + repository + '/' + workspace);
            params = 'opt_showresult=true&token=' + getConfig('token') + '&' + params;
            ajax(url, callback, 'POST', params, 'application/x-www-form-urlencoded');
        },

        /**
         * Upload file(s) using data upload legacy service
         * @param {String} repository - The repository on the FME Server
         * @param {String} workspace - The name of the workspace on FME Server, i.e. workspace.fmw
         * @param {Object} files - The form file object
         * @param {String} jsid - The current session id
         * @param {Function} callback - Callback function accepting the json return value
         */
        dataUpload : function(repository, workspace, files, jsid, callback) {
            callback = callback || null;
            jsid = jsid || null;
            var url = buildURL('{{svr}}/fmedataupload/' + repository + '/' + workspace);
            var token = getConfig('token');
            if(jsid !== null) {
                url += ';jsessionid=' + jsid;
            }
            if(!FormData) { // IE9 and Older Browsers that don't support FormData
                
                // Random number for form and frame id
                var random = parseInt(Math.random() * 100000000);
                
                // Create the invisible iframe for the form target
                var iframe = document.createElement('iframe');
                iframe.id = random + '-frame';
                iframe.name = random;
                iframe.style.display = 'none';
                document.body.appendChild(iframe);

                // Create the form with the proper settings and set the target to the iframe
                var form = document.createElement('form');
                form.action = url + '?token=' + token;
                form.method = 'POST';
                form.enctype = 'multipart/form-data';

                // Clone the file input and set it's files
                var input = files.cloneNode(true);
                input.name = "files[]";
                input.files = files.files;
                form.appendChild(input);

                // Finish styling and submit the form
                form.target = random;
                form.id = random + '-form';
                form.style.display = 'none';
                document.body.appendChild(form);
                form.submit();

                // Send feedback for client methods
                callback({ submit : true, id : random });

            } else { // New HTML5 Method for browsers that support FormData
                
                // Chrome 7+, Firefox 4.0 (2.0), IE 10+, Opera 12+, Safari 5+
                var params = new FormData();
                
                // Loop through, support for multiple files
                for(var i = 0; i < files.files.length; i++) {
                    params.append('files[]', files.files[i]);
                }

                params.append('token', token);
                ajax(url, callback, 'POST', params);
            }
        },

        /**
         * Get data upload files for the session
         * @param {String} repository - The repository on the FME Server
         * @param {String} workspace - The name of the workspace on FME Server, i.e. workspace.fmw
         * @param {String} jsid - The current session id
         * @param {Function} callback - Callback function accepting the json return value
         */
        getDataUploads : function(repository, workspace, jsid, callback) {
            callback = callback || null;
            jsid = jsid || null;
            var url = buildURL('{{svr}}/fmedataupload/' + repository + '/' + workspace + ';jsessionid=' + jsid);
            ajax(url, callback);
        },
        
        /**
         * Runs a workspace with user uploaded session data
         * @param {String} path - The server path for the session
         * @param {Object} params - The parameter object for running the workspace
         * @param {Function} callback - Callback function accepting the json return value
         */
        runWorkspaceWithData : function(path, params, callback) {
            callback = callback || null;
            path = path || null;
            var service = params.service || 'fmedatadownload';
            var url = buildURL('{{svr}}/' + service + '/' + repository + '/' + workspace + '?');
            var files = params.files;
            var extra = params.params;
            params = params.filename + '=%22%22';
            for(var f in files){
                params += path + '/' + files[f].name + '%22%20%22';
            }
            params += '&' + extra + '&opt_responseformat=' + getResponseType() + '&token=' + getConfig('token');
            ajax(url+params, callback);
        },

        /**
         * Retrieves all available repositories on the FME Server
         * @param {Function} callback - Callback function accepting the json return value
         */
        getRepositories : function(callback) {
            callback = callback || null;
            var url = buildURL('{{svr}}/fmerest/{{ver}}/repositories');
            ajax(url, callback);
        },

        /**
         * Retrieves all items on the FME Server for a given Repository
         * @param {String} repository - The repository on the FME Server
         * @param {String} type - The specific type of file item requested (optional)
         * @param {Function} callback - Callback function accepting the json return value
         */
        getRepositoryItems : function(repository, type, callback) {
            type = type || '';
            callback = callback || null;
            var url = buildURL('{{svr}}/fmerest/{{ver}}/repositories/' + repository + '/items?type=' + type);
            ajax(url, callback);
        },

        /**
         * Retrieves all published params for a given workspace
         * @param {String} repository - The repository on the FME Server
         * @param {String} workspace - The name of the workspace on FME Server, i.e. workspace.fmw
         * @param {Function} callback - Callback function accepting the json return value
         */
        getWorkspaceParameters : function(repository, workspace, callback) {
            callback = callback || null;
            var url = buildURL('{{svr}}/fmerest/{{ver}}/repositories/' + repository + '/items/' + workspace + '/parameters');
            ajax(url, callback);
        },

        /**
         * Retrieves a single published param for a given workspace
         * @param {String} repository - The repository on the FME Server
         * @param {String} workspace - The name of the workspace on FME Server, i.e. workspace.fmw
         * @param {String} parameter - The name of the workspace parameter
         * @param {Function} callback - Callback function accepting the json return value
         */
        getWorkspaceParameter : function(repository, workspace, parameter, callback) {
            callback = callback || null;
            var url = buildURL('{{svr}}/fmerest/{{ver}}/repositories/' + repository + '/items/' + workspace + '/parameters/' + parameter);
            ajax(url, callback);
        },

        /**
         * Generates a standard workspace parameters form
         * @param {String} id - The container id to place the form elements
         * @param {Object} json - The json object representing the form parameters
         * @param {Array} items - (Optional) The array of parameter names you wish to expose, by default all parameters are exposed
         */
        generateFormItems : function(id, json, items) {
            var form = document.getElementById(id);
            // Loop through the JSON object and build the form
            for(var i = 0; i < json.length; i++) {
                var param = json[i];
                if (!items || items.indexOf(param.name) !== -1) {
                    var span = document.createElement("span");
                    span.setAttribute("class", param.name + " fmes-form-component");
                    var label = document.createElement("label");
                    label.innerHTML = param.description;
                    span.appendChild(label);
                    var choice;
                    if(param.type === "FILE_OR_URL" || param.type === "FILENAME_MUSTEXIST" || param.type === "FILENAME") {
                        choice = document.createElement("input");
                        choice.type = "file";
                        choice.name = param.name;
                    } else if(param.type === "LISTBOX" || param.type === "LOOKUP_LISTBOX") {
                        choice = document.createElement("div");
                        var options = param.listOptions;
                        for(var a = 0; a < options.length; a++) {
                            var option = options[a];
                            var checkbox = document.createElement("input");
                            checkbox.type = "checkbox";
                            checkbox.value = option.value;
                            checkbox.name = param.name;
                            choice.appendChild(checkbox);
                            var caption = document.createElement("label");
                            caption.innerHTML = option.caption;
                            choice.appendChild(caption);
                        }
                    } else if(param.type === "LOOKUP_CHOICE" ||
                              param.type === "STRING_OR_CHOICE" ||
                              param.type === "CHOICE")
                    {
                        choice = document.createElement("select");
                        choice.name = param.name;
                        var options = param.listOptions;
                        for(var a = 0; a < options.length; a++) {
                            var option = options[a];
                            var optionItem = document.createElement("option");
                            optionItem.innerHTML = option.caption;
                            optionItem.value = option.value;
                            choice.appendChild(optionItem);
                        }
                    } else if(param.type  === "TEXT_EDIT") {
                        choice = document.createElement("textarea");
                        choice.name = param.name;
                    } else if(param.type  == "INTEGER") {
                        choice = document.createElement("input");
                        choice.type = "number";
                        choice.name = param.name;
                    } else if(param.type  == "PASSWORD") {
                        choice = document.createElement("input");
                        choice.type = "password";
                        choice.name = param.name;
                    } else {
                        choice = document.createElement("input");
                        choice.value = param.defaultValue;
                        choice.name = param.name;
                    }

                    span.appendChild(choice);
                    form.appendChild(span);
                }
            }
        },

        /**
         * Retrieves all scheduled items
         * @param {Function} callback - Callback function accepting the json return value
         */
        getSchedules : function(callback) {
            callback = callback || null;
            var url = buildURL('{{svr}}/fmerest/{{ver}}/schedules');
            ajax(url, callback);
        },

        /**
         * Returns a scheduled item
         * @param {String} category - Schedule category title
         * @param {String} name - Schedule name
         * @param {Function} callback - Callback function accepting the json return value
         */
        getScheduleItem : function(category, item, callback) {
            callback = callback || null;
            var url = buildURL('{{svr}}/fmerest/{{ver}}/schedules/' + category + '/' + item);
            ajax(url, callback);
        },

        /**
         * Enables a scheduled item
         * @param {String} category - Schedule category title
         * @param {String} name - Schedule name
         * @param {Function} callback - Callback function accepting the json return value
         */
        enableScheduleItem : function(category, item, callback) {
            callback = callback || null;
            var url = buildURL('{{svr}}/fmerest/{{ver}}/schedules/' + category + '/' + item + '/enabled');
            var params = 'value=true';
            ajax(url, callback, 'PUT', params, 'application/x-www-form-urlencoded');
        },

        /**
         * Disables a scheduled item
         * @param {String} category - Schedule category title
         * @param {String} item - Schedule name
         * @param {Function} callback - Callback function accepting the json return value
         */
        disableScheduleItem : function(category, item, callback) {
            callback = callback || null;
            var url = buildURL('{{svr}}/fmerest/{{ver}}/schedules/' + category + '/' + item + '/enabled');
            var params = 'value=false';
            ajax(url, callback, 'PUT', params, 'application/x-www-form-urlencoded');
        },

        /**
         * Replaces a scheduled item
         * @param {String} category - Schedule category title
         * @param {String} item - Schedule name
         * @param {Object} schedule - Object holding the schedule information
         * @param {Function} callback - Callback function accepting the json return value
         */
        replaceScheduleItem : function(category, item, schedule, callback) {
            callback = callback || null;
            var url = buildURL('{{svr}}/fmerest/{{ver}}/schedules/' + category + '/' + item);
            var params = JSON.stringify(schedule);
            ajax(url, callback, 'PUT', params, 'application/json');
        },

        /**
         * Remove a scheduled item
         * @param {String} category - Schedule category title
         * @param {String} item - Schedule name
         * @param {Function} callback - Callback function accepting the json return value
         */
        removeScheduleItem : function(category, item, callback) {
            callback = callback || null;
            var url = buildURL('{{svr}}/fmerest/{{ver}}/schedules/' + category + '/' + item);
            ajax(url, callback, 'DELETE');
        },

        /**
         * Create a scheduled item
         * @param {Object} schedule - Object holding the schedule information
         * @param {Function} callback - Callback function accepting the json return value
         */
        createScheduleItem : function(schedule, callback) {
            callback = callback || null;
            var url = buildURL('{{svr}}/fmerest/{{ver}}/schedules');
            var params = JSON.stringify(schedule);
            ajax(url, callback, 'POST', params, 'application/json');
        },

        /**
         * Get all publications
         * @param {Function} callback - Callback function accepting the json return value
         */
        getAllPublications : function(callback) {
            callback = callback || null;
            var url = buildURL('{{svr}}/fmerest/{{ver}}/notifications/publications');
            ajax(url, callback);
        },

        /**
         * Get a publication
         * @param {String} name - Publication name
         * @param {Function} callback - Callback function accepting the json return value
         */
        getPublication : function(name, callback) {
            callback = callback || null;
            name = encodeURIComponent(name).replace(/%20/g, '+');
            var url = buildURL('{{svr}}/fmerest/{{ver}}/notifications/publications/' + name);
            ajax(url, callback);
        },

        /**
         * Create a publication
         * @param {Object} publication - Object holding the publication information
         * @param {Function} callback - Callback function accepting the json return value
         */
        createPublication : function(publication, callback) {
            callback = callback || null;
            var url = buildURL('{{svr}}/fmerest/{{ver}}/notifications/publications');
            var params = JSON.stringify(publication);
            ajax(url, callback, 'POST', params, 'application/json');
        },

        /**
         * Update a publication
         * @param {String} name - Publication name
         * @param {Object} publication - Object holding the publication information
         * @param {Function} callback - Callback function accepting the json return value
         */
        updatePublication : function(name, publication, callback) {
            callback = callback || null;
            name = encodeURIComponent(name).replace(/%20/g, '+');
            var url = buildURL('{{svr}}/fmerest/{{ver}}/notifications/publications/' + name);
            var params = JSON.stringify(publication);
            ajax(url, callback, 'PUT', params, 'application/json');
        },

        /**
         * Delete a publication
         * @param {String} name - Publication name
         * @param {Function} callback - Callback function accepting the json return value
         */
        deletePublication : function(name, callback) {
            callback = callback || null;
            name = encodeURIComponent(name).replace(/%20/g, '+');
            var url = buildURL('{{svr}}/fmerest/{{ver}}/notifications/publications/' + name);
            ajax(url, callback, 'DELETE');
        },

        /**
         * Get Publisher Protocols
         * @param {Function} callback - Callback function accepting the json return value
         */
        getPublisherProtocols : function(callback) {
            callback = callback || null;
            var url = buildURL('{{svr}}/fmerest/{{ver}}/notifications/publishers/');
            ajax(url, callback);
        },

        /**
         * Query Publisher Protocol
         * @param {String} name - Protocol name
         * @param {Function} callback - Callback function accepting the json return value
         */
        queryPublisherProtocol : function(name, callback) {
            callback = callback || null;
            var url = buildURL('{{svr}}/fmerest/{{ver}}/notifications/publishers/' + name);
            ajax(url, callback);
        },

        /**
         * Get all subscriptions
         * @param {Function} callback - Callback function accepting the json return value
         */
        getAllSubscriptions : function(callback) {
            callback = callback || null;
            var url = buildURL('{{svr}}/fmerest/{{ver}}/notifications/subscriptions');
            ajax(url, callback);
        },

        /**
         * Get a subscription
         * @param {String} name - Subscription name
         * @param {Function} callback - Callback function accepting the json return value
         */
        getSubscription : function(name, callback) {
            callback = callback || null;
            name = encodeURIComponent(name).replace(/%20/g, '+');
            var url = buildURL('{{svr}}/fmerest/{{ver}}/notifications/subscriptions/' + name);
            ajax(url, callback);
        },

        /**
         * Create a subscription
         * @param {Object} subscription - Object holding the subscription information
         * @param {Function} callback - Callback function accepting the json return value
         */
        createSubscription : function(subscription, callback) {
            callback = callback || null;
            var url = buildURL('{{svr}}/fmerest/{{ver}}/notifications/subscriptions');
            var params = JSON.stringify(subscription);
            ajax(url, callback, 'POST', params, 'application/json');
        },

        /**
         * Update a subscription
         * @param {String} name - subscription name
         * @param {Object} subscription - Object holding the subscription information
         * @param {Function} callback - Callback function accepting the json return value
         */
        updateSubscription : function(name, subscription, callback) {
            callback = callback || null;
            name = encodeURIComponent(name).replace(/%20/g, '+');
            var url = buildURL('{{svr}}/fmerest/{{ver}}/notifications/subscription/' + name);
            var params = JSON.stringify(subscription);
            ajax(url, callback, 'PUT', params, 'application/json');
        },

        /**
         * Delete a subscription
         * @param {String} name - subscription name
         * @param {Function} callback - Callback function accepting the json return value
         */
        deleteSubscription : function(name, callback) {
            callback = callback || null;
            name = encodeURIComponent(name).replace(/%20/g, '+');
            var url = buildURL('{{svr}}/fmerest/{{ver}}/notifications/subscriptions/' + name);
            ajax(url, callback, 'DELETE');
        },

        /**
         * Get Subscriber Protocols
         * @param {Function} callback - Callback function accepting the json return value
         */
        getSubscriberProtocols : function(callback) {
            callback = callback || null;
            var url = buildURL('{{svr}}/fmerest/{{ver}}/notifications/subscribers/');
            ajax(url, callback);
        },

        /**
         * Query Subscriber Protocol
         * @param {String} name - Protocol name
         * @param {Function} callback - Callback function accepting the json return value
         */
        querySubscriberProtocol : function(name, callback) {
            callback = callback || null;
            var url = buildURL('{{svr}}/fmerest/{{ver}}/notifications/subscribers/' + name);
            ajax(url, callback);
        },

        /**
         * Get Notification Topics
         * @param {Function} callback - Callback function accepting the json return value
         */
        getNotificationTopics : function(callback) {
            callback = callback || null;
            var url = buildURL('{{svr}}/fmerest/{{ver}}/notifications/topics');
            ajax(url, callback);
        },

        /**
         * Get Notification Topic
         * @param {String} name - Topic name
         * @param {Function} callback - Callback function accepting the json return value
         */
        getNotificationTopic : function(name, callback) {
            callback = callback || null;
            name = encodeURIComponent(name);
            var url = buildURL('{{svr}}/fmerest/{{ver}}/notifications/topics/' + name);
            ajax(url, callback);
        },

        /**
         * Create Topic
         * @param {String} name - Topic name
         * @param {String} description - Topic description
         * @param {Function} callback - Callback function accepting the json return value
         */
        createTopic : function(name, description, callback) {
            callback = callback || null;
            name = encodeURIComponent(name).replace(/%20/g, '+');
            description = encodeURIComponent(description).replace(/%20/g, '+');
            var url = buildURL('{{svr}}/fmerest/{{ver}}/notifications/topics');
            var params = "name=" + name + "&description=" + description;
            ajax(url, callback, 'POST', params, 'application/x-www-form-urlencoded');
        },

        /**
         * Update Topic Description
         * @param {String} name - Topic name
         * @param {String} description - Topic description
         * @param {Function} callback - Callback function accepting the json return value
         */
        updateTopic : function(name, description, callback) {
            callback = callback || null;
            name = encodeURIComponent(name);
            description = encodeURIComponent(description).replace(/%20/g, '+');
            var url = buildURL('{{svr}}/fmerest/{{ver}}/notifications/topics/' + name);
            var params = "description=" + description;
            ajax(url, callback, 'PUT', params, 'application/x-www-form-urlencoded');
        },

        /**
         * Delete Topic
         * @param {String} name topic name
         * @param {Function} callback - Callback function accepting the json return value
         */
        deleteTopic : function(name, callback) {
            callback = callback || null;
            name = encodeURIComponent(name);
            var url = buildURL('{{svr}}/fmerest/{{ver}}/notifications/topics/' + name);
            ajax(url, callback, 'DELETE', null, 'application/x-www-form-urlencoded');
        },

        /**
         * Publish JSON or XML to a topic
         * @param {String} name - Topic name
         * @param {String} params - The data as a json string or xml string
         * @param {String} type - The type of data (JSON or XML)
         * @param {Function} callback - Callback function accepting the json return value
         */
        publishToTopicStructured : function(name, params, type, callback) {
            callback = callback || null;
            name = encodeURIComponent(name);
            type = type.toLowerCase() || 'json';
            var url = buildURL('{{svr}}/fmerest/{{ver}}/notifications/topics/' + name + '/message/map');
            if (type == 'xml') {
                type = 'application/xml';
            } else {
                type = 'application/json';
                try {
                    params = JSON.parse(params);
                    params = JSON.stringify(params);
                } catch(e) {
                    var message = { message : 'Unable to parse JSON' };
                    callback(message);
                    return false;
                }
            }
            ajax(url, callback, 'POST', params, type);
        },

        /**
         * Publish anything to a topic
         * @param {String} name - Topic name
         * @param {Object} or {String} params - The raw text data
         * @param {Function} callback - Callback function accepting the json return value
         */
        publishToTopic : function(name, params, callback) {
            callback = callback || null;
            name = encodeURIComponent(name);
            var url = buildURL('{{svr}}/fmerest/{{ver}}/notifications/topics/' + name + '/message/raw');
            ajax(url, callback, 'POST', params, '*/*');
        },

        /**
         * Lookup user token
         * @param {Function} callback - Callback function accepting the json return value
         */
        lookupToken : function(user, password, callback) {
            callback = callback || null;
            var url = buildURL('{{svr}}/fmetoken/service/view.json');
            var params = 'user=' + user + '&password=' + password;
            ajax(url, callback, 'POST', params, 'application/x-www-form-urlencoded');
        },

        /**
         * Generate guest token
         * @param {Function} callback - Callback function accepting the json return value
         */
        generateToken : function(user, password, count, unit, callback) {
            callback = callback || null;
            var url = buildURL('{{svr}}/fmetoken/service/generate');
            var params = 'user=' + user + '&password=' + password + '&expiration=' + count + '&timeunit=' + unit;
            ajax(url, callback, 'POST', params, 'application/x-www-form-urlencoded');
        },

        /**
         * Submit a Job to Run asynchronously
         * @param {String} repository - The repository on the FME Server
         * @param {String} workspace - The name of the workspace on FME Server, i.e. workspace.fmw
         * @param {String} params - Any workspace-specific parameter values
         * @param {Function} callback - Callback function accepting the json return value
         */
        submitJob : function(repository, workspace, params, callback) {
            callback = callback || null;
            var url = buildURL('{{svr}}/fmerest/{{ver}}/transformations/commands/submit/' + repository + '/' + workspace);
            params = JSON.stringify(params);
            ajax(url, callback, 'POST', params, 'application/json');
        },

        /**
         * Submit a Job to Run Synchronously
         * @param {String} repository - The repository on the FME Server
         * @param {String} workspace - The name of the workspace on FME Server, i.e. workspace.fmw
         * @param {String} params - Any workspace-specific parameter values
         * @param {Function} callback - Callback function accepting the json return value
         */
        submitSyncJob : function(repository, workspace, params, callback) {
            callback = callback || null;
            var url = buildURL('{{svr}}/fmerest/{{ver}}/transformations/commands/transact/' + repository + '/' + workspace);
            params = JSON.stringify(params);
            ajax(url, callback, 'POST', params, 'application/json');
        },

        /**
         * Get a List of All Shared Resources
         * @param {Function} callback - Callback function accepting the json return value
         */
        getResources : function(callback) {
            callback = callback || null;
            var url = buildURL('{{svr}}/fmerest/{{ver}}/resources');
            ajax(url, callback);
        },

        /**
         * Get Resource Details
         * @param {String} resource - The resource name
         * @param {String} path - The file path within the resource on the server
         * @param {Function} callback - Callback function accepting the json return value
         */
        getResourceDetails : function(resource, path, callback) {
            callback = callback || null;
            path = encodeURIComponent(path).replace(/%2F/g, '/');
            var url = buildURL('{{svr}}/fmerest/{{ver}}/resources/' + resource + '/filesys' + path);
            ajax(url, callback);
        },

        /**
         * Delete Resource
         * @param {String} resource - The resource name
         * @param {String} path - The file path within the resource on the server
         * @param {Function} callback - Callback function accepting the json return value
         */
        deleteResource : function(resource, path, callback) {
            callback = callback || null;
            path = encodeURIComponent(path).replace(/%2F/g, '/');
            var url = buildURL('{{svr}}/fmerest/{{ver}}/resources/' + resource + '/filesys' + path);
            ajax(url, callback, 'DELETE');
        },

        /**
         * Download Resource File
         * @param {String} resource - The resource name
         * @param {String} path - The resource file path on the server
         */
        downloadResourceFile : function(resource, path) {
            path = encodeURIComponent(path).replace(/%2F/g, '/');
            var url = buildURL('{{svr}}/fmerest/{{ver}}/resources/' + resource + '/filesys' + path + '?accept=contents');
            var iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            document.body.appendChild(iframe);
            iframe.src = url + '&token=' + getConfig('token');
        },

        /**
         * Upload Resource File
         * @param {String} resource - The resource name
         * @param {String} path - The file path within the resource on the server
         * @param {Object} params - The custom file input object { name : name, contents : contents }
         * @param {Function} callback - Callback function accepting the json return value
         * @param {Boolean} overwrite - Overwrite files, true or false(default)
         * @param {Boolean} createFolders - Create folders from path, true or false(default)
         */
        uploadResourceFile : function(resource, path, params, callback, overwrite, createFolders) {
            callback = callback || null;
            overwrite = overwrite || false;
            createFolders = createFolders || false;
            path = encodeURIComponent(path).replace(/%2F/g, '/');
            var url = buildURL('{{svr}}/fmerest/{{ver}}/resources/' + resource + '/filesys' + path);
            url = url + '?createDirectories=' + createFolders + '&overwrite=' + overwrite + '&type=FILE';
            ajax(url, callback, 'POST', params, 'attachment');
        },

        /**
         * Submit a custom REST request directly to the API
         * @param {String} url - Full url of the REST call including the server
         * @param {String} type - The request type, i.e. GET, POST, PUSH, ...
         * @param {Function} callback - Callback function accepting the json return value
         * @param {String} params - Any parameter values required by the API (Optional)
         * @param {String} ctyp - The Content type of the data being sent, ex: 'application/json'
         */
        customRequest : function(url, type, callback, params, ctyp) {
            callback = callback || null;
            params = params || null;
            type = type.toUpperCase();
            ctyp = ctyp || null;
            ajax(url, callback, type, params, ctyp);
        }

    };

    /**
     * Return the constructed FMEServer Connection Object
     */ 
    return fme;
}());