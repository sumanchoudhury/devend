angular
  .module('app')
/**
 * QuestionController
 */
  .controller('QuestionController', ['$scope', '$rootScope', 'LoginService', '$state', '$stateParams', 'LoopBackAuth', 'UserDetail', 'EndorserEndorsement', 'Question',
    function($scope, $rootScope, LoginService, $state, $stateParams, LoopBackAuth, UserDetail, EndorserEndorsement, Question) {
      $scope.successMsg = false;
      $scope.errorMsg = false;
      $scope.errors = [];

      $scope.user = LoopBackAuth.currentUserData;

      $scope.id = $stateParams.id;

      $scope.isQuestionEnable = true;

      $scope.endorsementData = {endorserEndorsement: {questions: []}};

      Question.find(
        {
          filter:{
            where:{
              id:  $scope.id
            },
            "include":
              [
                "hrDetail",
                "endorser",
                {
                  "endorsement":[
                    "userDetail",
                    {
                      "endorsementCompanies":[
                        "endorsementProjects"
                      ]
                    }
                  ]
                },
                {
                  "endorserEndorsement": [
                    "userDetail",
                    {
                      "questions": [
                        "endorser",
                        "hrDetail",
                        {
                          "questions":[
                            "endorser",
                            "hrDetail",
                            {
                              "questions":[
                                "endorser",
                                "hrDetail"
                              ]
                            }
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
          }
        },
        function(questions){
          console.log(questions);
          if(questions.length){
            $scope.endorsementData.endorserEndorsement = questions[0].endorserEndorsement;
          }

        },
        function(errorResponse) { console.log(errorResponse); }
      )

    }]);