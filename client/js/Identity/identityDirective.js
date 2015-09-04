angular
  .module('app')
  .directive('identityModal', function(){
    return {
      restrict: 'E',
      scope: false,
      templateUrl: 'views/identity/widgets/modal.html'
    }
  });
