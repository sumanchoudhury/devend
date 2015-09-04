angular
  .module('app')
  .controller('UseTypeController', ['$rootScope', '$scope', 'LoginService', '$state', 'LoopBackAuth', 'UserDetail', '$filter', '$cookies', 'InviteUser',
    function($rootScope, $scope, LoginService, $state, LoopBackAuth, UserDetail, $filter, $cookies, InviteUser) {

      if($rootScope.acceptedInvitationCount == undefined){
        $rootScope.acceptedInvitationCount  = 0;
      }

      InviteUser.count(
        {
          where:{
            userDetailId: LoopBackAuth.currentUserId,
            status: 1
          }
        },
        function(acceptedInvitationCount) {
          $rootScope.acceptedInvitationCount  = acceptedInvitationCount.count;
          if($rootScope.acceptedInvitationCount == 0){

            $cookies.put('currentDashboard', 'dashboard');
          }
        },
        function(errorResponse) { console.log(errorResponse); }
      );


      $rootScope.useType = LoginService.getUseType();
      $rootScope.currentDashboard = $cookies.get('currentDashboard');
      if($rootScope.currentDashboard == null || $rootScope.currentDashboard == undefined){
        $rootScope.currentDashboard = 'dashboard';
      }
      /**
       * change dashboard
       * @param type
       */
      $scope.changeDashboardType = function(type){
        LoginService.setUseType(type);

        $rootScope.useType = LoginService.getUseType();
        if(type == 1){
          $cookies.put('currentDashboard', 'companydashboard');
          $rootScope.currentDashboard = 'companydashboard';
          $state.go('companydashboard');
        } else if(type == 2){
          $rootScope.currentDashboard = 'dashboard';
          $cookies.put('currentDashboard', 'dashboard');
          $state.go('dashboard');
        }

      };


      //ask endorsement
      $scope.askEndorsement = function(){
        if($state.is('dashboard')){
          $scope.$broadcast("openNewRequestEvent", {});
        } else {
          $cookies.put('currentDashboard', 'dashboard');
          $state.go('dashboard');
        }


      }
    }
  ]
);
