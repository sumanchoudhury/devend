angular
  .module('app')
  /*Endorsement Details*/
  .directive('endorsement', function(){
    return {
      restrict: 'E',
      scope: false,
      templateUrl: 'views/endorsement/widgets/endorsement.html'
    }
  })
  /*Recevied Endorsement Request*/
  .directive('receivedEndorsement', function(){
    return {
      restrict: 'E',
      scope: false,
      templateUrl: 'views/endorsement/widgets/received-endorsement.html'
    }
  });
