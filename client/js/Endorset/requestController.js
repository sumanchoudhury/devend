angular
  .module('app')
/**
 * Endorset Request controller
 */
  .controller('EndorsetRequestController', ['$scope', '$rootScope', 'LoginService', '$state', '$stateParams', 'LoopBackAuth', 'UserDetail', 'CompanyRequest', 'EndorsetSent',
    function($scope, $rootScope, LoginService, $state, $stateParams, LoopBackAuth, UserDetail, CompanyRequest, EndorsetSent) {
      $scope.successMsg = false;
      $scope.errorMsg = false;
      $scope.errors = [];

      $scope.user = LoopBackAuth.currentUserData;

      $scope.id = $stateParams.id;


      $scope.endorsetRequests = [];
      $scope.endorsetRequest = false;
      $scope.isChooseEndorset = false;
      $scope.disableElement = false;
      $scope.disableChoose = true;

      if(LoopBackAuth.currentUserData != null && angular.equals(LoopBackAuth.currentUserData.userTypeId, '5589c00cc05dc30300447176')){
        CompanyRequest.find(
          {
            filter:{
              where:{
                email: LoopBackAuth.currentUserData.email,
                id: $scope.id
              },
              "include": [ {"userDetail":["company"]}, "endorsetSents" ]
            }
          },
          function(endorsetRequests) {
            $scope.endorsetRequests = endorsetRequests;
            if($scope.endorsetRequests.length){
              $scope.endorsetRequest = endorsetRequests[0];
            }
          },
          function(errorResponse) { console.log(errorResponse); }
        );
      } else if(LoopBackAuth.currentUserData != null && angular.equals(LoopBackAuth.currentUserData.userTypeId, '5589c01bc05dc30300447177')){
        $state.go('dashboard');

      } else {
        $state.go('home');
      }





    }]);