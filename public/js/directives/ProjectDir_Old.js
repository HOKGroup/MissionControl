var myApp = angular.module('ProjectDir', []);

myApp.directive('googleplace', function() {
    return {
        require: 'ngModel',
        scope: {
            ngModel: '=',
            details: '=?'
        },
        link: function(scope, element, attrs, model) {
            var options = {
                types: [],
                componentRestrictions: {}
            };
            scope.gPlace = new google.maps.places.Autocomplete(element[0], options);

            google.maps.event.addListener(scope.gPlace, 'place_changed', function() {
                scope.$apply(function() {
					var placeDetails = scope.gPlace.getPlace();
					var geometryLocation = placeDetails.geometry.location;
					var latitudeVal = geometryLocation.lat();
					var longitudeVal = geometryLocation.lng();

					var address = {};
					//formatted address
					address.formattedAddress = placeDetails.formatted_address;
					
					//iterate address components
					var componentForm = {
						street_number: 'short_name', 
						route: 'long_name', //street name
						locality: 'long_name', //city
						administrative_area_level_1: 'short_name', //state
						country: 'long_name',
						postal_code: 'short_name' //zip code
					};
					for(var i=0;i<placeDetails.address_components.length; i++)
					{
						var addressType = placeDetails.address_components[i].types[0];
						if (componentForm[addressType]) {
							var val = placeDetails.address_components[i][componentForm[addressType]];
							componentForm[addressType] = val; //replace value
						}
					}
					
					address.street1= componentForm.street_number + " "+ componentForm.route;
					address.city = componentForm.locality;
					address.state = componentForm.administrative_area_level_1;
					address.country = componentForm.country;
					address.zipCode = componentForm.postal_code;

					var geoLocation = 
					{
						type: 'Point',
						coordinates:[latitudeVal,longitudeVal]
					};
					address.geoLocation= geoLocation;
			
					address.placeId = placeDetails.place_id;

                    scope.details = address;
                    model.$setViewValue(element.val());                
                });
            });
        }
    };
});

myApp.directive('googledrawing', function(){
	return{
		//require: 'ngModel',
        scope: {
            //ngModel: '=',
            geolocation: '=?',
			geopolygon: '=?'
        },
		link: function(scope, element, attrs, model) {
			var centerLatLng;
			
			if(scope.geolocation == null || scope.geolocation == undefined)
			{
				centerLatLng = new google.maps.LatLng(40.7539258, -73.98540909999997); //New York
			}
			else{
				centerLatLng = new google.maps.LatLng(scope.geolocation.coordinates[0], scope.geolocation.coordinates[1]);
			}

			map = new google.maps.Map(element[0], {
				zoom: 12,
				center: centerLatLng,
				disableDefaultUI: true,
				zoomControl: true,
				panControl: true,
				mapTypeId: google.maps.MapTypeId.ROADMAP    
			});
			
			drawManager = new google.maps.drawing.DrawingManager ({
				drawingMode : google.maps.drawing.OverlayType.POLYGON,
				drawingControl : true,
				drawingControlOptions : {
				    position : google.maps.ControlPosition.TOP_LEFT,
				    drawingModes : [
				    	google.maps.drawing.OverlayType.POLYGON
				    ]
				},
				polygonOptions:{
					strokeWeight: 3,
					strokeColor:'#ff4444',
					fillColor:'#ff4444'
				}
			});
			drawManager.setMap(map);
			
			google.maps.event.addListener(drawManager, 'overlaycomplete', function(event) {
		    	if (event.type == google.maps.drawing.OverlayType.POLYGON) {
					var poly = event.overlay.getPath();
					
					var coordinateArrayArray=[];
					var coordinateArray = [];
					//loop through coordinates and add them to array
					for(var i=0; i<poly.getLength(); i++){
						var coordiate = [];
						coordiate[0] = poly.getAt(i).lat();
						coordiate[1] = poly.getAt(i).lng();
						coordinateArray[i] = coordiate;
					}
					coordinateArrayArray[0] = coordinateArray;
					
					var polygon = 
					{
						type: 'Polygon',
						coordinates: coordinateArrayArray
					};
					
					scope.geopolygon = polygon;
		    	}
		    });
		}
	};
});