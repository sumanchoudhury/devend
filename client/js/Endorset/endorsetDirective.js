angular
  .module('app')
  .directive('endorsetList', function(){
    return {
      restrict: 'E',
      scope: false,
      templateUrl: 'views/endorset/widgets/endorset-list.html'
    }
  })
  .directive('endorsetModal', function(){
    return {
      restrict: 'E',
      scope: false,
      templateUrl: 'views/endorset/widgets/endorset-modal.html'
    }
  })
  .directive('endorsetRequest', function(){
    return {
      restrict: 'E',
      scope: false,
      templateUrl: 'views/endorset/widgets/endorset-request.html'
    }
  })
  .directive('addEndorsementToEndorset', function(){
    return {
      restrict: 'E',
      scope: false,
      templateUrl: 'views/endorset/widgets/add-endorsement-to-endorset.html'
    }
  });
