angular
  .module('app')
/**
 * Delete profile controller
 */
  .controller('DeleteProfileController', ['$rootScope', '$scope', '$state', '$stateParams', 'LoopBackAuth', 'UserDetail', 'UserProfile',
    function($rootScope, $scope, $state, $stateParams, LoopBackAuth, UserDetail, UserProfile) {
      $rootScope.success = false;
      $rootScope.error = false;
      $rootScope.errors = [];

      $scope.user = LoopBackAuth.currentUserData;
      //console.log($scope.user );

      $scope.deleteProfile = function(id) {
        //call delete profile
        UserProfile.deleteById({id:id})
          .$promise
          .then(function (response) {
            console.log(response);
            $rootScope.success = "Profile deleted successfully!";
            $rootScope.error = false;
            $rootScope.menuProfiles = [];

            //update profile menu
            UserDetail.userProfiles({id: LoopBackAuth.currentUserId})
              .$promise
              .then(function(response) {
                $rootScope.menuProfiles = response;
              });
          },
          function (error) {
            console.log(JSON.stringify(error));
          });
        $scope.deletedConfirm = 'Deleted';
      };

    }]);