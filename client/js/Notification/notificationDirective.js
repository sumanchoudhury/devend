angular
  .module('app')
  .directive('notificationModal', function(){
    return {
      restrict: 'E',
      scope: false,
      templateUrl: 'views/notification/widgets/modal.html'
    }
  })
  .directive('notificationsListModal', function(){
    return {
      restrict: 'E',
      scope: false,
      templateUrl: 'views/notification/widgets/notifications-list-modal.html'
    }
  });
