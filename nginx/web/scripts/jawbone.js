'use strict';

angular.module('ArtFitAngular')
    .controller('JawboneCtrl', ['$http', '$rootScope', '$scope', '$window', '$cookies', 'Main', function($http, $rootScope, $scope, $window, $cookies, Main) {
		var baseUrl = "https://www.fotolite.net";
        
        $http.get(baseUrl + '/api/jawbone').success(function(res) {
            $scope.jawbonetracker = res;                
        })

    	$scope.addJawbone = function() {
    		$cookies.put('JWT_TOKEN', $window.sessionStorage.token);
    		$window.location.href = baseUrl + "/jawbone/login";
    	};

    	

        ;
            
    		
    	

    }])
