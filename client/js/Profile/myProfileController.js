angular
  .module('app')
/**
 * My Profile controller
 */
  .controller('MyProfileController', ['$rootScope', '$scope', '$state', 'LoopBackAuth', 'UserDetail', 'UserProfile',
    function($rootScope, $scope, $state, LoopBackAuth, UserDetail, UserProfile) {
      $scope.user = LoopBackAuth.currentUserData;
      //console.log($scope.user );
      $scope.profiles = [];
      UserDetail.userProfiles({id: LoopBackAuth.currentUserId})
        .$promise
        .then(function(response) {
          $scope.profiles = response;
        });
      $scope.userProfile = {userDetailId:  LoopBackAuth.currentUserId};

      //create new profile
      $scope.save = function(isValid) {
        if(isValid) {
          UserProfile.create($scope.userProfile)
            .$promise
            .then(function (response) {
              console.log(response);
              $state.transitionTo('dashboard');
            },
            function (error) {
              console.log(JSON.stringify(error));
            });
        } else {
          console.log("Not valid");
        }

      };

    }]);