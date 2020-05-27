angular.module('MissionControlApp').factory('ProtectedRouteInterceptor', ['msalAuthenticationService', '$q', '$rootScope', ProtectedRouteInterceptor]);

function ProtectedRouteInterceptor(authService, $q, $rootScope) { 
    return {
        request: function (config) {
            if (config) {
                config.headers = config.headers || {};
                var protectedRoutes = window.applicationConfig.protectedRoutes || [];
                var protected = protectedRoutes.some( function (route) { 
                    return route.url.test(config.url) && route.method === config.method;
                });
                var scopes = authService._getScopesForEndpoint(config.url);
                var routeProtectionConfig = window.msal.routeProtectionConfig;
                authService._verbose('Url: ' + config.url + ' maps to scopes: ' + scopes);
                if ((!protected) || scopes === null) {
                    return config;
                }
                var cacheResult = authService._getCachedToken(scopes, authService.getUser());
                // If there's already a cached token
                if (cacheResult && cacheResult.token) {
                    authService._info('Token is available for this url ' + config.url);
                    // check endpoint mapping if provided
                    config.headers.Authorization = 'Bearer ' + cacheResult.token;
                    return config;
                }
                else {
                    // Cancel request if login is starting
                    if (authService.loginInProgress()) {
                        if (routeProtectionConfig && routeProtectionConfig.popUp) {
                            authService._info('Url: ' + config.url + ' will be loaded after login is successful');
                            var delayedRequest = $q.defer();
                            $rootScope.$on('msal:loginSuccess', function (event, token) {
                                if (token) {
                                    authService._info('Login completed, sending request for ' + config.url);
                                    config.headers.Authorization = 'Bearer ' + token;
                                    delayedRequest.resolve(config);
                                }
                            });
                            $rootScope.$on('msal:loginFailure', function (event, error) {
                                if (error) {
                                    config.data = error;
                                    delayedRequest.reject(config);
                                }
                            });
                            return delayedRequest.promise;
                        }
                        else {
                            authService._info('login is in progress.');
                            config.data = 'login in progress, cancelling the request for ' + config.url;
                            return $q.reject(config);
                        }
                    }
                    else {
                        // delayed request to return after iframe completes
                        var delayedRequest = $q.defer();
                        authService.acquireTokenSilent(scopes).then(function (token) {
                            authService._verbose('Token is available');
                            config.headers.Authorization = 'Bearer ' + token;
                            delayedRequest.resolve(config);
                        }, function (error) {
                            authService.loginRedirect(scopes, routeProtectionConfig.extraQueryParameters).then(function (token) {
                                authService._verbose('Token is available');
                                config.headers.Authorization = 'Bearer ' + token;
                                delayedRequest.resolve(config);
                            }, function (error) {
                                console.log(error);
                                config.data = error;
                                delayedRequest.reject(config);
                            });
                        });

                        return delayedRequest.promise;
                    }
                }
            }
        },
        responseError: function (rejection) {
            authService._info('Getting error in the response: ' + JSON.stringify(rejection));
            if (rejection) {
                if (rejection.status === 401) {
                    var scopes = authService._getScopesForEndpoint(rejection.config.url);
                    var cacheResult = authService._getCachedToken(scopes, authService.getUser());
                    if (cacheResult && cacheResult.token) {
                        authService.clearCacheForScope(cacheResult.token);
                    }
                    $rootScope.$broadcast('msal:notAuthorized', rejection, scopes);
                }
                else {
                    $rootScope.$broadcast('msal:errorResponse', rejection);
                }

                return $q.reject(rejection);
            }
        }
    };
}
