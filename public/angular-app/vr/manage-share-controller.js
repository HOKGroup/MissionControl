/**
 * Created by konrad.sobon on 2018-02-13.
 */
angular.module('MissionControlApp').controller('ManageShareController', ManageShareController);

function ManageShareController($uibModalInstance, UtilityService, EmailFactory, VrFactory, bucket) {
    var vm = this;
    vm.bucket = bucket;
    vm.emails = [];
    vm.email = '';
    vm.emailWarning = '';
    vm.message = '';
    vm.status = '';

    retrieveShare();

    function retrieveShare(){
        if(vm.bucket.sharedWith){
            var re = /\s*;\s*/;
            vm.bucket.sharedWith.split(re).forEach(function (item) {
                if(UtilityService.validateEmail(item)){
                    vm.emails.push(item);
                }
            });
            // VrFactory.getShare(vm.bucket.shareId)
            //     .then(function (response) {
            //         if(!response || response.status !== 200){
            //             vm.status = 'Failed to retrieve a Share Setting. Please reload the page and try again.';
            //             return;
            //         }
            //
            //         if(response.data.notify){
            //             vm.emails = response.data.notify;
            //         } else {
            //             vm.emails = [];
            //         }
            //         vm.message = response.data.message;
            //         vm.status = '';
            //     })
            //     .catch(function (error) {
            //         vm.status = 'Failed to retrieve a Share Setting. Please reload the page and try again.';
            //         console.log(error);
            //     })
        } else {
            // // (Konrad) Create share.
            // var files = [];
            // vm.bucket.images.forEach(function (item) {
            //     files.push({
            //         id: item.id,
            //         type: 'FILE'
            //     })
            // });
            //
            // var shareData = {
            //     mode: 'PUBLIC',
            //     projectId: vm.bucket.projectId,
            //     objects: files,
            //     permission: 'DOWNLOAD',
            //     notify: [],
            //     message: 'A link has been shared with you.'
            // };
            //
            // VrFactory.createShare(shareData)
            //     .then(function (response) {
            //         if(!response || response.status !== 201){
            //             vm.status = 'Failed to create a new Share Settings. Please reload the page and try again.';
            //             return;
            //         }
            //
            //         vm.bucket.shareId = response.data.id;
            //         vm.message = response.data.message;
            //
            //         var data = {
            //             commentId: vm.bucket.commentId,
            //             description: '{"position": ' + vm.bucket.position + ', "shareId": "' + vm.bucket.shareId + '"}'
            //         };
            //         return VrFactory.updateComment(data);
            //     })
            //     .then(function (response) {
            //         if(!response || response.status !== 200){
            //             vm.status = 'Failed to create a new Share Settings. Please reload the page and try again.';
            //             return;
            //         }
            //         vm.status = '';
            //     })
            //     .catch(function (error) {
            //         vm.status = 'Failed to create a new Share Settings. Please reload the page and try again.';
            //         console.log(error);
            //     })
        }
    }

    /**
     * Sends an email notification to recipients about shared project.
     */
    vm.sendEmail = function () {
        var data = {
            recipients: vm.emails.join(','),
            template: 'shares',
            locals : {
                link: 'some link value',
                message: vm.message
            }
        };

        EmailFactory.sendEmail(data)
            .then(function (response) {
                if(!response || response.status !== 200) return;

                console.log(response);
            })
            .catch(function (error) {
                console.log(error);
            })
    };

    /**
     * Removes email from recipient list.
     * @param email
     */
    vm.removeEmail = function (email) {
        var index = vm.emails.findIndex(function (item) {
            return item.id === email.id;
        });
        if(index !== -1) vm.emails.splice(index, 1);

        var emails = vm.emails.join(';');
        var data = {
            commentId: vm.bucket.commentId,
            description: '{"position": ' + vm.bucket.position + ', "sharedWith": "' + emails + '"}'
        };

        VrFactory.updateComment(data)
            .then(function (response) {
                if(!response || response.status !== 200) return;
            })
            .catch(function (err) {
                console.log(err);
            });
    };

    /**
     * Handler for "enter" keyboard input when adding emails.
     * @param bucket
     * @param event
     */
    vm.onEnter = function (bucket, event) {
        if(event.which !== 13) return;

        vm.addEmail();
    };

    /**
     * adds new recipient.
     */
    vm.addEmail = function () {
        var re = /\s*;\s*/;
        vm.email.split(re).forEach(function (item) {
            if(UtilityService.validateEmail(item)){
                vm.emails.push(item);
                vm.email = '';
                vm.emailWarning = '';
            } else {
                vm.emailWarning = 'Invalid email address. Please verify and try again.'
            }
        });

        var emails = vm.emails.join(';');
        var data = {
            commentId: vm.bucket.commentId,
            description: '{"position": ' + vm.bucket.position + ', "sharedWith": "' + emails + '"}'
        };

        VrFactory.updateComment(data)
            .then(function (response) {
                if(!response || response.status !== 200) return;
            })
            .catch(function (err) {
                console.log(err);
            });
    };

    /**
     * Closes modal window.
     */
    vm.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}