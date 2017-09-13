angular.module('MissionControlApp').directive('googleDrawingMap', function() {
    return {
        scope: {
            address: '=',
            geoLocation: '=',
            geoPolygon: '=',//multiPolygon
            initialized: '=?'
        },
        templateUrl: 'angular-app/project-map/project-map.html',
        link: function (scope, element) {
            var input = angular.element(element.children()[0]);
            var removeBttn = angular.element(element.children()[1]);
            var mapView = angular.element(element.children()[2]);
            var selectedLayer;

            //initialize map view
            var centerLatLng = new google.maps.LatLng(40.7539258, -73.98540909999997); //New York

            var mapOption = {
                zoom: 12,
                center: centerLatLng,
                disableDefaultUI: true,
                zoomControl: true,
                panControl: true,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };

            var map = new google.maps.Map(mapView[0], mapOption);

            //initialize data layer
            var dataStyle = {
                clickable: true,
                draggable: true,
                editable: true,
                fillColor: '#ff4444',
                strokeColor: '#ff4444',
                strokeWeight: 3,
                visible: true
            };

            map.data.setStyle(dataStyle);

            //add initial data layers
            scope.$watch('initialized', function (newValue, oldValue) {
                if (scope.initialized) {
                    //add point feature
                    if (scope.geoLocation !== undefined) {
                        createPointFeature(scope.geoLocation);
                    }

                    //add polygon feature
                    if (scope.geoPolygon !== undefined) {
                        createPolygonFeature(scope.geoPolygon);
                    }
                }
            }, true);

            //create point feature from stored geoJSON
            function createPointFeature(geometry) {
                var tempGeoJson = {
                    'type': 'FeatureCollection',
                    'features': [
                        {
                            'type': 'Feature',
                            'geometry': geometry
                        }
                    ]
                };

                var geoJsonOption = {
                    'idPropertyName': 'geoLocation'
                };

                map.data.addGeoJson(tempGeoJson, geoJsonOption);
                map.data.setStyle(dataStyle);

                // set map center by geoLocation
                centerLatLng = new google.maps.LatLng(geometry.coordinates[1], geometry.coordinates[0]);
                map.setCenter(centerLatLng);

                var bounds = new google.maps.LatLngBounds();
                bounds.extend(centerLatLng);
                map.fitBounds(bounds);
            }


            //create polygon feature from stored geoJSON
            function createPolygonFeature(geometry) {
                var bounds = new google.maps.LatLngBounds();
                var multiPolygon = geometry.coordinates;
                for (var i = 0; i < multiPolygon.length; i++) {
                    //add data layer from geoJSON as seperate polygon
                    var polygon = multiPolygon[i];
                    var tempGeoJson = {
                        'type': 'FeatureCollection',
                        'features': [
                            {
                                'type': 'Feature',
                                'geometry': {
                                    'type': 'Polygon',
                                    'coordinates': polygon
                                }
                            }
                        ]
                    };

                    var geoJsonOption = {
                        'idPropertyName': i
                    };

                    map.data.addGeoJson(tempGeoJson, geoJsonOption);
                    map.data.setStyle(dataStyle);

                    //extend bounds of maps to fit polygons
                    for (var j = 0; j < polygon.length; j++) {
                        var linearRing = polygon[j];
                        for (var k = 0; k < linearRing.length; k++) {
                            var point = linearRing[k];
                            var latLng = new google.maps.LatLng(point[1], point[0]);
                            bounds.extend(latLng);
                        }
                    }
                }
                map.fitBounds(bounds);
            }

            //convert point feature to geoJSON
            function convertToGeoLocation(feature) {
                feature.toGeoJson(function (obj) {
                    scope.geoLocation = obj.geometry;
                });
            }

            //convert polygon features to geoJSON
            function convertToGeoPloygon() {
                scope.$apply(function () {
                    //combine seperate polygons into one MultiPolygon
                    scope.geoPolygon = {};
                    scope.geoPolygon.type = 'MultiPolygon';
                    scope.geoPolygon.coordinates = [];
                    map.data.forEach(function (feature) {
                        if (feature.getGeometry().getType() === "Polygon") {
                            feature.toGeoJson(function (obj) {
                                var geometryObj = obj.geometry;
                                var coordinates = geometryObj.coordinates;
                                scope.geoPolygon.coordinates.push(coordinates);
                            });
                        }
                    });
                });
            }

            //data layer click event for a selected layer
            map.data.addListener('click', function (event) {
                //set property of a selected layer
                selectedLayer = event.feature;
            });

            //when geometry changed
            map.data.addListener('setgeometry', function (event) {
                selectedLayer = event.feature;
                //var geometryOld = event.newGeometry;
                var geometryNew = event.oldGeometry;
                if (geometryNew.getType() === "Point") {
                    convertToGeoLocation(selectedLayer);
                } else if (geometryNew.getType() === "Polygon") {
                    convertToGeoPloygon();
                }
            });

            //remove a selected data layer
            removeBttn.bind('click', function () {
                scope.$apply(function () {
                    if (null !== selectedLayer) {
                        if (selectedLayer.getGeometry().getType() === "Polygon") {
                            //remove data layer
                            map.data.remove(selectedLayer);
                            selectedLayer = null;

                            //update geoPolygon
                            convertToGeoPloygon();
                        }
                    }
                });
            });

            //initialize drawing manager
            var drawManager = new google.maps.drawing.DrawingManager({
                drawingMode: google.maps.drawing.OverlayType.POLYGON,
                drawingControl: true,
                drawingControlOptions: {
                    position: google.maps.ControlPosition.TOP_RIGHT,
                    drawingModes: [
                        google.maps.drawing.OverlayType.POLYGON
                    ]
                },
                polygonOptions: {
                    strokeWeight: 3,
                    strokeColor: '#ff4444',
                    fillColor: '#ff4444',
                    editable: true,
                    draggable: true,
                    clickable: true
                }
            });
            drawManager.setMap(map);

            //This event is fired when the user has finished drawing a polygon.
            google.maps.event.addListener(drawManager, 'polygoncomplete', function (polygon) {
                //add data layer
                var linearRingArray = [];
                var pathArray = polygon.getPaths();
                for (var i = 0; i < pathArray.length; i++) {
                    var path = pathArray.getAt(i);
                    var linearRing = [];
                    for (var j = 0; j < path.length; j++) {
                        var latLng = path.getAt(j);
                        linearRing.push(latLng);
                    }
                    linearRingArray.push(linearRing);
                }

                var dataPolygon = new google.maps.Data.Polygon(linearRingArray);
                var feature = new google.maps.Data.Feature({geometry: dataPolygon});
                map.data.add(feature);

                //remove drawing polygon
                polygon.setMap(null);

                //update geoPolygon
                convertToGeoPloygon();
            });

            //create search box for auto-complete and link it to the UI element
            var options = {
                types: []
                //componentRestrictions: {}
            };
            var autoComplete = new google.maps.places.Autocomplete(input[0], options);
            map.controls[google.maps.ControlPosition.TOP_LEFT].push(input[0]);

            map.addListener('bounds_changed', function () {
                autoComplete.setBounds(map.getBounds());
            });

            //This event is fired when a PlaceResult is made available.
            google.maps.event.addListener(autoComplete, 'place_changed', function () {
                scope.$apply(function () {
                    var place = autoComplete.getPlace();
                    if (place.length === 0) {
                        return;
                    }

                    //clear out the old mark.
                    map.data.forEach(function (feature) {
                        var geometry = feature.getGeometry();
                        if (null !== geometry) {
                            var geoType = geometry.getType();
                            if (geoType === "Point") {
                                map.data.remove(feature);
                            }
                        }
                    });

                    //add data layer
                    var point = new google.maps.Data.Point(place.geometry.location);
                    var feature = new google.maps.Data.Feature({geometry: point});
                    map.data.add(feature);

                    //update geoLocation
                    convertToGeoLocation(feature);

                    var bounds = new google.maps.LatLngBounds();
                    if (place.geometry.viewport) {
                        // Only geocodes have viewport.
                        bounds.union(place.geometry.viewport);
                    } else {
                        bounds.extend(place.geometry.location);
                    }
                    map.fitBounds(bounds);

                    //fill address properties
                    var address = {};
                    address.formattedAddress = place.formatted_address;

                    //iterate address components
                    var componentForm = {
                        street_number: 'short_name',
                        route: 'long_name', //street name
                        locality: 'long_name', //city
                        administrative_area_level_1: 'short_name', //state
                        country: 'long_name',
                        postal_code: 'short_name' //zip code
                    };
                    for (var i = 0; i < place.address_components.length; i++) {
                        var addressType = place.address_components[i].types[0];
                        if (componentForm[addressType]) {
                            componentForm[addressType] = place.address_components[i][componentForm[addressType]]; //replace value
                        }
                    }

                    if (componentForm.street_number === 'short_name') {
                        componentForm.street_number = ''
                    }
                    if (componentForm.route === 'long_name') {
                        componentForm.route = ''
                    }
                    if (componentForm.locality === 'long_name') {
                        componentForm.locality = ''
                    }
                    if (componentForm.administrative_area_level_1 === 'short_name') {
                        componentForm.administrative_area_level_1 = ''
                    }
                    if (componentForm.country === 'long_name') {
                        componentForm.country = ''
                    }
                    if (componentForm.postal_code === 'short_name') {
                        componentForm.postal_code = ''
                    }

                    address.street1 = componentForm.street_number + " " + componentForm.route;
                    address.city = componentForm.locality;
                    address.state = componentForm.administrative_area_level_1;
                    address.country = componentForm.country;
                    address.zipCode = componentForm.postal_code;
                    address.placeId = place.place_id;
                    scope.address = address;
                });
            });
        }
    };
});