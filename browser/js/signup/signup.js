app.config(function ($stateProvider) {

    $stateProvider.state('signup', {
        url: '/signup',
        templateUrl: 'js/signup/signup.html',
        controller: 'SignupCtrl'
    });

});

app.controller('SignupCtrl', function ($scope, AuthService, $state) {

    $scope.login = {};
    $scope.error = null;

    $scope.sendLogin = function (loginInfo) {
        $scope.error = null;

        AuthService.signup(loginInfo).then(function(){
          AuthService.login(loginInfo).then(function () {
              $state.go('home');
          }).catch(function () {
              $scope.error = 'Invalid login credentials.';
          });
        }).then(null,function(err){
          $scope.error=err;
        });
    };

});