angular
  .module('app')
/**
 * Endorsement Received controller
 */
  .controller('EndorsementReceivedController', ['$scope', '$rootScope', 'LoginService', '$state', '$stateParams', '$filter', 'LoopBackAuth', 'UserDetail', 'EndorsementService',
    function($scope, $rootScope, LoginService, $state, $stateParams, $filter, LoopBackAuth, UserDetail, EndorsementService) {
      $scope.successMsg = false;
      $scope.errorMsg = false;
      $scope.errors = [];

      $scope.user = LoopBackAuth.currentUserData;

      $scope.id = $stateParams.id;


      $scope.disableEndorsementElement = true;
      $scope.endorsementData = {endorsement:null, sentEndorsements:[], receivedEndorsements: [], draftEndorsements:[], endorserEndorsement:{questions:[]}};

      if(LoopBackAuth.currentUserData != null && angular.equals(LoopBackAuth.currentUserData.userTypeId, '5589c00cc05dc30300447176')){
        EndorsementService.getEndorserEndorsement(
          {
            filter:{
              where:{
                id: $scope.id
              },
              "include": [
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
                "userProfile",
                "userDetail",
                "endorsets",
                { "questions": [
                  "endorser",
                  {
                    "questions":[
                      "endorser",
                      {
                        "questions":[
                          "endorser"
                        ]
                      }
                    ]
                  }
                ]
                }
              ]
            }
          },
          function(endorsements) {
            angular.forEach(endorsements, function(endorsement, key){

              if(endorsement.acceptStatus == 1){
                endorsements[key].endorserAcceptStatus = 1;
              } else if(endorsement.acceptStatus == 2){
                endorsements[key].endorserAcceptStatus = 2;
              } else {
                endorsements[key].endorserAcceptStatus = 0;
              }

              var endorsetScore = 0;
              var totalScoreItem = 0;
              angular.forEach(endorsement.skillScores, function(score, key){
                endorsetScore += parseFloat(score);
                totalScoreItem++;
              });
              angular.forEach(endorsement.projectScores, function(score, key){
                endorsetScore += parseFloat(score);
                totalScoreItem++;
              });
              var avgEndorsetScore = 0.0;
              if(totalScoreItem){
                avgEndorsetScore = endorsetScore/totalScoreItem;
              }
              endorsements[key].avgEndorsetScore = $filter('number')(avgEndorsetScore, 2);

            });
            $scope.endorsementData.receivedEndorsements = endorsements;
            if($scope.endorsementData.receivedEndorsements.length){
              $scope.endorsementData.endorsement = $scope.endorsementData.receivedEndorsements[0];
              $scope.endorsementData.endorserEndorsement.questions = $scope.endorsementData.receivedEndorsements[0].questions;

              if(!$scope.endorsementData.receivedEndorsements[0].isDraft){
                $scope.disableEndorsementElement = true;
              } else {
                $scope.disableEndorsementElement = false;
              }
            }


          },
          function(errorResponse) { console.log(errorResponse); }
        );
      } else if(LoopBackAuth.currentUserData != null && angular.equals(LoopBackAuth.currentUserData.userTypeId, '5589c01bc05dc30300447177')){
        $state.go('dashboard');

      } else {
        $state.go('home');
      }

    }]);