// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', [
  'ionic',
  'firebase',
])

.factory("Auth", ["$firebaseAuth",
  function($firebaseAuth) {
    var ref = new Firebase("https://mcapp-87c82.firebaseio.com/");
    return $firebaseAuth(ref);
  }
])

.run(function ($ionicPlatform, $rootScope, $location, Auth, $ionicLoading) {
    $ionicPlatform.ready(function () {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        }
        // To Resolve Bug
        ionic.Platform.fullScreen();

        $rootScope.firebaseUrl = "https://mcapp-87c82.firebaseio.com/";
        $rootScope.displayName = null;

        // Auth.$onAuth(function (authData) {
        //     if (authData) {
        //         console.log("Logged in as:", authData.uid);
        //     } else {
        //         console.log("Logged out");
        //         $ionicLoading.hide();
        //         $location.path('/login');
        //     }
        // });
        auth.onAuthStateChanged(function(user) {
          if (user) {
            // User signed in!
            console.log("Logged in as:", user);
            var uid = user.uid;
          } else {
             console.log("Logged out");
             $ionicLoading.hide();
             $location.path('/login');
          }
        });

        $rootScope.logout = function () {
            console.log("Logging out from the app");
            $ionicLoading.show({
                template: 'Logging Out...'
            });
            Auth.$unauth();
        }


        $rootScope.$on("$stateChangeError", function (event, toState, toParams, fromState, fromParams, error) {
            // We can catch the error thrown when the $requireAuth promise is rejected
            // and redirect the user back to the home page
            if (error === "AUTH_REQUIRED") {
                $location.path("/login");
            }
        });
    });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
  .state('raakahavikki', {
    url: '/raakahavikki',
    templateUrl: 'templates/raakahavikki.html',
    controller: 'raakahavikkiCtrl',
    resolve: {
            // controller will not be loaded until $requireAuth resolves
            // Auth refers to our $firebaseAuth wrapper in the example above
            "currentAuth": ["Auth",
                function (Auth) {
                    // $requireAuth returns a promise so the resolve waits for it to complete
                    // If the promise is rejected, it will throw a $stateChangeError (see above)
                    return Auth.$requireAuth();
      }]
      }
  })
  .state('tuorehavikki', {
    url: '/tuorehavikki',
    templateUrl: 'templates/tuorehavikki.html',
    controller: 'tuorehavikkiCtrl',
    resolve: {
            // controller will not be loaded until $requireAuth resolves
            // Auth refers to our $firebaseAuth wrapper in the example above
            "currentAuth": ["Auth",
                function (Auth) {
                    // $requireAuth returns a promise so the resolve waits for it to complete
                    // If the promise is rejected, it will throw a $stateChangeError (see above)
                    return Auth.$requireAuth();
      }]
      }
  })
  .state('kirjaudu', {
    url: '/kirjaudu',
    templateUrl: 'templates/kirjaudu.html',
    controller: 'kirjauduCtrl',
    resolve: {
            "currentAuth": ["Auth",
                function (Auth) {
                    return Auth.$waitForAuth();
        }]
        }
  })
  $urlRouterProvider.otherwise("/kirjaudu");
})


.controller('starterCtrl',function($scope, $ionicSideMenuDelegate) {
  $scope.toggleLeft= function() {
    $ionicSideMenuDelegate.toggleLeft();
  };
})

.controller('raakahavikkiCtrl', function(){

})

.controller('tuorehavikkiCtrl', function(){

})

.controller('kirjauduCtrl', function ($scope, $ionicModal, $state, $firebaseAuth, $ionicLoading, $rootScope) {
console.log('Login Controller Initialized');

var ref = new Firebase("https://mcapp-87c82.firebaseio.com/");
// var auth = $firebaseAuth(ref);
var auth = firebase.auth();
var provider = new firebase.auth.GoogleAuthProvider();
auth.signInWithPopup(provider).then(function(result) {
  var accessToken = result.credential.accessToken;
});


$ionicModal.fromTemplateUrl('templates/uusi-kayttaja.html', {
    scope: $scope
}).then(function (modal) {
    $scope.modal = modal;
});

$scope.createUser = function (user) {
    console.log("Create User Function called");
    if (user && user.email && user.password && user.displayname) {
        $ionicLoading.show({
            template: 'Signing Up...'
        });

        auth.$createUser({
            email: user.email,
            password: user.password
        }).then(function (userData) {
            alert("User created successfully!");
            ref.child("users").child(userData.uid).set({
                email: user.email,
                displayName: user.displayname
            });
            $ionicLoading.hide();
            $scope.modal.hide();
        }).catch(function (error) {
            alert("Error: " + error);
            $ionicLoading.hide();
        });
    } else
        alert("Please fill all details");
}

$scope.signIn = function (user) {

    if (user && user.email && user.pwdForLogin) {
        $ionicLoading.show({
            template: 'Signing In...'
        });
        auth.$authWithPassword({
            email: user.email,
            password: user.pwdForLogin
        }).then(function (authData) {
            console.log("Logged in as:" + authData.uid);
            ref.child("users").child(authData.uid).once('value', function (snapshot) {
                var val = snapshot.val();
                // To Update AngularJS $scope either use $apply or $timeout
                $scope.$apply(function () {
                    $rootScope.displayName = val;
                });
            });
            $ionicLoading.hide();
            $state.go('tab.rooms');
        }).catch(function (error) {
            alert("Authentication failed:" + error.message);
            $ionicLoading.hide();
        });
    } else
        alert("Please enter email and password both");
}
});
