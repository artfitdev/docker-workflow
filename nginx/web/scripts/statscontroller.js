'use strict';

/* Controllers */

angular.module('ArtFitAngular')
    .controller('StatsCtrl', ['$rootScope', '$scope', '$location', '$window', '$http', function($rootScope, $scope, $location, $window, $http) {

		var baseUrl = "https://www.fotolite.net";
    	// we need to load tracker data
    	console.log('StatsController actived');
        $http.get(baseUrl + '/api/jawbone/data/sleep').success(function(res) {
            $scope.sleep = res;                
        });

        $http.get(baseUrl + '/api/jawbone/data/events/body').success(function(res) {
            $scope.events_body = res;                
        });

        $http.get(baseUrl + '/api/jawbone/data/workouts').success(function(res) {
            $scope.workouts = res;                
        });
        $http.get(baseUrl + '/api/jawbone/data/moves').success(function(res) {
            $scope.moves = res;                
        });

        console.log('Data recieved');
}]);