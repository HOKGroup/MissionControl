/**
 * Created by konrad.sobon on 2018-01-10.
 */
angular.module('MissionControlApp').directive('dropZone',[function(){
    var config = {
        template:'<div class="dropzone">'+
        '<input type="file" multiple accept="jpg" style="width:100%;"/>'+
        '<div ng-transclude></div>'+       // <= transcluded stuff
        '</div>',
        transclude:true,
        replace: true,
        require: '?ngModel',
        link: function(scope, element, attributes, ngModel){
            var upload = element[0].querySelector('input');
            upload.addEventListener('dragover', uploadDragOver, false);
            upload.addEventListener('drop', uploadFileSelect, false);
            upload.addEventListener('change', uploadFileSelect, false);
            config.scope = scope;
            config.model = ngModel;
        }
    };
    return config;

    // Helper functions
    function uploadDragOver(e) {
        e.stopPropagation();
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    }

    function uploadFileSelect(e) {
        e.stopPropagation();
        e.preventDefault();
        var files = e.dataTransfer ? e.dataTransfer.files: e.target.files;
        for (var i = 0, file; file = files[i]; ++i) {
            var reader = new FileReader();
            reader.onload = (function(file) {
                return function(e) {
                    // Data handling (just a basic example):
                    // [object File] produces an empty object on the model
                    // why we copy the properties to an object containing
                    // the Filereader base64 data from e.target.result
                    var data = {
                        file: file,
                        data: e.target.result,
                        displayName: 'Image Name',
                        description: 'Image Description',
                        versionId: '',
                        projectId: '',
                        parentId: '',
                        id: '',
                        name: 'name' + i,
                        commentId: ''
                    };
                    for (var p in file) {
                        data[p] = file[p]
                    }

                    config.scope.$apply(function(){ config.model.$viewValue.push(data) })
                }
            })(file);
            reader.readAsDataURL(file);
        }
    }
}]);