angular
  .module('app')
/**
 * MyEndorsetController
 *
 * MyEndorsetController will control the my endorsets and endorsets requests
 */
  .controller('MyEndorsetController',
  [
    '$rootScope', '$scope', '$state', '$stateParams', '$modal', '$log', '$filter', 'LoopBackAuth', 'UserDetail', 'UserProfile', 'CompanyRequest', 'EndorsetSent', 'ngToast', 'notificationService',
    function($rootScope, $scope, $state, $stateParams, $modal, $log, $filter, LoopBackAuth, UserDetail, UserProfile, CompanyRequest, EndorsetSent, ngToast, notificationService) {
      /**
       * Current logged-in user object
       * @type {Object|*}
       */
      $rootScope.user = LoopBackAuth.currentUserData;

      $rootScope.showDashboardWidget  =  true;

      /**
       * global success message
       * @type {boolean}
       */
      $rootScope.successMsg = false;

      $rootScope.dashboardTab = {endorsements: 'requests', endorsets: 'list'};

      /**
       * global error message
       * @type {boolean}
       */
      $rootScope.errorMsg = false;
      $rootScope.errors = [];

      //enable/disable element
      $rootScope.disableElement = false;

      //endorset requests
      $rootScope.endorsetRequests = [];

      $rootScope.isChooseEndorset = false;
      $rootScope.disableChoose = false;



      /**
       * My Endorsets tab
       */

      //profiles collection
      $rootScope.profiles = [];

      //profile object
      $rootScope.profile  = {};
;
      /**
       * Endorset collection
       */
      $rootScope.endorsets = [];

      //endorset object
      $rootScope.endorset = {userProfile: null, userDetail: null};

      $rootScope.selectProfile = function(profile){
        //console.log(profile);
        $rootScope.endorset.userProfile  = profile;
        $rootScope.endorset.userDetail  = profile.userDetail;

      };

      //find project name
      $scope.findProjectNameByIdFromEndorsement = function(endorsement, projectId){
        var projectName = '';
        angular.forEach(endorsement.endorsementCompanies, function(company, companyIndex){
          //console.log(company);
          if(company.endorsementProjects){
            //console.log(company.endorsementProjects);
            angular.forEach(company.endorsementProjects, function(project, projectIndex){
              if(angular.equals(project.id, projectId)){
                projectName = project.projectName;
                return projectName;
              }

            });
          }
        });
        return projectName;
      };

      //load profiles
      $rootScope.loadProfiles = function(){
        UserProfile.find(
          {

            filter:{
              where:{
                userDetailId: LoopBackAuth.currentUserId
              },
              limit: 30,
              order: 'profileName ASC',
              "include": [
                "endorsements",
                "endorserEndorsements",
                "endorsetSents",
                "userDetail",
                {
                  "endorsets":[
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
                      "endorserEndorsement":[
                        "userDetail",
                        {
                          "endorsement":[
                            {
                              "endorsementCompanies":[
                                "endorsementProjects"
                              ]
                            },
                            "endorsementSkills"
                          ]
                        }
                      ]
                    }

                  ]
                }
              ]
            }
          },
          function(profiles) {
            //console.log(profiles);
            var skillScores = [];
            var projectScores = [];
            angular.forEach(profiles, function(profile, key){
              var endorsetScoreTotal = 0;
              var numberEndorsets = 0;
              angular.forEach(profile.endorsets, function(endorset, profileKey){
                var endorsetScore = 0;
                var totalScoreItem = 0;
                numberEndorsets++;

                angular.forEach(endorset.endorserEndorsement.skillScores, function(score, key1){
                  endorsetScore += parseFloat(score);
                  totalScoreItem++;
                  key1 = angular.lowercase(key1);
                  var isSkillExist = false;
                  angular.forEach(skillScores, function(skill, skillKey){
                    if(skill.key == key1){
                      skillScores[skillKey].score += parseFloat(score);
                      skillScores[skillKey].counter += 1;
                      isSkillExist = true;
                    }

                  });
                  if(!isSkillExist){
                    skillScores.push({key: key1, score: parseFloat(score), counter:1});
                  }
                });
                angular.forEach(endorset.endorserEndorsement.projectScores, function(score, key1){
                  endorsetScore += parseFloat(score);
                  totalScoreItem++;

                  var isProjectExist = false;
                  angular.forEach(projectScores, function(projectScore, projectKey){
                    if(projectScore.key == key1){
                      projectScores[projectKey].score += parseFloat(score);
                      projectScores[projectKey].counter += 1;
                      isProjectExist = true;
                    }

                  });
                  if(!isProjectExist){
                    var projectName = $scope.findProjectNameByIdFromEndorsement(endorset.endorserEndorsement.endorsement, key1);
                    if(projectName != ''){
                      projectScores.push({key: key1, score: parseFloat(score), counter:1, projectName: projectName});
                    }

                  }
                });
                var avgEndorsetScore = 0.0;
                if(totalScoreItem){
                  avgEndorsetScore = endorsetScore/totalScoreItem;
                }
                endorsetScoreTotal += avgEndorsetScore;
                //endorset[key].avgEndorsetScore = $filter('number')(avgEndorsetScore, 2);
              });
              if(numberEndorsets){
                profiles[key].endorsetScoreTotal = $filter('number')(endorsetScoreTotal/numberEndorsets, 2);
              } else {
                profiles[key].endorsetScoreTotal = 0;
              }

              angular.forEach(skillScores, function(skill, skillKey){
                skillScores[skillKey].score = $filter('number')(skill.score/skill.counter, 2);
              });

              profiles[key].skillScores = skillScores;

              angular.forEach(projectScores, function(projectScore, projectKey){
                projectScores[projectKey].score = $filter('number')(projectScore.score/projectScore.counter, 2);
              });

              profiles[key].projectScores = projectScores;

            });
            $rootScope.profiles = profiles;
            if($rootScope.profiles.length){
              $rootScope.selectProfile($rootScope.profiles[0]);
            }


          },
          function(errorResponse) { console.log(errorResponse); }
        );
      };


      //hide more skill
      $rootScope.isShowAllSkill = false;
      $rootScope.showAllText = "More";

      //toggle show hide more skill
      $rootScope.toggleShowAllSkill = function(){
        $rootScope.isShowAllSkill = !$rootScope.isShowAllSkill;
        if($rootScope.isShowAllSkill){
          $rootScope.showAllText = "Less";
        } else {
          $rootScope.showAllText = "More";
        }
      };
      /**
       * My Endorsets Requests tab
       */

      //request object
      $rootScope.endorsetRequest = false;

      /**
       * Select Request
       */
      $rootScope.selectEndorsetRequest = function(endorsetRequest){
        $rootScope.disableElement = true;
        $rootScope.isChooseEndorset = false;

        var today = new Date();
        if(!endorsetRequest.seenAt){
          CompanyRequest.prototype$updateAttributes({id: endorsetRequest.id}, {seenAt: $filter('date')(today, "yyyy-MM-dd")})
            .$promise
            .then(function(res){
              endorsetRequest.seenAt = res.seenAt;
              //console.log(res);
            });
        }
        $rootScope.endorsetRequest = endorsetRequest;


      };

      /**
       * Load request data
       */
      $rootScope.loadRequestData = function(currentInstance){
        if(currentInstance == undefined){
          currentInstance = null;
        }
        CompanyRequest.find(
          {

            filter:{
              where:{
                email: $rootScope.user.email,
                status:{
                  neq: 1
                }
              },
              "include": [ {"userDetail":["company"]}, "endorsetSents" ],
              limit: 30,
              order: 'created DESC'
            }
          },
          function(endorsetRequests) {
            $rootScope.endorsetRequests = endorsetRequests;
            if($rootScope.endorsetRequests.length && currentInstance == null){
              $rootScope.selectEndorsetRequest($rootScope.endorsetRequests[0]);
            }
            if(currentInstance){
              $rootScope.selectEndorsetRequest(currentInstance);
            }
          },
          function(errorResponse) { console.log(errorResponse); }
        );
      };

      /**
       *Open request tab
       */
      $rootScope.openRequestTab = function(currentInstance){
        $rootScope.successMsg = false;
        $rootScope.errorMsg = false;
        if(currentInstance == undefined){
          currentInstance = null;
        }
        $rootScope.mainTabs.endorsets.active = true;
        $rootScope.mainTabs.endorsements.active = false;
        $rootScope.mainTabs.endorsets.buttons.list.active = false;
        $rootScope.mainTabs.endorsets.buttons.requests.active = true;
        if($rootScope.dashboardTab == undefined){
          $rootScope.dashboardTab = {endorsements: 'requests', endorsets: 'requests'};
        } else {
          $rootScope.dashboardTab.endorsets = "requests";
        }


        //call load requests
        $rootScope.loadRequestData(currentInstance);
      };


      //select sent endorsement event
      $scope.$on('openAndSelectEndorsetRequestEvent', function(event, args) {
        $rootScope.openRequestTab(args.endorsetRequest);

        if(args.endorsetRequest != null){
          $scope.selectEndorsetRequest(args.endorsetRequest);
        }
        if(args.notification != null){
          $scope.notification = args.notification;
          //$scope.successMsg = args.notification.title;
          ngToast.create({
            className: 'info',
            content: args.notification.title,
            dismissOnTimeout: true,
            timeout: 4000,
            dismissButton: true
          });
        }
      });

      /**
       *Open Endorsets List tab
       */
      $rootScope.openEndorsetListTab = function(){
        $rootScope.successMsg = false;
        $rootScope.errorMsg = false;
        $rootScope.mainTabs.endorsets.active = true;
        $rootScope.mainTabs.endorsements.active = false;
        $rootScope.mainTabs.endorsets.buttons.list.active = true;
        $rootScope.mainTabs.endorsets.buttons.requests.active = false;
        //calling load profiles
        $rootScope.loadProfiles();
      };



      //initialize endorset sent object
      $rootScope.endorsetSent = {userDetailId: LoopBackAuth.currentUserId};
      /**
       * Choose endorset
       */
      $rootScope.chooseEndorset = function(endorsetRequest){
        $rootScope.selectEndorsetRequest(endorsetRequest);
        if($rootScope.profiles.length == 0){
          $rootScope.loadProfiles();
        }
        $rootScope.disableElement = false;
        $rootScope.isChooseEndorset = true;
      };

      /**
       * cancel endorset
       */
      $rootScope.cancelEndorset = function(){
        $rootScope.isChooseEndorset = false;
      };

      /**
       * Send Endorset
       */
      $rootScope.sendEndorset = function(isValid){
        $rootScope.successMsg = false;
        $rootScope.errorMsg = false;
        if($rootScope.endorsetSent.profile.endorsets == undefined || $rootScope.endorsetSent.profile.endorsets.length == 0){
          //console.log($rootScope.endorsetSent.profile);
          isValid = false;
          ngToast.create({
            className: 'danger',
            content: "No endorsement found in this profile!",
            dismissOnTimeout: true,
            timeout: 4000,
            dismissButton: true
          });
          return;
        }
        if(isValid){
          $rootScope.endorsetSent.userDetailId = LoopBackAuth.currentUserId;
          //console.log($rootScope.endorsetSent);
          EndorsetSent.create(
            {
              userDetailId: LoopBackAuth.currentUserId,
              comments: $rootScope.endorsetSent.comments,
              userProfileId: $rootScope.endorsetSent.profile.id,
              companyUserId: $rootScope.endorsetRequest.userDetailId,
              companyRequestId: $rootScope.endorsetRequest.id
            }
          )
            .$promise
            .then(function(res){
              //console.log(res);

              //update sent status
              CompanyRequest.prototype$updateAttributes({id: $rootScope.endorsetRequest.id}, {status: 1})
                .$promise
                .then(function(statusRes){
                  //console.log(statusRes);
                });

              $rootScope.errorMsg = false;
              $rootScope.successMsg = "Endorset sent successfully!";
              $rootScope.disableElement = true;
              $rootScope.loadRequestData();
            });
        } else {
          $rootScope.errorMsg = true;
          $rootScope.errors = [
            {
              'error': "Complete the form!"
            }
          ];
        }
      };


      /**
       * Open endorsement modal
       *
       */
      $rootScope.animationsEnabled = false;
      $rootScope.openEndorserEndorsement = function(endorsement){
        //console.log(endorsement);
        //$rootScope.endorsementData = endorsement;
        var modalInstance = $modal.open({
          animation: $rootScope.animationsEnabled,
          templateUrl: 'myEndorsementModalContent.html',
          controller: 'ModalMyEndorsementCtrl',
          size: 'lg',
          resolve: {
            items: function () {
              return {
                endorsement: endorsement
              };
            }
          }
        });

        modalInstance.result.then(function (selectedItem) {
          $rootScope.selected = selectedItem;
        }, function () {
          $log.info('Modal dismissed at: ' + new Date());
        });
      };

      //change tabs
      $scope.changeEndorsetsTab = function(){
        $rootScope.successMsg = false;
        $rootScope.errorMsg = false;
        if($rootScope.dashboardTab.endorsets == 'list'){
          $scope.openEndorsetListTab();
        }
        if($rootScope.dashboardTab.endorsets == 'requests'){
          $scope.openRequestTab();
        }
      };

      if($rootScope.notificationData.eventName != '' && angular.equals($rootScope.notificationData.eventName, 'openAndSelectEndorsetRequestEvent')){
        //console.log($rootScope.notificationData);
        $scope.$broadcast($rootScope.notificationData.eventName, $rootScope.notificationData.selectedObject);
        notificationService.resetData;
      }
    }
  ]
)
//dashboard endorsement modal instance controller
  .controller('ModalMyEndorsementCtrl', function ($scope, $rootScope, $state, $modalInstance, items, $filter, LoopBackAuth, UserDetail, EndorsementService, Endorset) {
    $rootScope.user = LoopBackAuth.currentUserData;
    $rootScope.successMsg = false;
    $rootScope.errorMsg = false;
    $rootScope.errors = [];

    $rootScope.endorsementData = items.endorsement;
    $rootScope.isQuestionEnable = false;



    //submit modal if ok
    $rootScope.ok = function () {
      $modalInstance.close();
    };

    //cancel request
    $rootScope.cancel = function () {
      //console.log(items);
      $modalInstance.dismiss('cancel');
    };
  }
);