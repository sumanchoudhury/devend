angular
  .module('app')
/**
 * MyAccount controller
 */
  .controller('MyAccountController', ['$rootScope', '$scope', 'LoginService', '$state', '$modal', '$log', 'LoopBackAuth',
  function($rootScope, $scope, LoginService, $state, $modal, $log, LoopBackAuth) {
    $scope.user = {id: LoopBackAuth.currentUserId};
    $rootScope.successMsg = false;
    $rootScope.errorMsg = false;
    $rootScope.errors = [];
    $scope.animationsEnabled = false;

    /**
     * open account edit modal
     * @param size
     */
    $scope.openMyAccount = function (size) {

      var modalInstance = $modal.open({
        animation: $scope.animationsEnabled,
        templateUrl: 'accountModalContent.html',
        controller: 'AccountModalInstanceCtrl',
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
        console.log(selectedItem);
      }, function () {
        $log.info('Modal dismissed at: ' + new Date());
      });
    };

    $scope.toggleAnimation = function () {
      $scope.animationsEnabled = !$scope.animationsEnabled;
    };


  }])
/**
 * Account edit modal instance controller
 */
  .controller('AccountModalInstanceCtrl', function ($rootScope, $scope, $state, $modalInstance, items, $filter, LoopBackAuth, UserDetail, LoginService, CloudinaryImage, Upload) {
    $scope.user = LoopBackAuth.currentUserData;
    $rootScope.successMsg = false;
    $rootScope.errorMsg = false;
    $rootScope.errors = [];

    LoginService.me().$promise
      .then(function(response) {
        //console.log(response);
        $scope.user = response;
      });

    //save account info
    $scope.saveMyAccount = function(isValid) {
      $rootScope.successMsg = false;
      $rootScope.errorMsg = false;
      $rootScope.successMsg = false;
      $rootScope.errorMsg = false;
      if(isValid){
        LoginService.update(LoopBackAuth.currentUserId, $scope.user).then(function(response) {
          //console.log(response);
          $rootScope.successMsg = "Account saved successfully!";
          $rootScope.errorMsg = false;
          $modalInstance.close('cancel');
        });
      } else {
        $rootScope.errorMsg = true;
        $rootScope.errors = [
          {
            'error': "Complete the form!"
          }
        ];
      }

    };


    //image upload
    $scope.$watch('files', function () {
      $scope.upload($scope.files);
    });
    $scope.upload = function (files) {
      if (files && files.length) {
        for (var i = 0; i < files.length; i++) {
          var file = files[i];
          Upload.upload({
            url: "/api/userDetails/upload",
            fields: {id: LoopBackAuth.currentUserId},
            file: file
          }).progress(function (evt) {
            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
          }).success(function (data, status, headers, config) {
            $scope.user = UserDetail.getCurrent();
            console.log('file ' + config.file.name + 'uploaded. Response: ' + data);
          }).error(function (data, status, headers, config) {
            console.log('error status: ' + status);
          })
        }
      }
    };


    $scope.ok = function () {
      $modalInstance.close('cancel');
    };

    //close modal
    $scope.cancel = function () {
      //console.log(items);
      $modalInstance.dismiss('cancel');
    };
  });