angular
  .module('app')
/**
 * Edit profile controller
 */
  .controller('EditProfileController', ['$rootScope', '$scope', '$state', '$modal', '$log', '$stateParams', 'LoopBackAuth', 'UserDetail',
    function($rootScope, $scope, $state, $modal, $log, $stateParams, LoopBackAuth, UserDetail) {
      $scope.successMsg = false;
      $scope.errorMsg = false;
      $scope.errors = [];

      $scope.user = LoopBackAuth.currentUserData;

      $scope.animationsEnabled = false;

      //open edit profile modal
      $scope.openProfile = function (size, profileId) {
        $scope.profileId = profileId;
        console.log(profileId);
        var modalInstance = $modal.open({
          animation: $scope.animationsEnabled,
          templateUrl: 'profileModalContent.html',
          controller: 'ProfileModalInstanceCtrl',
          size: size,
          resolve: {
            items: function () {
              return {
                profileId: profileId
              };
            }
          }
        });

        modalInstance.result.then(function (selectedItem) {
          $scope.selected = selectedItem;
        }, function () {
          $log.info('Modal dismissed at: ' + new Date());
        });
      };

      $scope.toggleAnimation = function () {
        $scope.animationsEnabled = !$scope.animationsEnabled;
      };

    }])
/**
 * Profile modal instance controller
 */
  .controller('ProfileModalInstanceCtrl', function ($rootScope, $scope, $state, $modalInstance, items, $filter, LoopBackAuth, UserDetail, UserProfile) {
    $scope.user = LoopBackAuth.currentUserData;
    $scope.successMsg = false;
    $scope.errorMsg = false;
    $scope.errors = [];

    $scope.profileId = items.profileId;

    $scope.userProfile = [];
    UserProfile.findById({id: $scope.profileId})
      .$promise
      .then(function(response) {
        $scope.userProfile = response;
      });

    //update profile
    $scope.saveProfile = function(isValid) {
      $rootScope.successMsg = false;
      $rootScope.errorMsg = false;
      if(isValid) {
        UserProfile.prototype$updateAttributes({id:$scope.profileId}, $scope.userProfile)
          .$promise
          .then(function (response) {
            if(response.error == null){
              $scope.successMsg = "Profile saved successfully!";
              $scope.errorMsg = false;
              $rootScope.menuProfiles = [];
              UserDetail.userProfiles({id: LoopBackAuth.currentUserId})
                .$promise
                .then(function(response) {
                  $rootScope.menuProfiles = response;
                  $modalInstance.close();
                });
            } else {
              $scope.errorMsg = true;
              $scope.errors = response.error.message;
            }

          },
          function (error) {
            console.log(JSON.stringify(error));
          });
      } else {
        $scope.errorMsg = true;
        $scope.errors = [
          {
            'error': "Complete the form!"
          }
        ];
      }

    };
    $scope.ok = function () {
      $modalInstance.close();
    };

    //cancel modal
    $scope.cancel = function () {
      //console.log(items);
      $modalInstance.dismiss('cancel');
    };
  });