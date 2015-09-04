angular
  .module('app')
  .directive('editMyAccount', function(){
    return {
      restrict: 'E',
      scope: false,
      templateUrl: 'views/user/widgets/edit-my-account.html'
    }
  })
  .directive('sentInvitation', function(){
    return {
      restrict: 'E',
      scope: false,
      templateUrl: 'views/user/widgets/sent-invites.html'
    }
  })
  .directive('receivedInvitation', function(){
    return {
      restrict: 'E',
      scope: false,
      templateUrl: 'views/user/widgets/received-invites.html'
    }
  })
  .directive('inviteUserModal', function(){
    return {
      restrict: 'E',
      scope: false,
      templateUrl: 'views/user/widgets/invite-company-user-modal.html'
    }
  })
  .directive('myTeam', function(){
    return {
      restrict: 'E',
      scope: false,
      templateUrl: 'views/user/widgets/my-team.html'
    }
  })
  .directive('receivedInviteModal', function(){
    return {
      restrict: 'E',
      scope: false,
      templateUrl: 'views/user/widgets/received-invite-modal.html'
    }
  })
  .directive('myTeamModal', function(){
    return {
      restrict: 'E',
      scope: false,
      templateUrl: 'views/user/widgets/my-team-modal.html'
    }
  });
