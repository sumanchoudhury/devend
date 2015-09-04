angular
  .module('app')
/**
 * DashboardController
 *
 * Dashboard controller is responsible to maintain Requests, Endorsements dashboard
 */
  .controller('DashboardController', ['$rootScope', '$scope', '$state', '$stateParams', '$modal', '$log', '$filter', 'LoopBackAuth', 'UserDetail', 'UserProfile', 'Endorsement', 'EndorsementService', 'EndorsementCompany', '$cookies', 'EndorsementProject', 'Question', 'PubSub', 'EndorsementDataService', 'ngToast', 'notificationService', 'LoginService',
    function($rootScope, $scope, $state, $stateParams, $modal, $log, $filter, LoopBackAuth, UserDetail, UserProfile, Endorsement, EndorsementService, EndorsementCompany, $cookies, EndorsementProject, Question, PubSub, EndorsementDataService, ngToast, notificationService, LoginService) {
      $rootScope.useType = LoginService.getUseType();
      /**
       * Current logged-in user object
       * @type {Object|*}
       */
      $scope.user = LoopBackAuth.currentUserData;
      $scope.onReactUpdateSubItemClick = function (item) {
        console.log(item);
      };

      $rootScope.isCompanyAdmin = false;
      $rootScope.isCompanyUser = false;

      $rootScope.showDashboardWidget  =  true;


      Endorsement.updateEndorserId({msg: 'Hello World'}, function(res){
        //console.log(res);
      });

      $rootScope.dashboardTab = {endorsements: 'requests', endorsets: 'list'};

      //init status filter
      $scope.filterRequestStatus = {};
      //endorsement filter
      //$scope.endorsementSearch = {};
      $scope.profileFilter = {};

      /**
       * global success message
       * @type {boolean}
       */
      $rootScope.successMsg = false;

      /**
       * global error message
       * @type {boolean}
       */
      $rootScope.errorMsg = false;
      $rootScope.errors = [];

      $rootScope.profiles = [];

      //set endorsements data
      $rootScope.endorsements = EndorsementDataService.getEndorsements();
      $rootScope.draftEndorsements = EndorsementDataService.getDraftEndorsements();
      $rootScope.receivedEndorsements = [];
      $scope.endorsement = {userProfileId: $rootScope.profileId, userDetailId: LoopBackAuth.currentUserId};

      //endorsement sent boolean
      $rootScope.endorsementSent = false;

      //disable element boolean
      $rootScope.disableElement = false;

      $scope.isNewRequestEnable = true;

      //select profile name
      $rootScope.profileName = $cookies.get('profileName');

      //selected profile id
      $rootScope.profileId = $cookies.get('profileId');
      //string to boolean
      if($rootScope.profileId == "false" || $rootScope.profileName == "false"){
        $rootScope.profileId = false;
        $rootScope.profileName = false;
      }

      $scope.isAddEndorsement = false;
      $scope.addEndorsementData = {};
      $scope.addFormProfiles = [];

      $scope.requestStep = 1;
      $scope.requestStepText = 'Who';

      //dashboard tabs
      $rootScope.mainTabs = {
        endorsements: {
          name: "Endorsements",
          active: false,
          disabled: false,
          buttons: {
            list: {
              name: "List",
              active: false,
              disabled: false,
              buttons: {sent: {active: false}, draft: {active: false}, received: {active: false}}
            },
            requests: {
              name: "Requests",
              active: false,
              disabled: false,
              buttons: {sent: {active: false}, draft: {active: false}, received: {active: false}}
            }
          }
        },
        endorsets: {
          name: "Endorsets",
          active: false,
          disabled: false,
          buttons: {
            list: {
              name: "List",
              active: false,
              disabled: false,
              buttons: {sent: {active: false}, draft: {active: false}, received: {active: false}}
            },
            requests: {
              name: "Requests",
              active: false,
              disabled: false,
              buttons: {sent: {active: false}, draft: {active: false}, received: {active: false}}
            }
          }
        }
      };

      //request form tabs
      $scope.tabs = {
        who: {
          name: "who",
          active: true,
          disabled: false,
          requestStep: 1
        },
        where: {
          name: "where",
          active: false,
          disabled: true,
          requestStep: 2
        },
        when: {
          name: "when",
          active: false,
          disabled: true,
          requestStep: 3
        },
        what: {
          name: "what",
          active: false,
          disabled: true,
          requestStep: 4
        },
        which: {
          name: "which",
          active: false,
          disabled: true,
          requestStep: 5
        },
        why: {
          name: "why",
          active: false,
          disabled: true,
          requestStep: 6
        }
      };


      //company object
      $scope.company = {
        companyName: '',
        country: '',
        city: '',
        openStartDate: false,
        openEndDate: false
      };

      //collection of companies
      $scope.companies = [];

      //collection of projects
      $scope.projects = [];

      //project object
      $scope.project = {
        endorsementCompanyId: '',
        projectName: '',
        shortDescription: ''
      };

      /**
       * select sent/draft request handler
       * @param endorsement
       * @param isDisableElement
       */
      $scope.selectRequest = function(endorsement, isDisableElement){
        $rootScope.disableElement = isDisableElement;

        angular.forEach($scope.tabs, function(value, key){
          value.active = false;
        });
        $scope.tabs.who.active = true;
        $scope.requestStep = 1;
        $scope.requestStepText = 'Who';

        $scope.projects = [];
        $scope.companies = [];


        if(endorsement == null){
          $scope.endorsement = {};
          return;
        }
        endorsement.level = parseInt(endorsement.level);
        $scope.endorsement = endorsement;

        //fetch endorsement companies
        Endorsement.endorsementCompanies({id: endorsement.id})
          .$promise
          .then(function(companies){
            $scope.companies = companies;
            //console.log(companies);
            angular.forEach($scope.companies, function(company, key){
              EndorsementCompany.endorsementProjects({id: company.id})
                .$promise
                .then(function(projects){
                  //console.log(projects);
                  angular.forEach(projects, function(project, projKey){
                    project.endorsementProjectCompanyName = company;
                    $scope.projects.push(project);

                  });
                  angular.forEach($scope.projects, function(project1, projKey1){
                    if(project1.projectName == '' && $scope.projects.length > 1){
                      $scope.projects.splice(projKey1, 1);
                    }

                  });
                  if($scope.projects.length == 0){
                    //$scope.projects.push($scope.project);
                  }
                });

            });
          });
      };

      /**
       * new request
       */
      $scope.newRequest = function(){
        $rootScope.disableElement = false;
        $scope.endorsement = null;
        $scope.projects = [];
        $scope.companies = [];
        //$scope.projects.push($scope.project);
        $scope.endorsement = {userProfileId: $rootScope.profileId, userDetailId: LoopBackAuth.currentUserId};

        angular.forEach($scope.tabs, function(value, key){
          value.active = false;
        });
        $scope.tabs.who.active = true;
        $scope.requestStep = 1;
        $scope.requestStepText = 'Who';
      };

      /**
       * OPen new reques event
       */
      $scope.$on('openNewRequestEvent', function(event, args) {
        $scope.newRequest();
      });

      /**
       * load request data
       * @param profileId
       */
      $scope.loadRequestsData = function(profileId, currentInstance){

        EndorsementDataService.loadRequestsData(profileId, currentInstance, function(endorsements){
          //console.log(endorsements);
          //sent requests
          $rootScope.endorsements = endorsements;
          if($rootScope.endorsements.length && currentInstance == null){
            $scope.selectRequest($rootScope.endorsements[0], true);
          } else if($rootScope.endorsements.length && currentInstance){
            $scope.selectRequest(currentInstance, true);
          } else {
            $scope.newRequest();
            $rootScope.endorsements = null;
          }

          //draft requests
          $rootScope.draftEndorsements = EndorsementDataService.getDraftEndorsements();
        });

      };


      //get and set profile if no profile is found in cookie
      if($rootScope.profileId == false || angular.equals($rootScope.profileId, 'false')){
        UserProfile.find(
          {

            filter:{
              limit: 30,
              where:{
                userDetailId: LoopBackAuth.currentUserId
              },
              order: 'created DESC'
            }
          },
          function(response) {

            if(response.length){
              $rootScope.profiles = response;
              $rootScope.profileId = response[0].id;
              $rootScope.profileName = response[0].profileName;
              $scope.endorsement.userProfileId = response[0].id;

              $cookies.put('profileId', response[0].id);
              $cookies.put('profileName', response[0].profileName);

              $scope.loadRequestsData(response[0].id);

            } else {
              $rootScope.endorsements = null;
              $scope.newRequest();
            }
          },
          function(errorResponse) { console.log(errorResponse); }
        );

      } else {

      }





      $rootScope.isLoaded = false;
      /**
       * open sent request tab
       */
      $scope.openSentTab = function(currentInstance){
        $rootScope.successMsg = false;
        $rootScope.errorMsg = false;
        if(currentInstance == undefined){
          currentInstance = null;
        }

        $rootScope.disableElement = true;

        $rootScope.isLoaded = true;
        $rootScope.mainTabs.endorsets.active = false;
        $rootScope.mainTabs.endorsements.active = true;
        $rootScope.mainTabs.endorsements.buttons.list.active = false;
        $rootScope.mainTabs.endorsements.buttons.requests.active = true;
        $rootScope.mainTabs.endorsements.buttons.requests.buttons.sent.active = true;
        $rootScope.mainTabs.endorsements.buttons.requests.buttons.draft.active = false;
        $rootScope.mainTabs.endorsements.buttons.requests.buttons.received.active = false;

        $rootScope.dashboardTab.endorsements = "requests";


        $scope.loadRequestsData($rootScope.profileId, currentInstance);

        if($rootScope.endorsements != null && $rootScope.endorsements.length && currentInstance == null){
          $scope.selectRequest($rootScope.endorsements[0], true);
        }

        if(currentInstance){
          $scope.selectRequest(currentInstance, true);
        }

      };

      if(!$rootScope.isLoaded && !$rootScope.mainTabs.endorsements.buttons.requests.buttons.sent.active){
        $scope.openSentTab(null);
      }

      $scope.notification = {};
      //select sent request event
      $scope.$on('openAndSelectSentRequestEvent', function(event, args) {
        if(args.endorsement != null){
          $scope.openSentTab(args.endorsement);
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
       * open draft requests tab
       */
      $scope.openDraftTab = function(){
        $rootScope.successMsg = false;
        $rootScope.errorMsg = false;
        $rootScope.mainTabs.endorsets.active = false;
        $rootScope.mainTabs.endorsements.active = true;
        $rootScope.mainTabs.endorsements.buttons.list.active = false;
        $rootScope.mainTabs.endorsements.buttons.requests.active = true;
        $rootScope.mainTabs.endorsements.buttons.requests.buttons.sent.active = false;
        $rootScope.mainTabs.endorsements.buttons.requests.buttons.draft.active = true;
        $rootScope.mainTabs.endorsements.buttons.requests.buttons.received.active = false;

        $scope.newRequest();
        $rootScope.disableElement = false;

        EndorsementDataService.loadRequestsData($rootScope.profileId);

        $rootScope.draftEndorsements = EndorsementDataService.getDraftEndorsements();
        if($rootScope.draftEndorsements != null && $rootScope.draftEndorsements.length){
          $scope.selectRequest($rootScope.draftEndorsements[0], false);
        }



      };

      //select draft request event
      $scope.$on('openAndSelectDraftRequestEvent', function(event, args) {
        $scope.openDraftTab();
      });

      /**
       * open received requests tab
       */
      $scope.openReceivedTab = function(currentInstance){
        $rootScope.successMsg = false;
        $rootScope.errorMsg = false;
        if(currentInstance == undefined){
          currentInstance = null;
        }
        $rootScope.mainTabs.endorsets.active = false;
        $rootScope.mainTabs.endorsements.active = true;
        $rootScope.mainTabs.endorsements.buttons.list.active = false;
        $rootScope.mainTabs.endorsements.buttons.requests.active = true;
        $rootScope.mainTabs.endorsements.buttons.requests.buttons.sent.active = false;
        $rootScope.mainTabs.endorsements.buttons.requests.buttons.draft.active = false;
        $rootScope.mainTabs.endorsements.buttons.requests.buttons.received.active = true;

        $rootScope.dashboardTab.endorsements = 'requests';

        EndorsementDataService.loadReceivedData($scope.user.email, currentInstance);

        $rootScope.receivedEndorsements = EndorsementDataService.getReceivedData();
        if($rootScope.receivedEndorsements != null && $rootScope.receivedEndorsements.length && currentInstance == null){
          $scope.selectReceivedRequest($rootScope.receivedEndorsements[0]);
        }
        if(currentInstance != null){
          $scope.selectReceivedRequest(currentInstance);
        }

      };

      $rootScope.receivedEndorsement = {};

      /**
       * select received request handler
       * @param endorsement
       */
      $scope.selectReceivedRequest = function (endorsement){
        if(endorsement == null){
          $rootScope.receivedEndorsement = null;
        }
        var today = new Date();
        if(!endorsement.endorserSeenAt){
          EndorsementService.update(endorsement.id, {endorserSeenAt: $filter('date')(today, "yyyy-MM-dd")})
            .then(function(res){
              endorsement.endorserSeenAt = res.endorserSeenAt;
              //console.log(res);
            });
        }
        $rootScope.receivedEndorsement = endorsement;
      };

      //select received request event
      $scope.$on('openAndSelectReceivedRequestEvent', function(event, args) {
        if(args.endorsement != null){
          $scope.openReceivedTab(args.endorsement);
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

      //accept/decline request
      $scope.setEndorserAcceptStatus = function(endorsement, status){
        $rootScope.successMsg = false;
        $rootScope.errorMsg = false;
        EndorsementService.update(endorsement.id, {endorserAcceptStatus: status})
          .then(function(res){
            EndorsementService.upsertEndorserEndorsement(0,
              {
                endorserId: LoopBackAuth.currentUserId,
                endorsementId: endorsement.id,
                userProfileId: endorsement.userProfileId,
                acceptStatus: 0,
                isDraft: true
              })
              .then(function(endorserEndorsement){
                //console.log(endorserEndorsement);

                var statusText = '';
                if(status == 1){
                  statusText = 'accepted';
                } else {
                  statusText = 'declined';
                }
                $rootScope.receivedEndorsement.endorserAcceptStatus = status;
                $rootScope.receivedEndorsement.endorserAcceptStatusText = statusText;
                $rootScope.successMsg = "Request "+statusText+" successfully!";
                $rootScope.errorMsg = false;

                $rootScope.mainTabs.endorsements.buttons.requests.active = false;
                $rootScope.mainTabs.endorsements.buttons.list.active = true;
                $scope.openEndorsementDraftTab(endorserEndorsement);

              });

            //$scope.openReceivedTab();
          });
      };




      //init start and end date
      $scope.today = function() {
        $scope.startDate = new Date();
        $scope.endDate = new Date();
      };
      $scope.today();

      //clear date
      $scope.clear = function () {
        $scope.startDate = null;
      };
      $scope.dateFormat = 'yyyy/MM/dd';
      $scope.openStartDate = false;
      $scope.openEndDate = false;

      //open calendar
      $scope.openDate = function($event, date, index) {
        $event.preventDefault();
        $event.stopPropagation();

        if(date == 'openStartDate'){
          $scope.companies[index].openStartDate = true;
        }
        if(date == 'openEndDate'){
          $scope.companies[index].openEndDate = true;
        }
      };






      /**
       * request form tab change handler
       * @param isValid
       * @param targetTab
       * @param currentTab
       */
      $scope.nextTab = function (isValid, targetTab, currentTab) {
        $rootScope.successMsg = false;
        $rootScope.errorMsg = false;

        //if companies collection not empty set isValid true
        if(currentTab.name == 'where'){
          if($scope.companies.length > 0 && !isValid){
            isValid = true;
          }
        }
        //if project collection not empty set isValid true
        if(currentTab.name == 'what'){
          if($scope.projects.length > 0 && !isValid){
            isValid = true;
          }
        }
        //prevent send request to self
        if(currentTab.name == 'who'){
          if($scope.endorsement.email == $scope.user.email){
            isValid = false;
          }
        }
        if($rootScope.disableElement){
          isValid = true;
        }
        if (isValid) {
          //add last company to collection
          if(currentTab.name == 'where'){
            if($scope.company.companyName != '' && $scope.company.country != '' && $scope.company.city != ''){
              $scope.companies.push(angular.copy($scope.company));
              $scope.company = {
                companyName: '',
                country: '',
                city: ''
              };
            }
          }
          //add last project to collection
          if(currentTab.name == 'what'){
            if($scope.project.endorsementProjectCompanyName != '' && $scope.project.projectName != ''){
              $scope.projects.push(angular.copy($scope.project));
              $scope.project = {
                endorsementCompanyId: '',
                projectName: '',
                shortDescription: ''
              };
            }
          }
          currentTab.active = false;
          currentTab.disabled = true;

          targetTab.active = true;
          targetTab.disabled = false;

          $scope.requestStep = targetTab.requestStep;
          $scope.requestStepText = targetTab.name;

          //console.log($scope.companies);


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
       * add company to collection
       * @param isValid
       * @param company
       */
      $scope.addNewCompany = function (isValid, company) {
        if (isValid) {
          $scope.companies.push(angular.copy(company));
          $scope.company = {
            companyName: '',
            country: '',
            city: ''
          };
          //$scope.where.$setPristine();
        } else {
          $rootScope.errorMsg = true;
          $rootScope.errors = [
            {
              'error': "Complete the form!"
            }
          ];
        }
      };
      //remove company from collection
      $scope.removeCompany = function (index) {
        if($scope.companies[index].id){
          EndorsementCompany.deleteById({id: $scope.companies[index].id});
        }
        $scope.companies.splice(index, 1);
      };

      //add project to collection
      $scope.addNewProject = function (isValid, project) {
        if (isValid) {
          $scope.projects.push(angular.copy(project));
          $scope.project = {
            endorsementCompanyId: '',
            projectName: '',
            shortDescription: ''
          };
          //$scope.where.$setPristine();
        } else {
          $rootScope.errorMsg = true;
          $rootScope.errors = [
            {
              'error': "Complete the form!"
            }
          ];
        }
      };
      //remove project
      $scope.removeProject = function (index) {
        if($scope.projects[index].id){
          EndorsementProject.deleteById({id: $scope.projects[index].id});
        }
        $scope.projects.splice(index, 1);
      };


      $scope.animationsEnabled = false;
      //open up submmit request confirm modal
      $scope.openModal = function (size) {

        var modalInstance = $modal.open({
          animation: $scope.animationsEnabled,
          templateUrl: 'myModalContent.html',
          controller: 'ModalDashboardRequestCtrl',
          size: size,
          resolve: {
            items: function () {
              return {
                endorsement: $scope.endorsement,
                companies: $scope.companies,
                project: $scope.project,
                projects: $scope.projects,
                profileId: $rootScope.profileId
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

      $scope.submitEndorsement = function(){
        console.log($scope.endorsement);
        console.log($scope.companies);

      };

      /**
       * confirm modal
       * @param isValid
       */
      $scope.confirmEndorsement = function(isValid){
        if (isValid) {
          $scope.openModal('sm');
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
       * save draft request
       * @param isValid
       */
      $scope.saveDraft = function(isValid){
        $rootScope.successMsg = false;
        $rootScope.errorMsg = false;
        if(isValid){
          $scope.endorsement.isDraft = true;

          $rootScope.disableElement = true;

          var userProfileId = $rootScope.profileId;
          var endorsement = $scope.endorsement;
          if(endorsement.userProfileId == ''){
            endorsement.userProfileId = userProfileId;
          }
          if(endorsement.userDetailId == ''){
            endorsement.userProfileId = LoopBackAuth.currentUserId;
          }

          var companies = $scope.companies;

          var projects = $scope.projects;
          var endorsementId = 0;
          if(endorsement.id){
            endorsementId = endorsement.id;
          }
          EndorsementService.upsert(endorsementId, endorsement)
            .then(function (response) {
              //console.log(response);
              endorsementId = response.id;
              $scope.endorsement.id = endorsementId;


              angular.forEach(companies, function(companyItem, key) {
                var company = {
                  companyName: companyItem.companyName,
                  country: companyItem.country,
                  city: companyItem.city,
                  startDate: $filter('date')(companyItem.startDate, "yyyy-MM-dd"),
                  endDate: $filter('date')(companyItem.endDate, "yyyy-MM-dd"),
                  endorsementId: endorsementId
                };
                var companyId = 0;
                if(companyItem.id){
                  companyId = companyItem.id;
                }
                EndorsementService.upsertCompany(companyId, company)
                  .then(function (companyRes) {
                    angular.forEach(projects, function(project, projectKey) {
                      //console.log(project);
                      //console.log(company);
                      if(project.endorsementProjectCompanyName.companyName == company.companyName){
                        project.endorsementProjectCompanyName.id = companyRes.id;
                        var projectId = 0;
                        if(project.id){
                          projectId = project.id;
                        }
                        EndorsementService.upsertProject(projectId, {endorsementCompanyId: companyRes.id, projectName: project.projectName, shortDescription: project.shortDescription})
                          .then(function (projectRes) {
                            $rootScope.endorsementSent = true;
                            //console.log(projectRes);
                          },
                          function (projectError) {
                            //console.log(projectError);
                            $rootScope.successMsg = false;
                            $rootScope.errorMsg = true;
                            $rootScope.errors = (projectError.data.error.details) ? projectError.data.error.details.messages: projectError.data.error.message;
                          });
                      }
                      $rootScope.disableElement = false;
                      $rootScope.successMsg = "Request draft saved successfully!";
                      $rootScope.errorMsg = false;



                      Endorsement.find(
                        {

                          filter:{
                            limit: 30,
                            where:{
                              isDraft: false,
                              //userProfileId: userProfileId,
                              userDetailId: LoopBackAuth.currentUserId

                            },
                            include:[
                              'userDetail', 'userProfile', "endorserUser",
                              {
                                "endorsementCompanies":["endorsementProjects"]
                              }
                            ]
                          }
                        },
                        function(endorsements) {
                          $rootScope.endorsements = endorsements;
                        },
                        function(errorResponse) { console.log(errorResponse); }
                      );
                      Endorsement.find(
                        {
                          filter:{
                            where:{
                              isDraft: true,
                              //userProfileId: userProfileId,
                              userDetailId: LoopBackAuth.currentUserId

                            },
                            include:[
                              'userDetail', 'userProfile', "endorserUser",
                              {
                                "endorsementCompanies":["endorsementProjects"]
                              }
                            ]
                          }
                        },
                        function(endorsements) {
                          $rootScope.draftEndorsements = endorsements;
                        },
                        function(errorResponse) { console.log(errorResponse); }
                      );
                    });

                  },
                  function (companyError) {
                    //console.log(companyError);
                    $rootScope.successMsg = false;
                    $rootScope.errorMsg = true;
                    $rootScope.errors = companyError.data.error.details.messages;
                  });

              });
            },
            function (error) {
              //console.log(error);
              $rootScope.successMsg = false;
              $rootScope.errorMsg = true;
              $rootScope.errors = error.data.error.details.messages;
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

      /*Endorsements*/
      $rootScope.mainTabs.endorsements.buttons.list.buttons.sent.active = false;
      $rootScope.endorsementData = {endorsement:null, sentEndorsements:[], receivedEndorsements: [], draftEndorsements:[], endorserEndorsement:{questions:[]}};

      $rootScope.disableEndorsementElement = false;

      $scope.loadEndorsementData = function(profileId){

      };
      $scope.isQuestionEnable = true;

      /**
       * endorsement selection
       * @param endorsement
       */
      $scope.selectEndorsement = function(endorsement){
        if(endorsement == null){
          $rootScope.endorsementData.endorsement = null;
          $rootScope.endorsementData.endorserEndorsement.questions = null;
          return;
        }

        if($rootScope.endorsementData.endorserEndorsement == undefined){
          $rootScope.endorsementData = {endorsement: endorsement, endorserEndorsement:{questions: endorsement.questions }};
        } else {
          $rootScope.endorsementData.endorsement = endorsement;
          $rootScope.endorsementData.endorserEndorsement.questions = endorsement.questions;
        }


        if(!endorsement.isDraft){
          $rootScope.disableEndorsementElement = true;
        } else {
          $rootScope.disableEndorsementElement = false;
        }
        //console.log($rootScope.endorsementData.endorsement );
      };

      //fetch sent endorsements
      $scope.loadEndorsementSentData = function(currentInstance){
        if(currentInstance == undefined){
          currentInstance = null;
        }
        EndorsementDataService.loadEndorsementSentData(currentInstance, function(endorsements){
          //console.log(endorsements);
          $rootScope.endorsementData.sentEndorsements = endorsements;
          if($rootScope.endorsementData.sentEndorsements != null && $rootScope.endorsementData.sentEndorsements.length && currentInstance == null){
            $scope.selectEndorsement($rootScope.endorsementData.sentEndorsements[0]);
          }
        });


      };

      /**
       * Set question seen
       * @param id
       */
      $rootScope.questionSeenAt = function(id){
        var today = new Date();
        Question.find(
          {id: id},
          function(questions){
            if(questions.length){
              if(questions[0].seenAt== undefined || !questions[0].seenAt){
                Question.prototype$updateAttributes({id: questions[0].id}, {seenAt: $filter('date')(today, "yyyy-MM-dd")})
                  .$promise
                  .then(function(res){
                    //console.log(res);
                  });
              }
            }
          },
          function(errorResponse) { console.log(errorResponse); }
        );
      };

      //open sent endorsement tab
      $scope.openEndorsementSentTab = function(currentInstance){
        $rootScope.successMsg = false;
        $rootScope.errorMsg = false;
        if(currentInstance == undefined){
          currentInstance = null;
        }
        $rootScope.mainTabs.endorsets.active = false;
        $rootScope.mainTabs.endorsements.active = true;
        $rootScope.mainTabs.endorsements.buttons.list.active = true;
        $rootScope.mainTabs.endorsements.buttons.requests.active = false;
        $rootScope.mainTabs.endorsements.buttons.list.buttons.sent.active = true;
        $rootScope.mainTabs.endorsements.buttons.list.buttons.draft.active = false;
        $rootScope.mainTabs.endorsements.buttons.list.buttons.received.active = false;

        $rootScope.dashboardTab.endorsements = 'list';

        $rootScope.endorsementData.endorsement = null;

        $scope.loadEndorsementSentData(currentInstance);
      };

      //select sent endorsement event
      $scope.$on('openAndSelectSentEndorsementEvent', function(event, args) {
        $scope.openEndorsementSentTab(args.endorsement);

        if(args.endorsement != null){
          $scope.selectEndorsement(args.endorsement);
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
          if( $scope.notification.type == 9){
            $rootScope.questionSeenAt($scope.notification.modelId);

          }
        }
      });

      //fetch draft endorsement data
      $scope.loadEndorsementDraftData = function(selectEndorsement){
        EndorsementDataService.loadEndorsementDraftData();
        $rootScope.endorsementData.draftEndorsements = EndorsementDataService.getEndorsementData();

        if($rootScope.endorsementData.draftEndorsements != null && $rootScope.endorsementData.draftEndorsements.length){
          if(selectEndorsement){

          } else {
            $scope.selectEndorsement($rootScope.endorsementData.draftEndorsements[0]);
          }

        }
      };
      //open draft endorsements
      $scope.openEndorsementDraftTab = function(endorsement){
        $rootScope.successMsg = false;
        $rootScope.errorMsg = false;
        $rootScope.mainTabs.endorsets.active = false;
        $rootScope.mainTabs.endorsements.active = true;
        $rootScope.mainTabs.endorsements.buttons.list.active = true;
        $rootScope.mainTabs.endorsements.buttons.requests.active = false;
        $rootScope.mainTabs.endorsements.buttons.list.buttons.sent.active = false;
        $rootScope.mainTabs.endorsements.buttons.list.buttons.draft.active = true;
        $rootScope.mainTabs.endorsements.buttons.list.buttons.received.active = false;
        $rootScope.endorsementData.endorsement = null;
        $scope.loadEndorsementDraftData(endorsement);

      };

      //fetch received endorsements data
      $scope.loadEndorsementReceivedData = function(currentInstance, profileIds){
        if(profileIds == undefined){
          profileIds = [];
        }
        EndorsementDataService.loadEndorsementReceivedData($rootScope.profileId, currentInstance, profileIds, function(endorsements){
          $rootScope.endorsementData.receivedEndorsements = endorsements;

          if($rootScope.endorsementData.receivedEndorsements != null && $rootScope.endorsementData.receivedEndorsements.length && currentInstance == null){
            $scope.selectEndorsement($rootScope.endorsementData.receivedEndorsements[0]);
          }
        });

        if(currentInstance){
          $scope.selectEndorsement(currentInstance);
        }


      };
      //open received endorsement tab
      $scope.openEndorsementReceivedTab = function(currentInstance){
        $rootScope.successMsg = false;
        $rootScope.errorMsg = false;

        if(currentInstance == undefined){
          currentInstance = null;
        }
        $rootScope.mainTabs.endorsets.active = false;
        $rootScope.mainTabs.endorsements.active = true;
        $rootScope.mainTabs.endorsements.buttons.list.active = true;
        $rootScope.mainTabs.endorsements.buttons.requests.active = false;
        $rootScope.mainTabs.endorsements.buttons.list.buttons.sent.active = false;
        $rootScope.mainTabs.endorsements.buttons.list.buttons.draft.active = false;
        $rootScope.mainTabs.endorsements.buttons.list.buttons.received.active = true;

        $rootScope.dashboardTab.endorsements = "list";

        $rootScope.endorsementData.endorsement = null;

        $scope.getProfiles(currentInstance);


      };

      //load profiles
      $scope.getProfiles = function(currentInstance){
        UserProfile.find(
          {

            filter:{
              limit: 30,
              where:{
                userDetailId: LoopBackAuth.currentUserId
              },
              order: 'created DESC'
            }
          },
          function(profiles) {

            if(profiles.length) {
              //$scope.profileFilter = profiles[0];
              $rootScope.profiles = profiles;

              var profileIds = [];
              angular.forEach(profiles, function(item){
                profileIds.push(item.id);
              });

              $scope.loadEndorsementReceivedData(currentInstance, profileIds);
            }
          },
          function(errorResponse) { console.log(errorResponse); }
        );
      };

      //profile filter change
      $scope.profileFilterChange = function(){
        //console.log($scope.profileFilter);

        if($scope.profileFilter == null){
          $scope.getProfiles(null);
        } else {
          var profileIds = [];
          profileIds.push($scope.profileFilter.id);
          $scope.loadEndorsementReceivedData(null, profileIds);
        }

      };

      //select received endorsement event
      $scope.$on('openAndSelectReceivedEndorsementEvent', function(event, args) {
        $scope.openEndorsementReceivedTab(args.endorsement);

        if(args.endorsement != null){
          $scope.selectEndorsement(args.endorsement);
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

      //save draft endorsement
      $scope.saveEndorsement = function(isValid, isDraft){
        $rootScope.successMsg = false;
        $rootScope.errorMsg = false;
        //console.log($rootScope.endorsementData.endorsement);
        if(isValid){
          EndorsementService.updateEndorserEndorsement(
            $rootScope.endorsementData.endorsement.id,
            {
              leadQuote: $rootScope.endorsementData.endorsement.leadQuote,
              skillScores: $rootScope.endorsementData.endorsement.skillScores,
              projectScores: $rootScope.endorsementData.endorsement.projectScores,
              skillComments: $rootScope.endorsementData.endorsement.skillComments,
              isDraft: isDraft
            }
          )
            .then(function(res){
              //console.log(res);
              if(isDraft){
                $rootScope.successMsg = "Endorsement draft saved successfully!";
              } else {
                $rootScope.successMsg = "Endorsement submitted successfully!";
                $rootScope.disableEndorsementElement = true;
                $scope.loadEndorsementDraftData(res);
              }

              $rootScope.errorMsg = false;
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
        if(isValid){
          EndorsementService.upsertQuestion(questionId,
            {
              comment: $scope.question.comment,
              type: 'text',
              endorserId: LoopBackAuth.currentUserId,
              endorserEndorsementId: $rootScope.endorsementData.endorsement.id,
              endorsementId: $rootScope.endorsementData.endorsement.endorsementId,
              replyId: 0,
              hrId: 0,
              isDraft: isDraft
            })
            .then(function(res){
              //console.log(res);
              $rootScope.successMsg = "Question sent successfully!";
              $rootScope.errorMsg = false;
              $scope.loadEndorsementSentData();
              $scope.question.comment = '';
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



      $scope.reply = {comment:[]};
      $scope.showReplyForm = [];
      //show reply
      $scope.showReply = function(id, reply){
        $rootScope.questionSeenAt(id);
        $scope.showReplyForm[id] = {active: true};
        if(reply){
          $scope.reply.comment[reply.replyId] = reply.comment ;
          //console.log($scope.reply.comment[id]);
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
          $scope.showReplyForm[editId] = {active: false};
          EndorsementService.upsertQuestion(editId,
            {
              comment: $scope.reply.comment[id],
              type: 'text',
              endorserId: LoopBackAuth.currentUserId,
              endorserEndorsementId: $rootScope.endorsementData.endorsement.id,
              endorsementId: $rootScope.endorsementData.endorsement.endorsementId,
              replyId: id,
              hrId: 0,
              isDraft: isDraft
            })
            .then(function(res){
              //console.log(res);
              $rootScope.successMsg = "Reply sent successfully!";
              $rootScope.errorMsg = false;
              $scope.loadEndorsementSentData();
              $scope.showReplyForm[id] = {active: false};
            });
        }else {
          $rootScope.errorMsg = true;
          $rootScope.errors = [
            {
              'error': "Complete the form!"
            }
          ];
        }
      };

      //any comment
      $scope.showSkillCommentsForm = [];
      $scope.anyComment = function(skill){
        $scope.showSkillCommentsForm[skill] = {active: true};
      };


      //show add to endorset form
      $scope.showAddToEndorsetForm = function(endorsement){
        UserProfile.find(
          {
            filter:{
              limit: 30,
              where:{
                userDetailId: LoopBackAuth.currentUserId
              },
              order: 'created DESC'
            }
          },
          function(profiles) {
            if(profiles.length) {
              $scope.addFormProfiles = profiles;
            }
          },
          function(errorResponse) { console.log(errorResponse); }
        );

        $scope.isAddEndorsement = true;
        $scope.addEndorsementData = endorsement;
        $rootScope.disableElement = false;
      };

      //add to endorset
      $scope.addToEndorset = function(isValid){
        $rootScope.successMsg = false;
        $rootScope.errorMsg = false;
        //console.log($scope.addEndorsementData);
        var endorsement = $scope.addEndorsementData;
        if(isValid){
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
          avgEndorsetScore = $filter('number')(avgEndorsetScore, 2);
          var totalScoreItem = (endorsement.projectScores) ? endorsement.skillScores.length : 0 + (endorsement.projectScores) ? endorsement.projectScores.length : 0;
          if(totalScoreItem){
            avgEndorsetScore = endorsetScore/totalScoreItem;
          }

          //EndorsementService.upsertEndorserEndorsement(endorsement.id,{userProfileId: endorsement.profile.id}).then(function(res){console(res);});
          //EndorsementService.upsert(endorsement.endorsementId,{userProfileId: endorsement.profile.id}).then(function(res){console(res);});

          EndorsementService.upsertEndorset(0, {
            endorsetScore: endorsetScore,
            avgEndorsetScore: avgEndorsetScore,
            leadQuote: endorsement.leadQuote,
            userDetailId: LoopBackAuth.currentUserId,
            endorsementId: endorsement.endorsementId,
            endorserEndorsementId: endorsement.id,
            //userProfileId: endorsement.userProfileId
            userProfileId: endorsement.profile.id
          }).then(function(res){
            //console.log(res);
            $rootScope.successMsg = "Endorsement has been added to endorset successfully!";
            $rootScope.errorMsg = false;
            //$scope.loadEndorsementReceivedData();
            $scope.isAddEndorsement = true;
            $scope.addEndorsementData = {};
            $scope.getProfiles(null);
          });
        } else {
          $rootScope.successMsg = false;
          $rootScope.errorMsg = true;
          $rootScope.errors = [
            {
              'error': "Select a profile!"
            }
          ];
        }

      };

      //remove endorsement from endorset
      $scope.removeFromEndorset = function(endorsement){
        $rootScope.successMsg = false;
        $rootScope.errorMsg = false;
        EndorsementService.removeEndorsetById(endorsement.endorsets.id).then(function(res){
          $rootScope.successMsg = "Endorsement has been removed from endorset successfully!";
          $rootScope.errorMsg = false;
          //$scope.loadEndorsementReceivedData();
          $scope.getProfiles(null);
        });
      };


      //change tabs
      $scope.changeEndorsementsTab = function(){
        $rootScope.successMsg = false;
        $rootScope.errorMsg = false;
        if($rootScope.dashboardTab.endorsements == 'list'){
          $scope.openEndorsementSentTab();
        }
        if($rootScope.dashboardTab.endorsements == 'requests'){
          $scope.openSentTab(null);
        }
      };

      $rootScope.notificationData = notificationService.notificationData;

      if($rootScope.notificationData.eventName != '' && !angular.equals($rootScope.notificationData.eventName, 'openAndSelectEndorsetRequestEvent')){
        //console.log($rootScope.notificationData);
        $scope.$broadcast($rootScope.notificationData.eventName, $rootScope.notificationData.selectedObject);
        notificationService.resetData;
      }
    }])

  //dashboard request modal instance controller
  .controller('ModalDashboardRequestCtrl', function ($rootScope, $scope, $state, $modalInstance, items, $filter, LoopBackAuth, UserDetail, Endorsement, EndorsementCompany, EndorsementProject, EndorsementService, UserProfile) {
    $scope.user = UserDetail.getCurrent();
    $rootScope.successMsg = false;
    $rootScope.errorMsg = false;
    $rootScope.errors = [];
    items.endorsement.isDraft = false;

    $rootScope.isCompanyAdmin = false;
    $rootScope.isCompanyUser = false;


    //submit modal if ok
    $scope.ok = function () {
      $rootScope.successMsg = false;
      $rootScope.errorMsg = false;
      $rootScope.disableElement = true;
      //console.log(items);
      var userProfileId = items.profileId;
      var endorsement = items.endorsement;
      if(endorsement.userProfileId == ''){
        endorsement.userProfileId = userProfileId;
      }
      if(endorsement.userDetailId == ''){
        endorsement.userProfileId = LoopBackAuth.currentUserId;
      }

      var companies = items.companies;

      var projects = items.projects;
      var endorsementId = 0;
      if(endorsement.id){
        endorsementId = endorsement.id;
      }
      EndorsementService.upsert(endorsementId, endorsement)
        .then(function (response) {
          //console.log(response);
          endorsementId = response.id;

          Endorsement.find(
            {
              filter:{
                where:{
                  isDraft: false,
                  //userProfileId: userProfileId,
                  userDetailId: LoopBackAuth.currentUserId

                },
                limit: 30,
                include:[
                  'userDetail', 'userProfile', "endorserUser",
                  {
                    "endorsementCompanies":["endorsementProjects"]
                  }
                ]
              }
            },
            function(endorsements) {

              $rootScope.endorsements = endorsements;
            },
            function(errorResponse) { console.log(errorResponse); }
          );
          Endorsement.find(
            {
              filter:{
                where:{
                  isDraft: true,
                  //userProfileId: userProfileId,
                  userDetailId: LoopBackAuth.currentUserId

                },
                limit: 30,
                include:[
                  'userDetail', 'userProfile', "endorserUser",
                  {
                    "endorsementCompanies":["endorsementProjects"]
                  }
                ]
              }
            },
            function(endorsements) {

              $rootScope.draftEndorsements = endorsements;
            },
            function(errorResponse) { console.log(errorResponse); }
          );
          angular.forEach(companies, function(companyItem, key) {
            var company = {
              companyName: companyItem.companyName,
              country: companyItem.country,
              city: companyItem.city,
              startDate: $filter('date')(companyItem.startDate, "yyyy-MM-dd"),
              endDate: $filter('date')(companyItem.endDate, "yyyy-MM-dd"),
              endorsementId: endorsementId
            };
            var companyId = 0;
            if(companyItem.id){
              companyId = companyItem.id;
            }
            EndorsementService.upsertCompany(companyId, company)
              .then(function (companyRes) {
                angular.forEach(projects, function(project, projectKey) {
                  if(project.endorsementProjectCompanyName.companyName == company.companyName){
                    project.endorsementProjectCompanyName.id = companyRes.id;

                    var projectId = 0;
                    if(project.id){
                      projectId = project.id;
                    }

                    EndorsementService.upsertProject(projectId, {endorsementCompanyId: companyRes.id, projectName: project.projectName, shortDescription: project.shortDescription})
                      .then(function (projectRes) {
                        $rootScope.endorsementSent = true;
                        //console.log(projectRes);
                      },
                      function (projectError) {
                        //console.log(projectError);
                        $rootScope.successMsg = false;
                        $rootScope.errorMsg = true;
                        $rootScope.errors = projectError.data.error.details.messages;
                      });
                  }
                  $rootScope.successMsg = "Request saved successfully!";
                  $rootScope.errorMsg = false;
                });

              },
              function (companyError) {
                //console.log(companyError);
                $rootScope.successMsg = false;
                $rootScope.errorMsg = true;
                $rootScope.errors = companyError.data.error.details.messages;
              });

          });
        },
        function (error) {
          //console.log(error);
          $rootScope.successMsg = false;
          $rootScope.errorMsg = true;
          $rootScope.errors = error.data.error.details.messages;
        });

      $modalInstance.close();
    };

    //cancel request
    $scope.cancel = function () {
      //console.log(items);
      $modalInstance.dismiss('cancel');
    };
  });