function triggerRequestGenerateToken(){

			/* Commonly available on the web, this function was taken from:
			 * http://ajaxpatterns.org/XMLHttpRequest_Call
			**/
			function createXMLHttpRequest(){
				try {
					return new XMLHttpRequest();
				}
				catch (e) {
				}
				try {
					return new ActiveXObject("Msxml2.XMLHTTP");
				}
				catch (e) {
				}
				alert("XMLHttpRequest not supported");
				return null;
			}

			/*
			Display the result when complete
			*/
			function onResponse(){
				// 4 indicates a result is ready
				if (xhReq.readyState != 4) {
					return;
				}
				// Get the response and display it
				alert(xhReq.responseText);
				return;
			}

			/*
			Create the XMLHttpRequest object
			*/
			var xhReq = createXMLHttpRequest();

			// Request Variables
			pHostName = "fmeserver.com";
			pUrlBase = "http://" + pHostName + "/fmetoken/generate";
			pHttpMethod = "GET";
			pUser = "tokenonly";
			pPassword = "token";
			pExpiration = 7;
			pTimeunit = "day";
			// Create REST call
			pRestCall = pUrlBase + "?user=" + pUser + "&password=" + pPassword;
			pRestCall += "&expiration=" + pExpiration + "&timeunit=" + pTimeunit;

			// Send request
			xhReq.open(pHttpMethod, pRestCall, true);
			xhReq.onreadystatechange = onResponse;
			xhReq.send();
		}