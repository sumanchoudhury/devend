angular
  .module('app')
  .directive('questionAnswer', function(){
    return {
      restrict: 'E',
      scope: false,
      templateUrl: 'views/question/widgets/question-answer.html'
    }
  });
