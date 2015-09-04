angular
  .module('app')
/**
 * CompanyUserDashboardController
 *
 * CompanyUserDashboard controller is responsible to maintain Requests, Company User dashboard
 */
  .controller('CompanyUserDashboardController', [
    '$rootScope', '$scope', '$state', '$stateParams', '$modal', '$log', '$filter', 'LoopBackAuth', 'UserDetail', 'CompanyRequest', 'EndorsetSent', 'Question', 'EndorsementService', 'Endorset', 'notificationService', 'ngToast', 'PubSub', 'LoginService', 'AssignEndorsets', 'InviteUser', '$http',
    function($rootScope, $scope, $state, $stateParams, $modal, $log, $filter, LoopBackAuth, UserDetail, CompanyRequest, EndorsetSent, Question, EndorsementService, Endorset, notificationService, ngToast, PubSub, LoginService, AssignEndorsets, InviteUser, $http) {
      $rootScope.useType = LoginService.getUseType();
      /**
       * Current logged-in user object
       * @type {Object|*}
       */
      $scope.user = {};
      $rootScope.isCompanyUser = true;

      LoginService.getCurrentUser(function(users){
        if(users.length){
          $scope.user = users[0];
        }
      });

      $rootScope.showDashboardWidget  =  true;


      /**
       * global success message
       * @type {boolean}
       */
      $rootScope.successMsg = false;

      $scope.endorsementData = false;


      /**
       * global error message
       * @type {boolean}
       */
      $rootScope.errorMsg = false;
      $rootScope.errors = [];

      //endorset requests
      $scope.endorsetRequests = [];

      //dashboard tabs
      $scope.mainTabs = {
        requests: {name: "Requests", active: true, disabled: false},
        endorsets: {name: "Endorsets", active: false, disabled: false}
      };

      //request object
      $scope.endorsetRequest = {
        firstName: '',
        lastName: '',
        email: '',
        jobTitle: '',
        minEndorsementsNumber: 3,
        expiryDate: $scope.expiryDate
      };

      //Form elements are active
      $scope.disableElement = false;

      //init start and end date
      $scope.today = function() {
        $scope.expiryDate = new Date();
      };
      $scope.today();

      //clear date
      $scope.clear = function () {
        $scope.expiryDate = null;
      };
      $scope.dateFormat = 'yyyy/MM/dd';
      $scope.expiryDate = {openExpiryDate: false};

      //open calendar
      $scope.openExpiryDateCalendar = function($event, date) {
        $event.preventDefault();
        $event.stopPropagation();
        //console.log(date);

        $scope.expiryDate.openExpiryDate = true;
      };

      /**
       * new request
       */
      $scope.newRequest = function(){
        $scope.dateFormat = 'yyyy/MM/dd';
        $scope.expiryDate.openExpiryDate = false;
        $scope.today();
        $scope.endorsetRequest = {
          firstName: '',
          lastName: '',
          email: '',
          jobTitle: '',
          minEndorsementsNumber: 3,
          expiryDate: ''
        };
        $scope.disableElement = false;
      };

      /**
       * Select Request
       */
      $scope.selectRequest = function(endorsetRequest){
        $scope.endorsetRequest = endorsetRequest;
        $scope.disableElement = true;
        $scope.endorsementData = false;

      };




      /**
       * Load request data
       */
      $scope.loadRequestData = function(currentInstance){
        if(currentInstance == undefined){
          currentInstance = null;
        }
        var adminIds = [];
        LoginService.getCurrentUser(function(users){
          if(users.length){
            $scope.user = users[0];
            angular.forEach($scope.user.invitations, function(inv){
              adminIds.push(inv.adminUser.id);
            });
            console.log(users);

            CompanyRequest.find(
              {
                filter:{
                  where:{
                    or:[
                      {userDetailId: LoopBackAuth.currentUserId},
                      {userDetailId: {inq: adminIds}}
                    ]
                  },
                  "include": [ "userDetail", "professionalUser" ]
                }
              },
              function(endorsetRequests) {
                //console.log(endorsetRequests);
                $scope.endorsetRequests = endorsetRequests;
                if($scope.endorsetRequests.length && currentInstance == null){
                  //$scope.selectRequest($scope.endorsetRequests[0]);
                }

                if(currentInstance){
                  $scope.selectRequest(currentInstance);
                }


              },
              function(errorResponse) { console.log(errorResponse); }
            );
          }
        });

      };



      $scope.openRequestTab = function(currentInstance){
        $rootScope.successMsg = false;
        $rootScope.errorMsg = false;
        if(currentInstance == undefined){
          currentInstance = null;
        }
        $scope.mainTabs.requests.active = true;
        $scope.mainTabs.endorsets.active = false;
        //call load requests
        $scope.loadRequestData(currentInstance);
      };

      $scope.openRequestTab(null);

      //select sent endorsement event
      $scope.$on('openAndSelectEndorsetRequestSeenEvent', function(event, args) {
        //$scope.loadRequestData(args.endorsetRequest);
        $scope.openRequestTab(args.endorsetRequest);

        if(args.endorsetRequest != null){
          //console.log(args.endorsetRequest);
          //$scope.selectRequest(args.endorsetRequest);
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
       * Save request
       */
      $scope.saveRequest = function(isValid, form){
        $rootScope.successMsg = false;
        $rootScope.errorMsg = false;
        if(isValid){
          $scope.endorsetRequest.userDetailId = LoopBackAuth.currentUserId;

          CompanyRequest.create(
            {
              userDetailId: LoopBackAuth.currentUserId,
              firstName: $scope.endorsetRequest.firstName,
              lastName: $scope.endorsetRequest.lastName,
              email: $scope.endorsetRequest.email,
              minEndorsementsNumber: $scope.endorsetRequest.minEndorsementsNumber,
              jobPosition: $scope.endorsetRequest.jobPosition,
              expiryDate: $filter('date')($scope.endorsetRequest.expiryDate, "yyyy-MM-dd")
            }
          )
            .$promise
            .then(function(res){
              //console.log(res);
              $rootScope.errorMsg = false;
              $rootScope.successMsg = "Endorset request submitted successfully!";
              $scope.disableElement = true;
              form.$setPristine();
              $scope.newRequest();
              $scope.loadRequestData();
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

      //endorsets collection
      $scope.endorsets = [];

      //endorset
      $scope.endorset = {};

      /**
       * Select Endorset
       */
      $scope.selectEndorset = function(endorset){
        $scope.endorset = endorset;
      };



      //find project name
      $scope.findProjectNameByIdFromEndorsement = function(endorsement, projectId){
        var projectName = '';
        angular.forEach(endorsement.endorsementCompanies, function(company, companyIndex){
          if(company.endorsementProjects){
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

      /**
       * load endorsets
       */

      $scope.loadEndorsets = function(currentInstance, notification){
        if(currentInstance == undefined){
          currentInstance = null;
        }
        if(notification == undefined){
          notification = null;
        }
        var companyAdminIds = [];
        InviteUser.find(
          {
            filter: {
              where: {
                userDetailId: LoopBackAuth.currentUserId,
                status: 1
              }
            }
          },
          function(res) {
            angular.forEach(res, function(invite){
              companyAdminIds.push(invite.createdBy);
            });
            EndorsetSent.find(
              {

                filter:{
                  where:{
                    companyUserId:{inq: companyAdminIds}
                  },
                  limit: 30,
                  order: "created DESC",
                  "include":
                    [
                      "userDetail",
                      "companyUser",
                      {"assignEndorsets": ["inviteUser"]},
                      "companyRequest",
                      {
                        "userProfile": [
                          "endorsements",
                          {"endorserEndorsements":[{"userDetail":["userFeedbacks"]}]},
                          "endorsetSents",
                          "userDetail",
                          {
                            "endorsets": [
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
                                              "hrDetail",
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
                        ]
                      }
                    ]
                }
              },
              function(endorsets) {
                console.log(endorsets);
                var skillScores = [];
                var projectScores = [];
                var isCurrentNotificationFound = false;
                var currentNotificationKey = null;

                var endorserScore = 0.00;
                var endorserScoreCount = 0;

                angular.forEach(endorsets, function(endorset, key){
                  if(endorset.endorserEndorsement != undefined && endorset.endorserEndorsement.userDetail != undefined && endorset.endorserEndorsement.userDetail.userFeedbacks != undefined){
                    angular.forEach(endorset.endorserEndorsement.userDetail.userFeedbacks, function(feedBack, fKey){
                      endorserScoreCount++;
                      endorserScore += parseFloat(feedBack.score);

                      endorserScoreCount++;
                      endorserScore += parseFloat(feedBack.leadQuoteScore);

                      if(feedBack.skillScores.length){
                        angular.forEach(feedBack.skillScores, function(skillScore, skillScoreIndex){
                          endorserScoreCount++;
                          endorserScore += parseFloat(skillScore);
                        });
                      }
                      if(feedBack.answerScores.length){
                        angular.forEach(feedBack.answerScores, function(answerScore, answerScoreIndex){
                          endorserScoreCount++;
                          endorserScore += parseFloat(answerScore);
                        });
                      }
                    });
                  }

                  if(endorserScore){
                    endorsets[key] = endorserScore/endorserScoreCount;
                  }

                  var endorsetScoreTotal = 0;
                  var numberEndorsets = 0;
                  endorsets[key].numReplies = 0;
                  angular.forEach(endorset.userProfile.endorsets, function(endorset, profileKey){

                    //count replies
                    if(endorset.endorserEndorsement.questions != undefined && endorset.endorserEndorsement.questions.length){
                      if(currentInstance == null && notification != null && isCurrentNotificationFound == false){
                        angular.forEach(endorset.endorserEndorsement.questions, function(q){
                          if(angular.equals(q.id, notification.modelId)){
                            isCurrentNotificationFound = true;
                            currentNotificationKey = key;
                          }

                        });
                      }
                      Question.find(
                        {
                          filter: {
                            where: {
                              endorserEndorsementId: endorset.endorserEndorsementId,
                              hrId: LoopBackAuth.currentUserId,
                              endorserId: 0,
                              isDraft: {neq: true}
                            }
                          }
                        },
                        function(questions) {
                          var questionIds = [];
                          angular.forEach(questions, function(q, key){
                            questionIds.push(q.id);
                          });
                          Question.find(
                            {
                              filter: {
                                where: {
                                  endorserEndorsementId: endorset.endorserEndorsementId,
                                  replyId: {inq: questionIds},
                                  isDraft: {neq: true}
                                }
                              }
                            },
                            function(numReplies) {
                              endorsets[key].numReplies = numReplies.length;
                            },
                            function(errorResponse) { console.log(errorResponse); }
                          );
                        },
                        function(errorResponse) { console.log(errorResponse); }
                      );

                    }


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
                          isSkillExist = true;
                          skillScores[skillKey].counter += 1;
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
                        var projectName = $scope.findProjectNameByIdFromEndorsement(endorset.endorsement, key1);
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
                    endorsets[key].userProfile.endorsetScoreTotal = $filter('number')(endorsetScoreTotal/numberEndorsets, 2);
                  } else {
                    endorsets[key].userProfile.endorsetScoreTotal = 0;
                  }
                  angular.forEach(skillScores, function(skill, skillKey){
                    skillScores[skillKey].score = $filter('number')(skill.score/skill.counter, 2);
                  });

                  endorsets[key].userProfile.skillScores = skillScores;

                  angular.forEach(projectScores, function(projectScore, projectKey){
                    projectScores[projectKey].score = $filter('number')(projectScore.score/projectScore.counter, 2);
                  });

                  endorsets[key].userProfile.projectScores = projectScores;

                  avgEndorsetScore = 0;
                  endorsetScoreTotal = 0;
                  totalScoreItem = 0;
                  endorsetScore = 0;
                  skillScores = [];

                });
                $scope.endorsets = endorsets;
                if($scope.endorsets.length && isCurrentNotificationFound == false && currentNotificationKey == null && currentInstance == null){
                  $scope.selectEndorset($scope.endorsets[0]);
                }

                if(currentInstance == null && notification != null && isCurrentNotificationFound && currentNotificationKey != null){
                  $scope.selectEndorset($scope.endorsets[currentNotificationKey]);
                }
                if(currentInstance){
                  $scope.selectEndorset(currentInstance);
                }


              },
              function(errorResponse) { console.log(errorResponse); }
            );
          },
          function(errorResponse) { console.log(errorResponse); }
        );

      };


      $scope.myEndorsets = [];

      /**
       * load compnay user endorsets
       */

      $scope.loadMyOpenEndorsets = function(currentInstance, notification){
        if(currentInstance == undefined){
          currentInstance = null;
        }
        if(notification == undefined){
          notification = null;
        }
        var sentIds = [];
        AssignEndorsets.find(
          {
            filter: {
              where: {
                userDetailId: LoopBackAuth.currentUserId
              }
            }
          },
          function(res) {
            angular.forEach(res, function(assign){
              sentIds.push(assign.endorsetSentId);
            });
            console.log(sentIds);
            EndorsetSent.find(
              {
                filter:{
                  where:{
                    id:{inq: sentIds}
                  },
                  limit: 30,
                  order: "created DESC",
                  "include":
                    [
                      "userDetail",
                      "companyUser",
                      {"assignEndorsets": ["inviteUser"]},
                      "companyRequest",
                      {
                        "userProfile": [
                          "endorsements",
                          {"endorserEndorsements":[{"userDetail":["userFeedbacks"]}]},
                          "endorsetSents",
                          "userDetail",
                          {
                            "endorsets": [
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
                                              "hrDetail",
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
                        ]
                      }
                    ]
                }
              },
              function(endorsets) {
                console.log(endorsets);
                var skillScores = [];
                var projectScores = [];
                var isCurrentNotificationFound = false;
                var currentNotificationKey = null;

                var endorserScore = 0.00;
                var endorserScoreCount = 0;

                angular.forEach(endorsets, function(endorset, key){

                  if(endorset.endorserEndorsement != undefined && endorset.endorserEndorsement.userDetail != undefined && endorset.endorserEndorsement.userDetail.userFeedbacks != undefined){
                    angular.forEach(endorset.endorserEndorsement.userDetail.userFeedbacks, function(feedBack, fKey){
                      endorserScoreCount++;
                      endorserScore += parseFloat(feedBack.score);

                      endorserScoreCount++;
                      endorserScore += parseFloat(feedBack.leadQuoteScore);

                      if(feedBack.skillScores.length){
                        angular.forEach(feedBack.skillScores, function(skillScore, skillScoreIndex){
                          endorserScoreCount++;
                          endorserScore += parseFloat(skillScore);
                        });
                      }
                      if(feedBack.answerScores.length){
                        angular.forEach(feedBack.answerScores, function(answerScore, answerScoreIndex){
                          endorserScoreCount++;
                          endorserScore += parseFloat(answerScore);
                        });
                      }
                    });
                  }

                  if(endorserScore){
                    endorsets[key] = endorserScore/endorserScoreCount;
                  }

                  var endorsetScoreTotal = 0;
                  var numberEndorsets = 0;
                  endorsets[key].numReplies = 0;
                  angular.forEach(endorset.userProfile.endorsets, function(endorset, profileKey){

                    //count replies
                    if(endorset.endorserEndorsement.questions != undefined && endorset.endorserEndorsement.questions.length){
                      if(currentInstance == null && notification != null && isCurrentNotificationFound == false){
                        angular.forEach(endorset.endorserEndorsement.questions, function(q){
                          if(angular.equals(q.id, notification.modelId)){
                            isCurrentNotificationFound = true;
                            currentNotificationKey = key;
                          }

                        });
                      }
                      Question.find(
                        {
                          filter: {
                            where: {
                              endorserEndorsementId: endorset.endorserEndorsementId,
                              hrId: LoopBackAuth.currentUserId,
                              endorserId: 0,
                              isDraft: {neq: true}
                            }
                          }
                        },
                        function(questions) {
                          var questionIds = [];
                          angular.forEach(questions, function(q, key){
                            questionIds.push(q.id);
                          });
                          Question.find(
                            {
                              filter: {
                                where: {
                                  endorserEndorsementId: endorset.endorserEndorsementId,
                                  replyId: {inq: questionIds},
                                  isDraft: {neq: true}
                                }
                              }
                            },
                            function(numReplies) {
                              endorsets[key].numReplies = numReplies.length;
                            },
                            function(errorResponse) { console.log(errorResponse); }
                          );
                        },
                        function(errorResponse) { console.log(errorResponse); }
                      );

                    }


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
                          isSkillExist = true;
                          skillScores[skillKey].counter += 1;
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
                        var projectName = $scope.findProjectNameByIdFromEndorsement(endorset.endorsement, key1);
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
                    endorsets[key].userProfile.endorsetScoreTotal = $filter('number')(endorsetScoreTotal/numberEndorsets, 2);
                  } else {
                    endorsets[key].userProfile.endorsetScoreTotal = 0;
                  }
                  angular.forEach(skillScores, function(skill, skillKey){
                    skillScores[skillKey].score = $filter('number')(skill.score/skill.counter, 2);
                  });

                  endorsets[key].userProfile.skillScores = skillScores;

                  angular.forEach(projectScores, function(projectScore, projectKey){
                    projectScores[projectKey].score = $filter('number')(projectScore.score/projectScore.counter, 2);
                  });

                  endorsets[key].userProfile.projectScores = projectScores;

                  avgEndorsetScore = 0;
                  endorsetScoreTotal = 0;
                  totalScoreItem = 0;
                  endorsetScore = 0;
                  skillScores = [];

                });
                $scope.myEndorsets = endorsets;
                if($scope.myEndorsets.length && isCurrentNotificationFound == false && currentNotificationKey == null && currentInstance == null){
                  $scope.selectEndorset($scope.myEndorsets[0]);
                }

                if(currentInstance == null && notification != null && isCurrentNotificationFound && currentNotificationKey != null){
                  $scope.selectEndorset($scope.myEndorsets[currentNotificationKey]);
                }
                if(currentInstance){
                  $scope.selectEndorset(currentInstance);
                }


              },
              function(errorResponse) { console.log(errorResponse); }
            );
          },
          function(errorResponse) { console.log(errorResponse); }
        );

      };

      //hide more skill
      $scope.isShowAllSkill = false;
      $scope.showAllText = "More";

      //toggle show hide more skill
      $scope.toggleShowAllSkill = function(){
        $scope.isShowAllSkill = !$scope.isShowAllSkill;
        if($scope.isShowAllSkill){
          $scope.showAllText = "Less";
        } else {
          $scope.showAllText = "More";
        }
      };


      $rootScope.dashboardTab = {endorsets: 'all'};
      /**
       *Open endorsets tab
       */
      $scope.openEndorsetTab = function(currentInstance, notification){
        $rootScope.successMsg = false;
        $rootScope.errorMsg = false;
        $rootScope.dashboardTab.endorsets = 'all';
        if(currentInstance == undefined){
          currentInstance = null;
        }
        if(notification == undefined){
          notification = null;
        }

        $scope.endorsementData = false;
        $scope.mainTabs.requests.active = false;
        $scope.mainTabs.endorsets.active = true;
        $scope.loadEndorsets(currentInstance, notification);
      };

      //select endorset event
      $scope.$on('openAndSelectEndorsetEvent', function(event, args) {
        $scope.openEndorsetTab(args.endorset, args.notification)
        //$scope.loadEndorsets(args.endorset, args.notification);

        if(args.endorset != null){
          $scope.selectEndorset(args.endorset);
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
       * Open endorsement modal
       *
       */
      $scope.animationsEnabled = false;
      $scope.openEndorserEndorsement = function(endorsement){
        //console.log(endorsement);
        //$scope.endorsementData = endorsement;
        var modalInstance = $modal.open({
          animation: $scope.animationsEnabled,
          templateUrl: 'myEndorsementModalContent.html',
          controller: 'CompanyUserModalEndorsementCtrl',
          size: 'lg',
          resolve: {
            items: function () {
              return {
                endorsement: endorsement,
                endorsets: $scope.endorsets
              };
            }
          }
        });

        modalInstance.result.then(function (selectedItem) {
          $scope.selected = selectedItem;
        }, function () {
          $log.info('Modal dismissed at: ' + new Date());
        });
      };

      $rootScope.notificationData = notificationService.notificationData;

      if($rootScope.notificationData.eventName != ''){
        //console.log($rootScope.notificationData);
        $scope.$broadcast($rootScope.notificationData.eventName, $rootScope.notificationData.selectedObject);
        notificationService.resetData;
      }

      $scope.animationsEnabled = false;
      /**
       * Open assign endorsets to team member model
       * @param member
       */
      $scope.openAssignEndorset = function(endorset, size){
        EndorsetSent.find(
          {

            filter:{
              where:{
                id: endorset.id
              },
              limit: 1,
              order: "created DESC",
              "include":
                [
                  "userDetail",
                  "companyUser",
                  "companyRequest"
                ]
            }
          },
          function(endorsets) {
            var modalInstance = $modal.open({
              animation: $scope.animationsEnabled,
              templateUrl: 'AssignEndorsetUserModalContent.html',
              controller: 'AssignEndorsetModalInstanceCtrl',
              size: size,
              resolve: {
                items: function () {
                  return {
                    endorset: endorsets[0]
                  };
                }
              }
            });

            modalInstance.result.then(function (selectedItem) {
              console.log(selectedItem);
            }, function () {
              $log.info('Modal dismissed at: ' + new Date());
            });
          },
          function(errorResponse) { console.log(errorResponse); }
        );


      };

      /**
       *
       */
      $scope.openMyEndorsetTab = function(currentInstance, notification){
        $rootScope.successMsg = false;
        $rootScope.errorMsg = false;
        $rootScope.dashboardTab.endorsets = 'assigned';
        if(currentInstance == undefined){
          currentInstance = null;
        }
        if(notification == undefined){
          notification = null;
        }

        $scope.endorsementData = false;
        $scope.mainTabs.requests.active = false;
        $scope.mainTabs.endorsets.active = true;
        $scope.loadMyOpenEndorsets(currentInstance, notification);
      };

      /*Change Endorset*/
      $scope.changeEndorsetTab = function(){
        $rootScope.successMsg = false;
        $rootScope.errorMsg = false;
        if($rootScope.dashboardTab.endorsets == 'all'){
          $scope.openEndorsetTab();
        }
        if($rootScope.dashboardTab.endorsets == 'assigned'){
          $scope.openMyEndorsetTab();
        }
      };

      //select endorset event
      $scope.$on('openAndSelectMyEndorsetEvent', function(event, args) {
        $scope.openMyEndorsetTab(args.endorset, args.notification);

        if(args.endorset != null){
          $scope.selectEndorset(args.endorset);
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



      $scope.members = [];
      /**
       * get users
       * @param viewValue
       */
      $scope.getTeamMembers = function(viewValue, endorset){
        return $http.get('/api/inviteUsers', {
          params: {
            filter: {
              "where": {
                createdBy: endorset.companyUserId,
                status: 1
              },
              "order":"firstName ASC",
              include:[
                'adminUser', {'userDetail':["company"]}
              ]
            }
          }
        })

          .then(function(users){
            var members = [];
            angular.forEach(users.data, function(user, key){
              if(user.userDetail.firstName.toLowerCase().indexOf(viewValue)  > -1 || user.userDetail.firstName.toLowerCase().indexOf(viewValue)  > -1 ){
                var assignedUsers = [];
                var isUserExist = false;
                if(endorset != undefined && endorset.assignEndorsets.length){
                  angular.forEach(endorset.assignEndorsets, function(assignEndorset, key1){
                    if(assignEndorset.inviteUser.userDetailId == user.userDetail.id){
                      assignedUsers.push(user.userDetail.id);
                      isUserExist = true;
                    } else {

                    }
                  });
                }
                if(isUserExist){

                } else {
                  user.displayName = user.firstName + ' ' + user.lastName;
                  users.data[key] = user;
                  members.push(user);
                }

              }

            });
            $scope.members =  members;
            return members;
          });

      };
      //$scope.getTeamMembers();

      $scope.assignUserToEndorset = function($item, $model, $label, endorset){
        console.log($item);
        console.log(endorset);
        $rootScope.successMsg = false;
        $rootScope.errorMsg = false;

        var isMemberAssigned = false;
        if(endorset.assignEndorsets.length){
          angular.forEach(endorset.assignEndorsets, function(assignEndorset, key){
            if(angular.equals(assignEndorset.inviteUserId, $item.userDetailId)){
              isMemberAssigned = true;
            }
          });
        }

        if(isMemberAssigned == true){
          ngToast.create({
            className: 'danger',
            content: "Member already assigned!",
            dismissOnTimeout: true,
            timeout: 4000,
            dismissButton: true
          });
        } else {
          EndorsetSent.find(
            {

              filter:{
                where:{
                  id: endorset.id
                },
                limit: 1,
                order: "created DESC",
                "include":
                  [
                    "userDetail",
                    "companyUser",
                    "companyRequest"
                  ]
              }
            },
            function(endorsets) {
              if(endorsets.length){
                AssignEndorsets.saveAssignments(
                  {
                    data :{
                      createdBy: LoopBackAuth.currentUserId,
                      userDetailId: $item.userDetailId,
                      inviteUserId: $item.id,
                      endorsets: endorsets
                    }
                  }
                  , function(res){
                    ngToast.create({
                      className: 'success',
                      content: "Assigned done!",
                      dismissOnTimeout: true,
                      timeout: 4000,
                      dismissButton: true
                    });

                    $scope.loadEndorsets(endorset, null);

                  }
                );
              }

            },
            function(errorResponse) { console.log(errorResponse); }
          );
        }



      };

    }
  ]
)
/**
 * AssignEndorsetUser model controller
 */
  .controller('AssignEndorsetModalInstanceCtrl', function ($rootScope, $scope, $state, $modalInstance, items, $filter, LoopBackAuth, UserDetail, $location, InviteUser, $http, EndorsetSent, AssignEndorsets) {
    $rootScope.successMsg = false;
    $rootScope.errorMsg = false;
    $rootScope.errors = [];
    $rootScope.isCompanyUser = true;

    $scope.members = [];

    $scope.assign = {};
    $scope.disableElement = false;

    $scope.endorsets = [];
    $scope.users = [];

    $scope.endorset = items.endorset;
    $scope.endorsets.push($scope.endorset);

    $scope.loadMembers = function(){
      InviteUser.find(
        {
          filter: {
            where: {
              createdBy: $scope.endorset.companyUserId,
              status: 1
            },
            limit: 1,
            order: 'created DESC',
            include:[
              'adminUser', {'userDetail':["company"]}
            ]
          }
        },
        function(members) {

          $scope.members = members;
          console.log(members);
        },
        function(errorResponse) { console.log(errorResponse); }
      );
    };
    $scope.loadMembers();

    $scope.member = false;

    $scope.setUserData = function($item, $model, $label){
      $scope.member = $item;
    };

    /**
     * assign endorset
     * @param form
     */
    $scope.assignUserToEndorset = function(form){
      $rootScope.successMsg = false;
      $rootScope.errorMsg = false;
      var isValid = false;
      if($scope.member){
        isValid = true;
      }
      if(isValid){
        $scope.assign.createdBy = LoopBackAuth.currentUserId;

        console.log($scope.member);
        AssignEndorsets.saveAssignments(
          {
            data :{
              createdBy: LoopBackAuth.currentUserId,
              userDetailId: $scope.member.userDetailId,
              inviteUserId: $scope.member.id,
              endorsets: $scope.endorsets
            }
          }
          , function(res){
            //console.log(res);
            $rootScope.errorMsg = false;
            $rootScope.successMsg = "Endorsets assigned successfully!";
            form.$setPristine();
            $modalInstance.close('cancel');

          }
        );

      } else {
        $rootScope.errorMsg = true;
        $rootScope.errors = [
          {
            'error': "Select member!"
          }
        ];
      }

    };

    $scope.unAssign = function(assignEndorset){
      AssignEndorsets.deleteById({id: assignEndorset.id})
        .$promise
        .then(function (response) {
          $rootScope.success = "Unassigned successfully!";
          $rootScope.error = false;
          $scope.loadEndorsets(null, null);
        },
        function (error) {
          console.log(JSON.stringify(error));
        });
    };


    $scope.ok = function () {
      $modalInstance.close('cancel');
    };

    //close modal
    $scope.cancel = function () {
      //console.log(items);
      $modalInstance.dismiss('cancel');
    };
  })
//dashboard endorsement modal instance controller
  .controller('CompanyUserModalEndorsementCtrl', function ($rootScope, $scope, $state, $modalInstance, items, $filter, LoopBackAuth, UserDetail, EndorsementService, Endorset, HrFeedback) {
    $scope.user = LoopBackAuth.currentUserData;
    $scope.successMsg = false;
    $scope.errorMsg = false;
    $scope.errors = [];
    $rootScope.isCompanyAdmin = false;
    $rootScope.isCompanyUser = false;

    $scope.endorsementData = items.endorsement;
    $scope.isQuestionEnable = true;

    //load endorset
    $scope.loadEndorset = function(endorset){
      Endorset.find(
        {

          filter:{
            where:{
              id: endorset.id
            },
            limit: 30,
            "include":
              [
                "userDetail",
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
        function(endorsets) {
          if(endorsets.length){
            $scope.endorsementData.endorserEndorsement.questions = endorsets[0].endorserEndorsement.questions;
          }
        },
        function(errorResponse) { console.log(errorResponse); }
      );
    };


    $scope.question = {};
    $scope.questionUpdate = {};
    //send question
    $scope.sendQuestion = function(isValid, questionId, isDraft){
      $rootScope.successMsg = false;
      $rootScope.errorMsg = false;
      if(questionId){
        $scope.question = $scope.questionUpdate;
      }
      //console.log($scope.question);
      if(isValid && $scope.question.comment != ''){
        EndorsementService.upsertQuestion(questionId,
          {
            comment: $scope.question.comment,
            type: 'text',
            endorserId: 0,
            endorserEndorsementId: $scope.endorsementData.endorserEndorsementId,
            endorsementId: $scope.endorsementData.endorsementId,
            replyId: 0,
            hrId: LoopBackAuth.currentUserId,
            isDraft: isDraft
          })
          .then(function(res){
            //console.log(res);
            $scope.successMsg = "Question sent successfully!";
            $scope.errorMsg = false;
            $scope.loadEndorset($scope.endorsementData);
            if(questionId){
              $scope.showQuestionEditForm[questionId] = {active: false};
            }
            $scope.question.comment = '';

            //$scope.loadEndorsets();
          });

      } else {
        $scope.errorMsg = true;
        $scope.errors = [
          {
            'error': "Complete the form!"
          }
        ];
      }
    };

    $scope.reply = {comment:[]};
    $scope.showReplyForm = [];
    //show reply
    $scope.showReply = function(id, reply){
      $scope.showReplyForm[id] = {active: true};
      if(reply){
        $scope.reply.comment[reply.replyId] = reply.comment ;
      }
    };

    $scope.questionEdit = {comment:[]};
    $scope.showQuestionEditForm = [];
    //show edit question
    $scope.showQuestionEdit = function(question){
      $scope.questionUpdate.comment = question.comment;
      $scope.showQuestionEditForm[question.id] = {active: true};
      //console.log( $scope.showQuestionEditForm);
    };

    //send reply of a question
    $scope.sendReply = function(id, editId, isDraft){
      $rootScope.successMsg = false;
      $rootScope.errorMsg = false;
      //console.log($scope.reply.comment);
      if($scope.reply.comment[id] != ''){
        EndorsementService.upsertQuestion(editId,
          {
            comment: $scope.reply.comment[id],
            type: 'text',
            endorserId: 0,
            endorserEndorsementId: $scope.endorsementData.endorserEndorsementId,
            endorsementId: $scope.endorsementData.endorsementId,
            replyId: id,
            hrId: LoopBackAuth.currentUserId,
            isDraft: isDraft
          })
          .then(function(res){
            //console.log(res);
            $scope.successMsg = "Reply sent successfully!";
            $scope.errorMsg = false;
            $scope.loadEndorset($scope.endorsementData);
            //$scope.loadEndorsets();
            $scope.showReplyForm[id] = {active: false};
          });
      }else {
        $scope.errorMsg = true;
        $scope.errors = [
          {
            'error': "Complete the form!"
          }
        ];
      }
    };

    $scope.hrFeedback = {
      //id: 0,
      score: 0, hrId: LoopBackAuth.currentUserId, endorsementId: $scope.endorsementData.endorsementId,
      userDetailId: $scope.endorsementData.endorserEndorsementId, endorsetId: $scope.endorsementData.id,
      endorsetSentId: 0
    };
    $scope.postHrFeedback = function(endorsementData){
      var isValid = true;
      if($scope.hrFeedback.skillScores.length > 0){
        angular.forEach($scope.hrFeedback.skillScores, function(skillScore, key){
          if(skillScore <= 0){
            isValid = false;
          }
        });

      }
      if($scope.hrFeedback.projectScores.length > 0){
        angular.forEach($scope.hrFeedback.projectScores, function(projectScore, key){
          if(projectScore <= 0){
            isValid = false;
          }
        });
      }
      if($scope.hrFeedback.answerScores != undefined && $scope.hrFeedback.answerScores.length > 0){
        angular.forEach($scope.hrFeedback.answerScores, function(answerScore, key){
          if(answerScore <= 0){
            isValid = false;
          }
        });
      }
      if($scope.hrFeedback.leadQuoteScore <= 0){
        isValid = false;
      }
      if(!isValid){
        $scope.errorMsg = true;
        $scope.errors = [
          {
            'error': "Please enter scores!"
          }
        ];
      } else {
        HrFeedback.find(
          {
            filter: {
              where: {
                hrId: LoopBackAuth.currentUserId,
                endorsementId: endorsementData.endorsementId,
                userDetailId: endorsementData.endorserEndorsementId,
                endorsetId: endorsementData.id
              },
              include: ['userDetail', 'hr', 'endorsement']
            }
          }, function(result) {
            console.log($scope.hrFeedback);
            if(result.length == 0){
              $scope.hrFeedback.endorsetId = endorsementData.id;
              HrFeedback.create($scope.hrFeedback)
                .$promise
                .then( function() {
                  $scope.successMsg = "Feedback sent successfully!";
                  $scope.errorMsg = false;

                });
            } else {
              $scope.hrFeedback.id = result[0].id;
              HrFeedback.upsert($scope.hrFeedback)
                .$promise
                .then( function() {
                  $scope.successMsg = "Feedback sent successfully!";
                  $scope.errorMsg = false;

                });
            }
          }, function(err) {
            console.log(err);
          }
        );
      }
    };

    //submit modal if ok
    $scope.ok = function () {
      $modalInstance.close();
    };

    //cancel request
    $scope.cancel = function () {
      //console.log(items);
      $modalInstance.dismiss('cancel');
    };
  }
);