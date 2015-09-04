angular
  .module('app')
/**
 * Received Invite Controller
 */
  .controller('ReceivedInviteController', ['$rootScope', '$scope', '$state', '$stateParams', 'LoopBackAuth', 'UserDetail', '$location', 'InviteUser',
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
                email: LoopBackAuth.currentUserData.email
              },
              order: 'created DESC',
              include:[
                {'adminUser':["company"]}, 'userDetail'
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


      /**
       * Accept invites
       */
      $scope.acceptInvite = function(invite){
        InviteUser
          .prototype$updateAttributes({id:invite.id}, {isViewed: true, status: 1, userDetailId: LoopBackAuth.currentUserId})
          .$promise
          .then(function(res){
            console.log(res);
            $rootScope.success = "You have successfully accepted!";
            $scope.loadInvites();
          });
      };

      /**
       * Mark as viewed
       * @param invite
       */
      $scope.markAsViewed = function(invite){

      };

    }]);