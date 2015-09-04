angular
  .module('app')
/**
 * Forgot password controller
 */
  .controller('ModalForgotPasswordController', ['$rootScope', '$scope', '$state', '$modal', '$log', 'LoopBackAuth', 'UserDetail',
    function($rootScope, $scope, $state, $modal, $log, LoopBackAuth, UserDetail) {
      $scope.user = {};
      //console.log($scope.user );
      $scope.animationsEnabled = false;

      $scope.openForgotPass = function (size) {

        var modalInstance = $modal.open({
          animation: $scope.animationsEnabled,
          templateUrl: 'forgotpassModalContent.html',
          controller: 'ForgotPassModalInstanceCtrl',
          size: size,
          resolve: {
            items: function () {
              return {
                user: $scope.user
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
 * Forgot password modal form instance controller
 */
  .controller('ForgotPassModalInstanceCtrl', function ($scope, $modalInstance, items, UserDetail) {
    $scope.user = {};
    $scope.items = items;
    $scope.passRemindSent = false;
    $scope.passRemindFailed = false;

    //reset password
    $scope.resetPassword = function(isValid) {
      if(isValid) {
        UserDetail.resetPassword($scope.user)
          .$promise
          .then(function (response) {
            $scope.passRemindFailed = false;
            $scope.passRemindSent = 'Password reset link sent successfully!';
            console.log(response);

          },
          function (error) {
            $scope.passRemindSent = false;
            $scope.passRemindFailed = 'Email not found!';
            console.log(JSON.stringify(error));
          });
      } else {
        console.log("Not valid");
      }

    };

    $scope.ok = function () {

    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  });