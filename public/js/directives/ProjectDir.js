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
						latitude:latitudeVal,
						longitude:longitudeVal
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

