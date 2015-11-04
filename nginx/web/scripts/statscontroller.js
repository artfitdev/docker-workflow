'use strict';

/* Controllers */

angular.module('ArtFitAngular')
    .controller('StatsCtrl', ['$rootScope', '$scope', '$location', '$window', '$http', function($rootScope, $scope, $location, $window, $http) {

		var baseUrl = "https://www.fotolite.net";
    	// we need to load tracker data
    	console.log('StatsController actived');
        $http.get(baseUrl + '/api/jawbone/data').success(function(res) {
            $scope.data = res;                
        })



}]);