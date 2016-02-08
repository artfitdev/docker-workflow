'use strict';

/* Controllers */

var app = angular.module('ArtFitAngular');

app.controller('AuthCtrl', ['$scope', '$window', 'Main', function ($scope, $window, Main) {

    if (typeof $window.sessionStorage.token !== 'undefined')
    {
        $window.location = "/";
    }

    $scope.signin = function() {

        var formData = {
            email: $scope.loginForm.email.$viewValue,
            password: $scope.loginForm.password.$viewValue
        }
        console.log("Data", formData);

        Main.signin(formData, function(res) {
            if (res.type == false) {
                alert(res.data)    
            } else { 

                $window.sessionStorage.token = res.data.token;
                $window.sessionStorage.UserEmail = res.data.email;

                window.location = "/";    

            }
        }, 
        function() {
            $scope.error = 'Failed to signin';
        })
    };

    $scope.signup = function() {
        var formData = {
            email: $scope.regForm.email.$modelValue,
            password: $scope.regForm.password.$viewValue,
            name:$scope.regForm.username.$modelValue
        }
        console.log('Test', $scope.regForm.password);
        Main.save(formData, function(res) {
            if (res.type == false) {
                alert(res.data)
            } else {
                $window.sessionStorage.token = res.data.token;
                $window.sessionStorage.UserEmail = res.data.email;
                $window.location = "/"    
            }
        }, function() {
            $scope.error = 'Failed to signup';
        })
    };
}]);

app.controller('HomeCtrl', ['$rootScope', '$scope', '$location', '$window', 'Main', '$route', function($rootScope, $scope, $location, $window, Main, $route) {
    
    console.log('Calling HomeCtrl', $route.current.loadedTemplateUrl);
    // TODO we need to detect if user is logged in and how something different. Let do this implementation


    $scope.me = function() {
        Main.me(function(res) {
            $scope.user = res;
        }, function() {
            $rootScope.error = 'Failed to fetch details';
        })
    };

    $scope.register = function() {
        $window.location = "#/signin";    
    };      

    $scope.isLoggedIn = function() {        

        return (typeof $window.sessionStorage.token !== 'undefined'); 
    };
}])
app.controller('MainController', ['$rootScope', '$scope', '$location', '$window', 'Main', function($rootScope, $scope, $location, $window, Main) {
    

    $scope.isLoggedIn = function() {        

        return (typeof $window.sessionStorage.token !== 'undefined');
    };


}]);

app.controller('NavigationController',function($mdSidenav) {
    

});

app.controller('MeCtrl', ['$rootScope', '$scope', '$location', 'Main', function($rootScope, $scope, $location, Main) {
    

    Main.me(function(res) {
        $scope.myDetails = res;
    }, function() {
        $rootScope.error = 'Failed to fetch details';
    })
}]);

app.controller('TopPanelController', ['$scope', '$window', 'Main','$mdSidenav', function($scope, $window, Main, $mdSidenav) {

    $scope.email = $window.sessionStorage.UserEmail;

    $scope.isLoggedIn = function() {        
        return (typeof $window.sessionStorage.token !== 'undefined');
    };

    $scope.go = function(pathRoute) {
        console.log('Go to ', pathRoute);
        $window.location =  pathRoute;

    };

    $scope.logoutUser = function() {

        console.log('Logged out');

        Main.logout(function() {        
            window.location = "/";
        }, function() {
            alert("Failed to logout!");
        });
    };

    $scope.toggleList   = function toggleUsersList() {
        console.log("Toggle sidenav");
        $mdSidenav('left').toggle();
    };



}]);

app.controller('ProgrammDashboardController', ['$scope', '$location', 'Main', function($scope, $location, Main) {
    $scope.openProgramDetails = function() {
        $location.url("/program-details");
    }
}]);