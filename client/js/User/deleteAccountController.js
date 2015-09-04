angular
  .module('app')
/**
 * Delete account controller
 */
  .controller('DeleteAccountController', ['$rootScope', '$scope', '$state', '$stateParams', 'LoopBackAuth', 'UserDetail', '$location', 'UserProfile',
    function($rootScope, $scope, $state, $stateParams, LoopBackAuth, UserDetail, $location, UserProfile) {
      $rootScope.success = false;
      $rootScope.error = false;
      $rootScope.errors = [];

      $scope.user = LoopBackAuth.currentUserData;
      //console.log($scope.user );

      $scope.delete = function() {
        UserDetail.userProfiles({id: LoopBackAuth.currentUserId})
          .$promise
          .then(function(response) {
            angular.forEach(response, function(value, key) {
              UserProfile.deleteById({id:value.id})
                .$promise
                .then(function (delRes) {

                });

            });
          });
        //delete user by id
        UserDetail.deleteById({id: LoopBackAuth.currentUserId})
          .$promise
          .then(function (response) {
            console.log(response);
            $rootScope.success = "Account deleted successfully!";
            $rootScope.error = false;
            LoopBackAuth.clearUser();
            LoopBackAuth.clearStorage();

            $rootScope.currentUser = null;

            $location.nextAfterLogin = $location.path();
            $location.path('/home');

          },
          function (error) {
            console.log(JSON.stringify(error));
          });
        $scope.deletedConfirm = 'Deleted';

      };

    }]);