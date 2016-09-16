// Ionic Starter App
var config = {
  apiKey: "AIzaSyDYttWeJI2F85Jbczkx-5TCEqRAu6JaNbs",
  authDomain: "mcapp-87c82.firebaseapp.com",
  databaseURL: "https://mcapp-87c82.firebaseio.com",
  storageBucket: "mcapp-87c82.appspot.com",
  messagingSenderId: "114890888130"
};
firebase.initializeApp(config);
var rootRef = firebase.database().ref();
// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic','firebase'])

.factory("Auth", ["$firebaseAuth",
  function($firebaseAuth) {
    return $firebaseAuth();
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

        Auth.$onAuthStateChanged(function(user) {
          if (user) {
            // User signed in!
            console.log("Logged in as:", user);
            var uid = user.uid;
          } else {
             console.log("Logged out");
             $ionicLoading.hide();
             $location.path('/kirjaudu');
          }
        });

        $rootScope.logout = function () {
            console.log("Logging out from the app");
            $ionicLoading.show({
                template: 'Logging Out...'
            });
            Auth.$unauth();
        };


        $rootScope.$on("$stateChangeError", function (event, toState, toParams, fromState, fromParams, error) {
            // We can catch the error thrown when the $requireAuth promise is rejected
            // and redirect the user back to the home page
            if (error === "AUTH_REQUIRED") {
                $location.path('/kirjaudu');
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
    // resolve: {
    //         // controller will not be loaded until $requireAuth resolves
    //         // Auth refers to our $firebaseAuth wrapper in the example above
    //         "currentAuth": ["Auth",
    //             function (Auth) {
    //                 // $requireAuth returns a promise so the resolve waits for it to complete
    //                 // If the promise is rejected, it will throw a $stateChangeError (see above)
    //                 return Auth.$requireAuth();
    //   }]
    //   }
  })
  .state('tuorehavikki', {
    url: '/tuorehavikki',
    templateUrl: 'templates/tuorehavikki.html',
    controller: 'tuorehavikkiCtrl',
    // resolve: {
    //         // controller will not be loaded until $requireAuth resolves
    //         // Auth refers to our $firebaseAuth wrapper in the example above
    //         "currentAuth": ["Auth",
    //             function (Auth) {
    //                 // $requireAuth returns a promise so the resolve waits for it to complete
    //                 // If the promise is rejected, it will throw a $stateChangeError (see above)
    //                 return Auth.$requireAuth();
    //   }]
    //   }
  })
  .state('kirjaudu', {
    url: '/kirjaudu',
    templateUrl: 'templates/kirjaudu.html',
    controller: 'kirjauduCtrl',
  //   resolve: {
  //           "currentAuth": ["Auth",
  //               function (Auth) {
  //                   return Auth.$waitForAuth();
  //       }]
  //       }
   })
  $urlRouterProvider.otherwise('/kirjaudu');
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
  var rootRef = new Firebase("https://mcapp-87c82.firebaseio.com");
  // var auth = $firebaseAuth(ref);
  var auth = firebase.auth();
  var authObj = $firebaseAuth();
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

          authObj.$createUserWithEmailAndPassword(user.email, user.password)
            .then(function(firebaseUser) {
              console.log("User " + firebaseUser.uid + " created successfully!");
              $ionicLoading.hide();
              $scope.modal.hide();
            }).catch(function(error) {
              console.error("Error: ", error);
            });
            $ionicLoading.hide();
            $scope.modal.hide();
      //     auth.$createUser({
      //         email: user.email,
      //         password: user.password
      //     }).then(function (userData) {
      //         alert("User created successfully!");
      //         ref.child("users").child(userData.uid).set({
      //             email: user.email,
      //             displayName: user.displayname
      //         });
      //         $ionicLoading.hide();
      //         $scope.modal.hide();
      //     }).catch(function (error) {
      //         alert("Error: " + error);
      //         $ionicLoading.hide();
      //     });
    } else {
          alert("Please fill all details");
        }
      }
  $scope.signIn = function (user) {

      if (user && user.email && user.pwdForLogin) {
          $ionicLoading.show({
              template: 'Signing In...'
          });

          authObj.$signInWithEmailAndPassword(user.email, user.pwdForLogin).then(function(firebaseUser) {
            console.log("Signed in as:", firebaseUser.uid);
            $ionicLoading.hide();
            $state.go('/raakahavikki');
          }).catch(function(error) {
            console.error("Authentication failed:", error);
            $ionicLoading.hide();
          });
          // auth.$authWithPassword({
          //     email: user.email,
          //     password: user.pwdForLogin
          // }).then(function (authData) {
          //     console.log("Logged in as:" + authData.uid);
          //     ref.child("users").child(authData.uid).once('value', function (snapshot) {
          //         var val = snapshot.val();
          //         // To Update AngularJS $scope either use $apply or $timeout
          //         $scope.$apply(function () {
          //             $rootScope.displayName = val;
          //         });
          //     });
          //     $ionicLoading.hide();
          //     $state.go('tab.rooms');
          // }).catch(function (error) {
          //     alert("Authentication failed:" + error.message);
          //     $ionicLoading.hide();
          // });
      } else {
          alert("Please enter email and password both");
        }
      }
});
