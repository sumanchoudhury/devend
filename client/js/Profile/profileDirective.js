angular
  .module('app')
  .directive('editProfile', function(){
    return {
      restrict: 'E',
      scope: false,
      templateUrl: 'views/profile/widgets/edit-profile.html'
    }
  });
