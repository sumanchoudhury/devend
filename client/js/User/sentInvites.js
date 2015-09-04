angular
  .module('app')
/**
 * Sent Invite Controller
 */
  .controller('SentInviteController', ['$rootScope', '$scope', '$state', '$stateParams', 'LoopBackAuth', 'UserDetail', '$location', 'InviteUser',
    function($rootScope, $scope, $state, $stateParams, LoopBackAuth, UserDetail, $location, InviteUser) {
      $rootScope.successMsg = false;
      $rootScope.errorMsg = false;
      $rootScope.errors = [];

      $scope.invites = [];

      /**
       * load invites
       */
      $scope.loadInvites = function(){
        InviteUser.find(
          {
            filter:{
              limit: 30,
              where:{
                createdBy: LoopBackAuth.currentUserId
              },
              order: 'created DESC',
              include:[
                'adminUser', 'userDetail'
              ]
            }
          },
          function(invites) {
            $scope.invites = invites;

          },
          function(errorResponse) { console.log(errorResponse); }
        );
      };

      $scope.loadInvites();

    }]);