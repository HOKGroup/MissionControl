response.filter(searchFilter)
	.filter(typeFilter)
	.filter(officeFilter);


var searchFilter = function(item) {
 	return item.centralPath.indexOf(req.body['search'].value) !== -1 ||
		item.revitVersion.indexOf(req.body['search'].value) !== -1 ||
		item.fileLocation.indexOf(req.body['search'].value) !== -1;
};

var typeFilter = function(item) {
    var filePath = item.centralPath.toLowerCase();
    switch(fileType){
        case 'Local': 
            return filePath.lastIndexOf('\\\\group\\hok\\', 0) === 0;
        case 'BIM 360':
            return filePath.lastIndexOf('bim 360://', 0) === 0;
        case 'Revit Server':
            return filePath.lastIndexOf('rsn://', 0) === 0;
        default: // Do not filter
            return true;
    }
};

var officeFilter = function(item) {
    // Need to first evaluate why type of file this is
    // Then run a regex on it.L
    return false;
};



if(vm.selectedOffice.name === 'All'){	
    passedOffice = true;	
} else {	
    var isLocal = filePath.lastIndexOf('\\\\group\\hok\\', 0) === 0;	
    var isBim360 = filePath.lastIndexOf('bim 360://', 0) === 0;	
    var isRevitServer = filePath.lastIndexOf('rsn://', 0) === 0;	
     if(isLocal){	
        var regx = /^\\\\group\\hok\\(.+?(?=\\))|^\\\\(.{2,3})-\d{2}svr(\.group\.hok\.com)?\\/g;	
        var match = regx.exec(filePath);	
        if(match === null || match[1] === null){	
            passedOffice = false;	
        } else {	
            passedOffice = (vm.selectedOffice.code.findIndex(function (item) {	
                return item.toLowerCase() === match[1];	
            }) !== -1);	
        }	
    }	
     if(isRevitServer){	
        var regx1 = /(rsn:\/\/)(\w*)/g;	
        var match1 = regx1.exec(filePath);	
        if(match1 === null || match1[2] === null){	
            passedOffice = false;	
        } else {	
            passedOffice = (vm.selectedOffice.code.findIndex(function (item) {	
                return item.toLowerCase() === match1[2];	
            }) !== -1);	
        }	
    }	
     // (Konrad) BIM 360 files are not being stored with proper office designations	
    // so we can just ignore them when filtering for office.	
    if(isBim360){	
        passedOffice = true;	
    }	
}