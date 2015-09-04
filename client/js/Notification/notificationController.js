angular
  .module('app')
/**
 * Notification controller
 */
  .controller('NotificationController', ['$scope', '$rootScope', 'LoopBackAuth', '$state', '$cookies', '$modal', '$log', '$filter', 'Notification', 'PubSub', 'ngToast', 'EndorsementDataService', 'Endorsement', 'EndorsementService', 'CompanyRequest', 'EndorsetSent', 'Question', 'notificationService', 'UserDetail', 'InviteUser',
    function($scope, $rootScope, LoopBackAuth, $state, $cookies, $modal, $log, $filter, Notification, PubSub, ngToast, EndorsementDataService, Endorsement, EndorsementService, CompanyRequest, EndorsetSent, Question, notificationService, UserDetail, InviteUser) {
      $rootScope.success = false;
      $rootScope.error = false;
      $rootScope.currentUser = null;
      $scope.notification = {};
      //notificationService.resetData;

      if($rootScope.notifications == undefined){
        $rootScope.notifications = [];
      }
      $rootScope.notificationData = notificationService.notificationData;

      //console.log($rootScope.notificationData);

      $rootScope.notificationCount = 0;

      Notification.autoUpdate({msg: 'Hello World'}, function(res){
        //console.log(res);
      });

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

      $scope.paginate = {skip: 0, limit: 10, disabled: false};

      /**
       * Load notifications
       */
      $scope.loadNotifications = function(userId){
        notificationService.countNotification(
          userId,
          function(count){
            $rootScope.notificationCount = count.count;
          }
        );
        notificationService.loadNotifications(
          userId,
          $scope.paginate,
          function(notifications){
            //console.log(notifications);
            $rootScope.notifications = notifications;
            //Subscribe to notifications methods here..
            $scope.paginate.disabled = false;


            angular.forEach(notifications, function(notification, key) {
              PubSub.subscribe({
                collectionName: 'Notification',
                method: 'PUT',
                modelId: notification.id
              }, onNotificationUpdate);

              PubSub.subscribe({
                collectionName: 'Notification',
                method: 'DELETE',
                modelId: notification.id
              }, onNotificationDelete);
            });
          }
        );

      };

      if(UserDetail.isAuthenticated()){
        //load notifications
        $scope.loadNotifications(LoopBackAuth.currentUserId);

        PubSub.getData(
          //'user-' + LoopBackAuth.currentUserId,
          'common',
          function(data){
            //console.log(data);
            $scope.loadNotifications(LoopBackAuth.currentUserId);
          }
        );

      }

      /**
       * Mark as read
       */
      $scope.markAsRead = function(notification){
        Notification
          .prototype$updateAttributes({id:notification.id}, {isViewed: true})
          .$promise
          .then(function(res){

          });
      };
      /**
       * Delete notification
       */
      $scope.deleteNotification = function(notification){
        Notification.delete({id:notification.id})
          .$promise
          .then(function(res){
            //console.log(res);
            //load notifications
            $scope.loadNotifications(LoopBackAuth.currentUserId);
          });
      };

      var onNotificationCreate = function(data){
        //Logic for callback function on new notifications
        //console.log(data);
        /*ngToast.create({
          className: 'info',
          content: (data.title != undefined) ? data.title : "test",
          dismissOnTimeout: true,
          timeout: 8000,
          dismissButton: true
        });*/
        $scope.loadNotifications(LoopBackAuth.currentUserId);
      };

      $scope.nextNotificationPage = function(){
        /*$scope.paginate.limit += 5;
        $scope.paginate.disabled = true;
        console.log($scope.paginate);
        $scope.loadNotifications();
        */
      };

      PubSub.subscribe({
        collectionName: 'Notification',
        method : 'POST'
      }, onNotificationCreate);

      //select draft request event
      $scope.$on('onNotificationCreateEvent', function(event, args) {
        onNotificationCreate(args.data);
      });

      //load event
      $scope.$on('onNotificationLoadEvent', function(event, args) {
        console.log(args);
        $scope.loadNotifications(args.userId);
      });


      var onNotificationUpdate = function(){
        //Logic for callback function on updated notifications
        $scope.loadNotifications(LoopBackAuth.currentUserId);
      };

      var onNotificationDelete = function(){
        //Logic for callback function on delete notifications
        $scope.loadNotifications(LoopBackAuth.currentUserId);
      };

      /**
       * Open notification modal
       *
       */
      $scope.animationsEnabled = false;
      $scope.openNotification = function(notification){

        if(!$state.is('dashboard')){
          //console.log($state.current.name);
          $rootScope.notificationData.notification = notification;
        }

        $scope.markAsRead(notification);

        $scope.notification = notification;

        if(notification.type != undefined || notification.model != undefined){
          if($scope.notification.type == 1 || (notification.model == 'Endorsement' && $scope.notification.type == undefined)){
            //$state.go("endorsementsrequest", { id: $scope.notification.modelId });

            Endorsement.find(
              {
                filter:{
                  where:{ id: notification.modelId },
                  include:[ 'userDetail', 'userProfile', { "endorsementCompanies":["endorsementProjects"] } ]
                }
              },
              function(endorsements,  httpHeader) {
                if(endorsements.length){

                  if(!$state.is('dashboard')){
                    $rootScope.notificationData.eventName = "openAndSelectReceivedRequestEvent";
                    $rootScope.notificationData.selectedObject = {endorsement: endorsements[0], notification: notification};
                    $state.go('dashboard');
                  } else {
                    $scope.$broadcast("openAndSelectReceivedRequestEvent", {endorsement: endorsements[0], notification: notification});
                  }
                }
              },
              function(errorResponse) { console.log(errorResponse); }
            );
            //

          } else if($scope.notification.type == 2 || (notification.model == 'Endorsement' && $scope.notification.type == undefined)){
            //$state.go("endorsementsrequest", { id: $scope.notification.modelId });
            Endorsement.find(
              {
                filter:{
                  where:{ id: notification.modelId },
                  include:[ 'userDetail', 'userProfile', { "endorsementCompanies":["endorsementProjects"] } ]
                }
              },
              function(endorsements,  httpHeader) {
                if(endorsements.length){
                  if(!$state.is('dashboard')){
                    $rootScope.notificationData.eventName = "openAndSelectSentRequestEvent";
                    $rootScope.notificationData.selectedObject = {endorsement: endorsements[0], notification: notification};
                    $state.go('dashboard');
                  } else {
                    $scope.$broadcast("openAndSelectSentRequestEvent", {endorsement: endorsements[0], notification: notification});
                  }
                  //$scope.$broadcast("openAndSelectSentRequestEvent", {endorsement: endorsements[0], notification: notification});
                }
              },
              function(errorResponse) { console.log(errorResponse); }
            );
          } else if($scope.notification.type == 3 || (notification.model == 'Endorsement' && $scope.notification.type == undefined)){
            //$state.go("endorsementsrequest", { id: $scope.notification.modelId });
            Endorsement.find(
              {
                filter:{
                  where:{ id: notification.modelId },
                  include:[ 'userDetail', 'userProfile', { "endorsementCompanies":["endorsementProjects"] } ]
                }
              },
              function(endorsements,  httpHeader) {
                if(endorsements.length){
                  //$scope.$broadcast("openAndSelectSentRequestEvent", {endorsement: endorsements[0], notification: notification});
                  if(!$state.is('dashboard')){
                    $rootScope.notificationData.eventName = "openAndSelectSentRequestEvent";
                    $rootScope.notificationData.selectedObject = {endorsement: endorsements[0], notification: notification};
                    $state.go('dashboard');
                  } else {
                    $scope.$broadcast("openAndSelectSentRequestEvent", {endorsement: endorsements[0], notification: notification});
                  }
                }
              },
              function(errorResponse) { console.log(errorResponse); }
            );
          } else if($scope.notification.type == 4 || (notification.model == 'Endorsement' && $scope.notification.type == undefined)){
            //$state.go("endorsementsrequest", { id: $scope.notification.modelId });
            Endorsement.find(
              {
                filter:{
                  where:{ id: notification.modelId },
                  include:[ 'userDetail', 'userProfile', { "endorsementCompanies":["endorsementProjects"] } ]
                }
              },
              function(endorsements,  httpHeader) {
                if(endorsements.length){
                  //$scope.$broadcast("openAndSelectSentRequestEvent", {endorsement: endorsements[0], notification: notification});
                  if(!$state.is('dashboard')){
                    $rootScope.notificationData.eventName = "openAndSelectSentRequestEvent";
                    $rootScope.notificationData.selectedObject = {endorsement: endorsements[0], notification: notification};
                    $state.go('dashboard');
                  } else {
                    $scope.$broadcast("openAndSelectSentRequestEvent", {endorsement: endorsements[0], notification: notification});
                  }
                }
              },
              function(errorResponse) { console.log(errorResponse); }
            );
          } else if($scope.notification.type == 5 || (notification.model == 'EndorserEndorsement' && $scope.notification.type == undefined)){
            //$state.go("endorsementsreceived", { id: $scope.notification.modelId });
            EndorsementService.getEndorserEndorsement(
              {
                filter:{
                  where:{
                    id: notification.modelId
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
                if(endorsements.length){
                  //$scope.$broadcast("openAndSelectReceivedEndorsementEvent", {endorsement: endorsements[0], notification: notification});
                  if(!$state.is('dashboard')){
                    $rootScope.notificationData.eventName = "openAndSelectReceivedEndorsementEvent";
                    $rootScope.notificationData.selectedObject = {endorsement: endorsements[0], notification: notification};
                    $state.go('dashboard');
                  } else {
                    $scope.$broadcast("openAndSelectReceivedEndorsementEvent", {endorsement: endorsements[0], notification: notification});
                  }
                }



              },
              function(errorResponse) { console.log(errorResponse); }
            );
          } else if($scope.notification.type == 6 || (notification.model == 'CompanyRequest' && $scope.notification.type == undefined)){
            //$state.go("endorsetsrequest", { id: $scope.notification.modelId });
            CompanyRequest.find(
              {
                filter:{
                  where:{
                    email: LoopBackAuth.currentUserData.email,
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
              },
              function(errorResponse) { console.log(errorResponse); }
            );
            CompanyRequest.find(
              {
                filter:{
                  where:{
                    id: notification.modelId
                  },
                  "include": [ {"userDetail":["company"]}, "endorsetSents" ]
                }
              },
              function(endorsetRequests) {
                if(endorsetRequests.length){

                  if(!$state.is('dashboard')){
                    $rootScope.notificationData.eventName = "openAndSelectEndorsetRequestEvent";
                    $rootScope.notificationData.selectedObject = {endorsetRequest: endorsetRequests[0], notification: notification};
                    $state.go('dashboard');
                  } else {
                    $scope.$broadcast("openAndSelectEndorsetRequestEvent", {endorsetRequest: endorsetRequests[0], notification: notification});
                  }
                }
              },
              function(errorResponse) { console.log(errorResponse); }
            );
          } else if($scope.notification.type == 7 || (notification.model == 'CompanyRequest' && $scope.notification.type == undefined)){
            //$state.go("endorsetsrequest", { id: $scope.notification.modelId });
            CompanyRequest.find(
              {
                filter:{
                  where:{
                    id: notification.modelId
                  },
                  "include": [ {"userDetail":["company"]}, "endorsetSents" ]
                }
              },
              function(endorsetRequests) {
                if(endorsetRequests.length){

                  if(!$state.is('dashboard')){
                    $rootScope.notificationData.eventName = "openAndSelectEndorsetRequestSeenEvent";
                    $rootScope.notificationData.selectedObject = {endorsetRequest: endorsetRequests[0], notification: notification};
                    $state.go('dashboard');
                  } else {
                    $scope.$broadcast("openAndSelectEndorsetRequestSeenEvent", {endorsetRequest: endorsetRequests[0], notification: notification});
                  }
                }
              },
              function(errorResponse) { console.log(errorResponse); }
            );
          } else if($scope.notification.type == 8 || (notification.model == 'EndorsetSent' && $scope.notification.type == undefined)){
            //$state.go("dashboard");

            EndorsetSent.find(
              {

                filter:{
                  where:{
                    id: notification.modelId
                  },
                  "include":
                    [
                      "userDetail",
                      "companyUser",
                      "companyRequest",
                      {
                        "userProfile": [
                          "endorsements",
                          "endorserEndorsements",
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
                //console.log(endorsets);
                var skillScores = [];
                var projectScores = [];
                angular.forEach(endorsets, function(endorset, key){
                  var endorsetScoreTotal = 0;
                  var numberEndorsets = 0;
                  endorsets[key].numReplies = 0;
                  angular.forEach(endorset.userProfile.endorsets, function(endorset, profileKey){

                    //count replies
                    if(endorset.endorserEndorsement.questions != undefined && endorset.endorserEndorsement.questions.length){
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

                if(endorsets.length){

                  if(!$state.is('dashboard')){
                    $rootScope.notificationData.eventName = "openAndSelectEndorsetEvent";
                    $rootScope.notificationData.selectedObject = {endorset: endorsets[0], notification: notification};
                    $state.go('dashboard');
                  } else {
                    $scope.$broadcast("openAndSelectEndorsetEvent", {endorset: endorsets[0], notification: notification});
                  }
                }


              },
              function(errorResponse) { console.log(errorResponse); }
            );

          } else if($scope.notification.type == 9 || (notification.model == 'Question' && $scope.notification.type == undefined)){
            //$state.go("questions", { id: $scope.notification.modelId });
            Question.find(
              {id: notification.modelId},
              function(q){
                if(q){
                  EndorsementService.getEndorserEndorsement(
                    {
                      filter:{
                        where:{
                          id: q.endorserEndorsementId
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
                          { "questions": [
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
                    },
                    function(endorsements) {
                      angular.forEach(endorsements, function(endorsement, key){
                        //count replies
                        if(endorsement.questions != undefined && endorsement.questions.length){
                          Question.find(
                            {
                              filter: {
                                where: {
                                  endorserEndorsementId: endorsement.id,
                                  //hrId: 0,
                                  replyId: 0,
                                  isDraft: {neq: true}
                                  //endorserId: {neq: 0}
                                }
                              }
                            },
                            function(questions) {
                              endorsements[key].numQuestions = questions.length;
                            },
                            function(errorResponse) { console.log(errorResponse); }
                          );

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

                      if(endorsements.length){
                        //$scope.$broadcast("openAndSelectEndorsetRequestEvent", {endorsetRequest: endorsements[0], notification: notification});

                        if(!$state.is('dashboard')){
                          $rootScope.notificationData.eventName = "openAndSelectSentEndorsementEvent";
                          $rootScope.notificationData.selectedObject = {endorsement: endorsements[0], notification: notification};
                          $state.go('dashboard');
                        } else {
                          $scope.$broadcast("openAndSelectSentEndorsementEvent", {endorsement: endorsements[0], notification: notification});
                        }

                      }
                    },
                    function(errorResponse) { console.log(errorResponse); }
                  );
                }

              },
              function(errorResponse) { console.log(errorResponse); }
            );

          } else if($scope.notification.type == 10 || (notification.model == 'Question' && $scope.notification.type == undefined)){
            //$state.go("questions", { id: $scope.notification.modelId });

            if(!$state.is('dashboard')){
              $rootScope.notificationData.eventName = "openAndSelectEndorsetEvent";
              $rootScope.notificationData.selectedObject = {endorset: null, notification: notification};
              $state.go('dashboard');
            } else {
              $scope.$broadcast("openAndSelectEndorsetEvent", {endorset: null, notification: notification});
            }

          } else if($scope.notification.type == 11) {
            $scope.animationsEnabled = false;
            InviteUser.find(
              {
                filter:{
                  limit: 1,
                  where:{
                    id: $scope.notification.modelId
                  },
                  order: 'created DESC',
                  include:[
                    {'adminUser':["company"]}, 'userDetail'
                  ]
                }
              },
              function(invites) {
                if(invites.length){
                  $scope.invite = invites[0];

                  var modalInstance = $modal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: 'acceptCompanyinvitationModalContent.html',
                    controller: 'AcceptInviteModalInstanceCtrl',
                    size: 'md',
                    resolve: {
                      items: function () {
                        return {
                          invite:  invites[0]
                        };
                      }
                    }
                  });

                  modalInstance.result.then(function (selectedItem) {
                    console.log(selectedItem);
                  }, function () {
                    $log.info('Modal dismissed at: ' + new Date());
                  });
                }


              },
              function(errorResponse) { console.log(errorResponse); }
            );

            //$state.go("receivedinvites");
          } else {
            $scope.errorMsg = true;
            $scope.errors = [
              {
                'error': "Notification details not found"
              }
            ];

          }


        } else {

        }



      };


      //show all
      $scope.showAllNotifications = function(){
        var modalInstance = $modal.open({
          animation: $scope.animationsEnabled,
          templateUrl: 'notificationListModalContent.html',
          controller: 'ModalNotififcationCtrl',
          size: 'lg',
          resolve: {
            items: function () {
              return {

              };
            }
          }
        });

        modalInstance.result.then(function (selectedItem) {
          console.log(selectedItem);
        }, function () {
          $log.info('Modal dismissed at: ' + new Date());
        });
      }

    }])

/**
 * AssignEndorsetUser model controller
 */
  .controller('AcceptInviteModalInstanceCtrl', function ($rootScope, $scope, $state, $modalInstance, items, $filter, LoopBackAuth, UserDetail, $location, InviteUser) {
    $rootScope.successMsg = false;
    $rootScope.errorMsg = false;
    $rootScope.errors = [];

    $scope.invite = items.invite;

    /**
     * Accept invites
     */
    $scope.acceptInvite = function(invite){
      InviteUser
        .prototype$updateAttributes({id:invite.id}, {isViewed: true, status: 1, userDetailId: LoopBackAuth.currentUserId})
        .$promise
        .then(function(res){
          $modalInstance.close();
          $rootScope.success = "You have successfully accepted!";

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

//Notififcation modal instance controller
  .controller('ModalNotififcationCtrl', function (
    $rootScope, $scope, $state, $modalInstance, items, $state, LoopBackAuth, $cookies, $modal, $log, $filter, Notification, PubSub, ngToast, EndorsementDataService, Endorsement, EndorsementService, CompanyRequest, EndorsetSent, Question, notificationService, UserDetail, InviteUser) {
    $scope.user = LoopBackAuth.currentUserData;
    $scope.successMsg = false;
    $scope.errorMsg = false;
    $scope.errors = [];

    $scope.notification = {};
    //notificationService.resetData;

    if($rootScope.notifications == undefined){
      $rootScope.notifications = [];
    }
    $rootScope.notificationData = notificationService.notificationData;

    //console.log($rootScope.notificationData);

    $rootScope.notificationCount = 0;

    Notification.autoUpdate({msg: 'Hello World'}, function(res){
      //console.log(res);
    });

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

    $scope.paginate = {skip: 0, limit: 10, disabled: false};

    var onNotificationUpdate = function(){
      //Logic for callback function on updated notifications
      $scope.loadNotifications(LoopBackAuth.currentUserId);
    };

    var onNotificationDelete = function(){
      //Logic for callback function on delete notifications
      $scope.loadNotifications(LoopBackAuth.currentUserId);
    };
    /**
     * Load notifications
     */
    $scope.loadNotifications = function(userId){
      notificationService.countNotification(
        userId,
        function(count){
          $rootScope.notificationCount = count.count;
        }
      );
      notificationService.loadNotifications(
        userId,
        $scope.paginate,
        function(notifications){
          //console.log(notifications);
          $rootScope.notifications = notifications;
          //Subscribe to notifications methods here..
          $scope.paginate.disabled = false;


          angular.forEach(notifications, function(notification, key) {
            PubSub.subscribe({
              collectionName: 'Notification',
              method: 'PUT',
              modelId: notification.id
            }, onNotificationUpdate);

            PubSub.subscribe({
              collectionName: 'Notification',
              method: 'DELETE',
              modelId: notification.id
            }, onNotificationDelete);
          });
        }
      );

    };

    if(UserDetail.isAuthenticated()){
      //load notifications
      $scope.loadNotifications(LoopBackAuth.currentUserId);

      PubSub.getData(
        //'user-' + LoopBackAuth.currentUserId,
        'common',
        function(data){
          console.log(data);
          $scope.loadNotifications(LoopBackAuth.currentUserId);
        }
      );

    }

    /**
     * Mark as read
     */
    $scope.markAsRead = function(notification){
      Notification
        .prototype$updateAttributes({id:notification.id}, {isViewed: true})
        .$promise
        .then(function(res){

        });
    };
    /**
     * Delete notification
     */
    $scope.deleteNotification = function(notification){
      Notification.delete({id:notification.id})
        .$promise
        .then(function(res){
          //console.log(res);
          //load notifications
          $scope.loadNotifications(LoopBackAuth.currentUserId);
        });
    };

    /**
     * Open notification modal
     *
     */
    $scope.animationsEnabled = false;
    $scope.openNotification = function(notification){
      $modalInstance.close();

      if(!$state.is('dashboard')){
        //console.log($state.current.name);
        $rootScope.notificationData.notification = notification;
      }

      $scope.markAsRead(notification);

      $scope.notification = notification;

      if(notification.type != undefined || notification.model != undefined){
        if($scope.notification.type == 1 || (notification.model == 'Endorsement' && $scope.notification.type == undefined)){
          //$state.go("endorsementsrequest", { id: $scope.notification.modelId });

          Endorsement.find(
            {
              filter:{
                where:{ id: notification.modelId },
                include:[ 'userDetail', 'userProfile', { "endorsementCompanies":["endorsementProjects"] } ]
              }
            },
            function(endorsements,  httpHeader) {
              if(endorsements.length){

                if(!$state.is('dashboard')){
                  $rootScope.notificationData.eventName = "openAndSelectReceivedRequestEvent";
                  $rootScope.notificationData.selectedObject = {endorsement: endorsements[0], notification: notification};
                  $state.go('dashboard');
                } else {
                  $scope.$broadcast("openAndSelectReceivedRequestEvent", {endorsement: endorsements[0], notification: notification});
                }
              }
            },
            function(errorResponse) { console.log(errorResponse); }
          );
          //

        } else if($scope.notification.type == 2 || (notification.model == 'Endorsement' && $scope.notification.type == undefined)){
          //$state.go("endorsementsrequest", { id: $scope.notification.modelId });
          Endorsement.find(
            {
              filter:{
                where:{ id: notification.modelId },
                include:[ 'userDetail', 'userProfile', { "endorsementCompanies":["endorsementProjects"] } ]
              }
            },
            function(endorsements,  httpHeader) {
              if(endorsements.length){
                if(!$state.is('dashboard')){
                  $rootScope.notificationData.eventName = "openAndSelectSentRequestEvent";
                  $rootScope.notificationData.selectedObject = {endorsement: endorsements[0], notification: notification};
                  $state.go('dashboard');
                } else {
                  $scope.$broadcast("openAndSelectSentRequestEvent", {endorsement: endorsements[0], notification: notification});
                }
                //$scope.$broadcast("openAndSelectSentRequestEvent", {endorsement: endorsements[0], notification: notification});
              }
            },
            function(errorResponse) { console.log(errorResponse); }
          );
        } else if($scope.notification.type == 3 || (notification.model == 'Endorsement' && $scope.notification.type == undefined)){
          //$state.go("endorsementsrequest", { id: $scope.notification.modelId });
          Endorsement.find(
            {
              filter:{
                where:{ id: notification.modelId },
                include:[ 'userDetail', 'userProfile', { "endorsementCompanies":["endorsementProjects"] } ]
              }
            },
            function(endorsements,  httpHeader) {
              if(endorsements.length){
                //$scope.$broadcast("openAndSelectSentRequestEvent", {endorsement: endorsements[0], notification: notification});
                if(!$state.is('dashboard')){
                  $rootScope.notificationData.eventName = "openAndSelectSentRequestEvent";
                  $rootScope.notificationData.selectedObject = {endorsement: endorsements[0], notification: notification};
                  $state.go('dashboard');
                } else {
                  $scope.$broadcast("openAndSelectSentRequestEvent", {endorsement: endorsements[0], notification: notification});
                }
              }
            },
            function(errorResponse) { console.log(errorResponse); }
          );
        } else if($scope.notification.type == 4 || (notification.model == 'Endorsement' && $scope.notification.type == undefined)){
          //$state.go("endorsementsrequest", { id: $scope.notification.modelId });
          Endorsement.find(
            {
              filter:{
                where:{ id: notification.modelId },
                include:[ 'userDetail', 'userProfile', { "endorsementCompanies":["endorsementProjects"] } ]
              }
            },
            function(endorsements,  httpHeader) {
              if(endorsements.length){
                //$scope.$broadcast("openAndSelectSentRequestEvent", {endorsement: endorsements[0], notification: notification});
                if(!$state.is('dashboard')){
                  $rootScope.notificationData.eventName = "openAndSelectSentRequestEvent";
                  $rootScope.notificationData.selectedObject = {endorsement: endorsements[0], notification: notification};
                  $state.go('dashboard');
                } else {
                  $scope.$broadcast("openAndSelectSentRequestEvent", {endorsement: endorsements[0], notification: notification});
                }
              }
            },
            function(errorResponse) { console.log(errorResponse); }
          );
        } else if($scope.notification.type == 5 || (notification.model == 'EndorserEndorsement' && $scope.notification.type == undefined)){
          //$state.go("endorsementsreceived", { id: $scope.notification.modelId });
          EndorsementService.getEndorserEndorsement(
            {
              filter:{
                where:{
                  id: notification.modelId
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
              if(endorsements.length){
                //$scope.$broadcast("openAndSelectReceivedEndorsementEvent", {endorsement: endorsements[0], notification: notification});
                if(!$state.is('dashboard')){
                  $rootScope.notificationData.eventName = "openAndSelectReceivedEndorsementEvent";
                  $rootScope.notificationData.selectedObject = {endorsement: endorsements[0], notification: notification};
                  $state.go('dashboard');
                } else {
                  $scope.$broadcast("openAndSelectReceivedEndorsementEvent", {endorsement: endorsements[0], notification: notification});
                }
              }



            },
            function(errorResponse) { console.log(errorResponse); }
          );
        } else if($scope.notification.type == 6 || (notification.model == 'CompanyRequest' && $scope.notification.type == undefined)){
          //$state.go("endorsetsrequest", { id: $scope.notification.modelId });
          CompanyRequest.find(
            {
              filter:{
                where:{
                  email: LoopBackAuth.currentUserData.email,
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
            },
            function(errorResponse) { console.log(errorResponse); }
          );
          CompanyRequest.find(
            {
              filter:{
                where:{
                  id: notification.modelId
                },
                "include": [ {"userDetail":["company"]}, "endorsetSents" ]
              }
            },
            function(endorsetRequests) {
              if(endorsetRequests.length){

                if(!$state.is('dashboard')){
                  $rootScope.notificationData.eventName = "openAndSelectEndorsetRequestEvent";
                  $rootScope.notificationData.selectedObject = {endorsetRequest: endorsetRequests[0], notification: notification};
                  $state.go('dashboard');
                } else {
                  $scope.$broadcast("openAndSelectEndorsetRequestEvent", {endorsetRequest: endorsetRequests[0], notification: notification});
                }
              }
            },
            function(errorResponse) { console.log(errorResponse); }
          );
        } else if($scope.notification.type == 7 || (notification.model == 'CompanyRequest' && $scope.notification.type == undefined)){
          //$state.go("endorsetsrequest", { id: $scope.notification.modelId });
          CompanyRequest.find(
            {
              filter:{
                where:{
                  id: notification.modelId
                },
                "include": [ {"userDetail":["company"]}, "endorsetSents" ]
              }
            },
            function(endorsetRequests) {
              if(endorsetRequests.length){

                if(!$state.is('dashboard')){
                  $rootScope.notificationData.eventName = "openAndSelectEndorsetRequestSeenEvent";
                  $rootScope.notificationData.selectedObject = {endorsetRequest: endorsetRequests[0], notification: notification};
                  $state.go('dashboard');
                } else {
                  $scope.$broadcast("openAndSelectEndorsetRequestSeenEvent", {endorsetRequest: endorsetRequests[0], notification: notification});
                }
              }
            },
            function(errorResponse) { console.log(errorResponse); }
          );
        } else if($scope.notification.type == 8 || (notification.model == 'EndorsetSent' && $scope.notification.type == undefined)){
          //$state.go("dashboard");

          EndorsetSent.find(
            {

              filter:{
                where:{
                  id: notification.modelId
                },
                "include":
                  [
                    "userDetail",
                    "companyUser",
                    "companyRequest",
                    {
                      "userProfile": [
                        "endorsements",
                        "endorserEndorsements",
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
              //console.log(endorsets);
              var skillScores = [];
              var projectScores = [];
              angular.forEach(endorsets, function(endorset, key){
                var endorsetScoreTotal = 0;
                var numberEndorsets = 0;
                endorsets[key].numReplies = 0;
                angular.forEach(endorset.userProfile.endorsets, function(endorset, profileKey){

                  //count replies
                  if(endorset.endorserEndorsement.questions != undefined && endorset.endorserEndorsement.questions.length){
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

              if(endorsets.length){

                if(!$state.is('dashboard')){
                  $rootScope.notificationData.eventName = "openAndSelectEndorsetEvent";
                  $rootScope.notificationData.selectedObject = {endorset: endorsets[0], notification: notification};
                  $state.go('dashboard');
                } else {
                  $scope.$broadcast("openAndSelectEndorsetEvent", {endorset: endorsets[0], notification: notification});
                }
              }


            },
            function(errorResponse) { console.log(errorResponse); }
          );

        } else if($scope.notification.type == 9 || (notification.model == 'Question' && $scope.notification.type == undefined)){
          //$state.go("questions", { id: $scope.notification.modelId });
          Question.find(
            {id: notification.modelId},
            function(q){
              if(q){
                EndorsementService.getEndorserEndorsement(
                  {
                    filter:{
                      where:{
                        id: q.endorserEndorsementId
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
                        { "questions": [
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
                  },
                  function(endorsements) {
                    angular.forEach(endorsements, function(endorsement, key){
                      //count replies
                      if(endorsement.questions != undefined && endorsement.questions.length){
                        Question.find(
                          {
                            filter: {
                              where: {
                                endorserEndorsementId: endorsement.id,
                                //hrId: 0,
                                replyId: 0,
                                isDraft: {neq: true}
                                //endorserId: {neq: 0}
                              }
                            }
                          },
                          function(questions) {
                            endorsements[key].numQuestions = questions.length;
                          },
                          function(errorResponse) { console.log(errorResponse); }
                        );

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

                    if(endorsements.length){
                      //$scope.$broadcast("openAndSelectEndorsetRequestEvent", {endorsetRequest: endorsements[0], notification: notification});

                      if(!$state.is('dashboard')){
                        $rootScope.notificationData.eventName = "openAndSelectSentEndorsementEvent";
                        $rootScope.notificationData.selectedObject = {endorsement: endorsements[0], notification: notification};
                        $state.go('dashboard');
                      } else {
                        $scope.$broadcast("openAndSelectSentEndorsementEvent", {endorsement: endorsements[0], notification: notification});
                      }

                    }
                  },
                  function(errorResponse) { console.log(errorResponse); }
                );
              }

            },
            function(errorResponse) { console.log(errorResponse); }
          );

        } else if($scope.notification.type == 10 || (notification.model == 'Question' && $scope.notification.type == undefined)){
          //$state.go("questions", { id: $scope.notification.modelId });

          if(!$state.is('dashboard')){
            $rootScope.notificationData.eventName = "openAndSelectEndorsetEvent";
            $rootScope.notificationData.selectedObject = {endorset: null, notification: notification};
            $state.go('dashboard');
          } else {
            $scope.$broadcast("openAndSelectEndorsetEvent", {endorset: null, notification: notification});
          }

        } else if($scope.notification.type == 11) {
          $scope.animationsEnabled = false;
          InviteUser.find(
            {
              filter:{
                limit: 1,
                where:{
                  id: $scope.notification.modelId
                },
                order: 'created DESC',
                include:[
                  {'adminUser':["company"]}, 'userDetail'
                ]
              }
            },
            function(invites) {
              if(invites.length){
                $scope.invite = invites[0];

                var modalInstance = $modal.open({
                  animation: $scope.animationsEnabled,
                  templateUrl: 'acceptCompanyinvitationModalContent.html',
                  controller: 'AcceptInviteModalInstanceCtrl',
                  size: 'md',
                  resolve: {
                    items: function () {
                      return {
                        invite:  invites[0]
                      };
                    }
                  }
                });

                modalInstance.result.then(function (selectedItem) {
                  console.log(selectedItem);
                }, function () {
                  $log.info('Modal dismissed at: ' + new Date());
                });
              }


            },
            function(errorResponse) { console.log(errorResponse); }
          );

          //$state.go("receivedinvites");
        } else if(angular.equals($scope.notification.type, 12)) {
          console.log($scope.notification);
          var sentIds = [];
          AssignEndorsets.find(
            {
              filter: {
                where: {
                  id: $scope.notification.modelId
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
                        "companyRequest",
                        {
                          "userProfile": [
                            "endorsements",
                            "endorserEndorsements",
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
                  angular.forEach(endorsets, function(endorset, key){
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

                  if(endorsets.length){
                    $scope.$broadcast("openAndSelectMyEndorsetEvent", {endorset: endorsets[0], notification: notification});
                  }



                },
                function(errorResponse) { console.log(errorResponse); }
              );
            },
            function(errorResponse) { console.log(errorResponse); }
          );
        } else {
          console.log($scope.notification);
          $scope.errorMsg = true;
          $scope.errors = [
            {
              'error': "Notification details not found"
            }
          ];

        }


      } else {

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