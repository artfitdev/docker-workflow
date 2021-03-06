'use strict';

angular.module('ArtFitAngular')
    .factory('Main', ['$http', '$window', function($http, $window){
        var baseUrl = "https://www.fotolite.net";

        function urlBase64Decode(str) {
            var output = str.replace('-', '+').replace('_', '/');
            switch (output.length % 4) {
                case 0:
                    break;
                case 2:
                    output += '==';
                    break;
                case 3:
                    output += '=';
                    break;
                default:
                    throw 'Illegal base64url string!';
            }
            return window.atob(output);
        }

        function getUserFromToken() {
            var token = $window.sessionStorage.token;
            var user = {};
            if (typeof token !== 'undefined') {
                var encoded = token.split('.')[1];
                user = JSON.parse(urlBase64Decode(encoded));
            }
            return user;
        }

        var currentUser = getUserFromToken();

        return {
            save: function(data, success, error) {
                console.log('/api/signup', data)
                $http.post(baseUrl + '/api/signup', data).success(success).error(error)
            },
            signin: function(data, success, error) {
                $http.post(baseUrl + '/api/authenticate', data).success(success).error(error)
            },
            me: function(success, error) {
                $http.get(baseUrl + '/api/me').success(success).error(error)
            },
            logout: function(success) {
                delete $window.sessionStorage.token;
                delete $window.sessionStorage.UserName;
                success();
            }
        };
    }
]);