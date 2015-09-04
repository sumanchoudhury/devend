angular
  .module('app')
/**
 * Logout controller
 */
  .controller('LogoutController', ['$scope', '$rootScope', 'LoginService', '$state', '$cookies', 'auth', 'LoopBackAuth', 'UserDetail',
    function($scope, $rootScope, LoginService, $state, $cookies, auth, LoopBackAuth, UserDetail) {

      $scope.logout = function(){
        if (UserDetail.isAuthenticated()) {
          LoginService.logout()
            .then(function() {
              $rootScope.profileId = false;
              $rootScope.profileName = false;
              $cookies.put('profileId', false);
              $cookies.put('profileName', false);
              $cookies.put('currentDashboard', 'dashboard');

              auth.logout();


              $rootScope.currentUser = null;
              LoopBackAuth.currentUserId = null;

              LoopBackAuth.clearUser();
              LoopBackAuth.clearStorage();

              $state.go('home');
            });
        }else {
          $state.go('home');
        }

      };

    }]);