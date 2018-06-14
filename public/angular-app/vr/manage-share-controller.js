/**
 * Created by konrad.sobon on 2018-02-13.
 */
angular.module('MissionControlApp').controller('ManageShareController', ManageShareController);

function ManageShareController($base64, $uibModalInstance, UtilityService, EmailFactory, VrFactory, bucket) {
    var vm = this;
    var attachments = [
        {
            filename: 'header.png',
            path: 'emails/shares/images/header.png',
            cid: 'header@hok.com'
        },
        {
            filename: 'left.png',
            path: 'emails/shares/images/left.png',
            cid: 'left@hok.com'
        },
        {
            filename: 'right.png',
            path: 'emails/shares/images/right.png',
            cid: 'right@hok.com'
        },
        {
            filename: 'facebook.png',
            path: 'emails/shares/images/facebook.png',
            cid: 'facebook@hok.com'
        },
        {
            filename: 'instagram.png',
            path: 'emails/shares/images/instagram.png',
            cid: 'instagram@hok.com'
        },
        {
            filename: 'youtube.png',
            path: 'emails/shares/images/youtube.png',
            cid: 'youtube@hok.com'
        },
        {
            filename: 'twitter.gif',
            path: 'emails/shares/images/twitter.png',
            cid: 'twitter@hok.com'
        }
    ];
    vm.bucket = bucket;
    vm.emails = [];
    vm.email = '';
    vm.emailWarning = '';
    vm.message = '';
    vm.status = '';

    retrieveShare();

    /**
     * Retrieves all shared emails and creates sharableLinks for them.
     */
    function retrieveShare(){
        if(vm.bucket.sharedWith){
            var re = /\s*;\s*/;
            vm.bucket.sharedWith.split(re).forEach(function (item) {
                if(UtilityService.validateEmail(item)){
                    vm.emails.push({
                        email: item,
                        sharableLink: $base64.encode(vm.bucket.sharableLink + ":" + item).toString('base64')
                    });
                    console.log(vm.emails);
                }
            });
        }
    }

    /**
     * Sends just a single email to specific recipient.
     * @param item
     */
    vm.sendOneEmail = function (item) {
        var data = {
            recipients: item.email,
            template: 'shares',
            locals : {
                link: item.sharableLink
            },
            attachments: attachments
        };

        EmailFactory.sendEmail(data)
            .then(function (response) {
                if(!response || response.status !== 200){
                    vm.status = 'Failed to send email notification. Please reload the page and try again.';
                    console.log(error);
                    return;
                }

                $uibModalInstance.dismiss('cancel');
            })
            .catch(function (error) {
                vm.status = 'Failed to send email notification. Please reload the page and try again.';
                console.log(error);
            });
    };

    /**
     * Sends an email notification to recipients about shared project.
     */
    vm.sendEmail = function () {
        vm.emails.forEach(function (item) {
            var data = {
                recipients: item.email,
                template: 'shares',
                locals : {
                    link: item.sharableLink
                },
                attachments: attachments
            };

            EmailFactory.sendEmail(data)
                .then(function (response) {
                    if(!response || response.status !== 200){
                        vm.status = 'Failed to send email notification. Please reload the page and try again.';
                        console.log(error);
                    }
                })
                .catch(function (error) {
                    vm.status = 'Failed to send email notification. Please reload the page and try again.';
                    console.log(error);
                });

            $uibModalInstance.dismiss('cancel');
        });
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

        var emails = vm.emails.map(function(item){
            return item.email;
        }).join(';');
        var data = {
            commentId: vm.bucket.commentId,
            description: '{"position": ' + vm.bucket.position + ', "sharedWith": "' + emails + '"}'
        };

        VrFactory.updateComment(data)
            .then(function (response) {
                if(!response || response.status !== 200) return;

                vm.status = 'Successfully removed ' + email.email + ' from Recipients list.';
            })
            .catch(function (err) {
                vm.status = 'Failed to remove ' + email.email + ' from Recipients list. Please reload the page and try again.';
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
                vm.emails.push({
                    email: item,
                    sharableLink: $base64.encode(vm.bucket.sharableLink + ":" + item).toString('base64')
                });
                vm.email = '';
                vm.emailWarning = '';
            } else {
                vm.emailWarning = 'Invalid email address. Please verify and try again.'
            }
        });

        var emails = vm.emails.map(function(item){
            return item.email;
        }).join(';');
        var data = {
            commentId: vm.bucket.commentId,
            description: '{"position": ' + vm.bucket.position + ', "sharedWith": "' + emails + '"}'
        };

        VrFactory.updateComment(data)
            .then(function (response) {
                if(!response || response.status !== 200) return;

                vm.status = 'Successfully added new email to Recipients list.';
            })
            .catch(function (err) {
                vm.status = 'Failed to add new email to Recipients list. Please reload the page and try again.';
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