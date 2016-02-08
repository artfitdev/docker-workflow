'use strict';

angular.module('ArtFitAngular', [
    'ngStorage',
    'ngRoute',
    'angular-loading-bar',
    'ngCookies',
    'ngMaterial'
])
.config(['$routeProvider', '$httpProvider', function ($routeProvider, $httpProvider) {

    $routeProvider.
        when('/', {
            templateUrl: 'partials/home.html',
            controller: 'HomeCtrl'
        }).
        when('/signin', {
            templateUrl: 'partials/signin.html',
            controller: 'AuthCtrl'
        }).
        when('/signup', {
            templateUrl: 'partials/signup.html',
            controller: 'AuthCtrl'
        }).
        when('/me', {
            templateUrl: 'partials/me.html',
            controller: 'HomeCtrl'
        }).
        when('/stats', {
            templateUrl: 'partials/stats.html',
            controller: 'StatsCtrl'
            
        }).
        when('/program', {
            templateUrl: 'partials/program.html',
            //controller: 'ProgrammDashboardController'
            
        }).
        when('/program-details', {
            templateUrl: 'partials/program-details.html',
            //controller: 'ProgrammDashboardController'
            
        }).
        otherwise({
            redirectTo: '/'
        });

        $httpProvider.interceptors.push(['$q', '$location', '$window', function($q, $location, $window) {
            return {
                'request': function (config) {
                    config.headers = config.headers || {};
                    if ($window.sessionStorage.token) {
                        config.headers.Authorization = 'Bearer ' + $window.sessionStorage.token; 
                    }
                    config.headers['Access-Control-Allow-Origin'] = '*';
                    config.headers['Access-Control-Allow-Methods'] = 'GET';

                    return config;
                },
                'responseError': function(response) {
                    if(response.status === 401 || response.status === 403) {
                        $location.path('/signin');
                    }
                    return $q.reject(response);
                }
            };
        }]);

    }
])
.config(['$mdIconProvider', function( $mdIconProvider ){

          // Register the user `avatar` icons
          $mdIconProvider.icon("menu", "./img/menu.svg", 24);
}]);