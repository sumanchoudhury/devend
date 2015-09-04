angular
  .module('app')
/**
 * Identity controller
 */
  .controller('IdentityController', ['$rootScope', '$scope', 'LoginService', '$state', 'LoopBackAuth', 'UserDetail', 'UserIdentity', '$filter', '$modal', '$log',
    function($rootScope, $scope, LoginService, $state, LoopBackAuth, UserDetail, UserIdentity, $filter, $modal, $log) {
      $scope.animationsEnabled = false;
      /**
       * Open identity modal
       * @param size
       */
      $scope.openIdentityModal = function(size){
        var modalInstance = $modal.open({
          animation: $scope.animationsEnabled,
          templateUrl: 'identityModalContent.html',
          controller: 'IdentityModalInstanceCtrl',
          size: size,
          resolve: {
            items: function () {
              return {

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

      $scope.buttonText = 'Next';
      $scope.user = {};
      $scope.profiles = [];
      UserDetail.userProfiles({id: LoopBackAuth.currentUserId})
        .$promise
        .then(function(response) {
          $scope.profiles = response;
          if($scope.profiles.length){
            $scope.buttonText = 'Save';
          }
        });

      $scope.userIdentity = {};

      $scope.today = function() {
        $scope.dob = new Date();
      };
      $scope.today();

      $scope.clear = function () {
        $scope.dob = null;
      };
      $scope.dateFormat = 'yyyy/MM/dd';
      $scope.openDobDate = false;

      $scope.openDate = function($event, date) {
        $event.preventDefault();
        $event.stopPropagation();

        if(date == 'openDobDate'){
          $scope.openDobDate = true;
        }
      };



      LoginService.me().$promise
        .then(function(response) {
          //console.log(response);
          $scope.user = response;
        });


      //save identity
      $scope.save = function(isValid) {
        if(isValid) {
          $scope.user.dob = $filter('date')($scope.user.dob, "yyyy-MM-dd");
          LoginService.update(LoopBackAuth.currentUserId, $scope.user).then(function (response) {
            if($scope.profiles.length){
              $rootScope.success = "Account saved successfully!";
              $rootScope.error = false;
            } else {
              $state.transitionTo('add-profile');
            }


          });
        } else {
          console.log("Not valid");
        }

      };
    }])
/**
 * Files controller
 */
  .controller('FilesController', function ($scope, $http) {

    $scope.load = function () {
      $http.get('/api/containers/container1/files').success(function (data) {
        console.log(data);
        $scope.files = data;
      });
    };

    $scope.delete = function (index, id) {
      $http.delete('/api/containers/container1/files/' + encodeURIComponent(id)).success(function (data, status, headers) {
        $scope.files.splice(index, 1);
      });
    };

    $scope.$on('uploadCompleted', function(event) {
      console.log('uploadCompleted event received');
      $scope.load();
    });

  })

/**
 * Identity model controller
 */
  .controller('IdentityModalInstanceCtrl', function ($rootScope, $scope, $state, $modalInstance, items, LoginService, $state, LoopBackAuth, UserDetail, UserIdentity, $filter) {
    $rootScope.successMsg = false;
    $rootScope.errorMsg = false;
    $rootScope.errors = [];

    $scope.buttonText = 'Next';
    $scope.user = {};
    $scope.profiles = [];
    UserDetail.userProfiles({id: LoopBackAuth.currentUserId})
      .$promise
      .then(function(response) {
        $scope.profiles = response;
        if($scope.profiles.length){
          $scope.buttonText = 'Save';
        }
      });

    $scope.userIdentity = {};

    $scope.today = function() {
      $scope.dob = new Date();
    };
    $scope.today();

    $scope.clear = function () {
      $scope.dob = null;
    };
    $scope.dateFormat = 'yyyy/MM/dd';
    $scope.openDobDate = false;

    $scope.openDate = function($event, date) {
      $event.preventDefault();
      $event.stopPropagation();

      if(date == 'openDobDate'){
        $scope.openDobDate = true;
      }
    };



    LoginService.me().$promise
      .then(function(response) {
        //console.log(response);
        $scope.user = response;
      });


    //save identity
    $scope.save = function(isValid) {
      if(isValid) {
        $modalInstance.close('cancel');
        $scope.user.dob = $filter('date')($scope.user.dob, "yyyy-MM-dd");
        LoginService.update(LoopBackAuth.currentUserId, $scope.user).then(function (response) {
          if($scope.profiles.length){
            $rootScope.success = "Account saved successfully!";
            $rootScope.error = false;
          } else {
            $state.transitionTo('add-profile');
          }


        });
      } else {
        console.log("Not valid");
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