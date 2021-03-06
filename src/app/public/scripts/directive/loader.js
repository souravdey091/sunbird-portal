'use strict';

angular.module('loginApp')
    .directive('appLoader', [function () {
        return {
            templateUrl: 'views/errorhandler/loaderWithMessage.html',
            restrict: 'E',

            link: function postLink(scope, element, attrs) {
                attrs.data = attrs.data ? JSON.parse(attrs.data) : undefined;
                scope.headerMessage = attrs.data && attrs.data.headerMessage
                 ? attrs.data.headerMessage
                 : 'Please wait.';
                scope.loaderMessage = attrs.data && attrs.data.loaderMessage
                 ? attrs.data.loaderMessage
                 : 'We are fetching details';
            }
        };
    }]);
