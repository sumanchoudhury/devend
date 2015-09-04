angular
  .module('app')
/**
 * Endorsement Request controller
 */
  .controller('EndorsementRequestController', ['$scope', '$rootScope', '$state', '$stateParams', '$cookies', 'LoopBackAuth', 'UserDetail', 'Endorsement', 'EndorsementCompany', 'EndorsementService',
    function($scope, $rootScope, $state, $stateParams, $cookies, LoopBackAuth, UserDetail, Endorsement, EndorsementCompany, EndorsementService) {
      $scope.successMsg = false;
      $scope.errorMsg = false;
      $scope.errors = [];

      $scope.user = LoopBackAuth.currentUserData;

      $scope.id = $stateParams.id;


      //set endorsements data
      $scope.endorsements = [];
      $scope.endorsement = {userDetailId: LoopBackAuth.currentUserId};
      //endorsement sent boolean
      $scope.endorsementSent = false;
      //disable element boolean
      $scope.disableElement = true;
      $scope.isNewRequestEnable = false;
      $scope.requestStep = 1;
      $scope.requestStepText = 'Who';

      $scope.mainTabs = {
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

      $scope.receivedEndorsements = [];
      $scope.receivedEndorsement = {};

      $scope.isEndorser = false;
      $scope.isProfessional = false;

      if(LoopBackAuth.currentUserData != null && angular.equals(LoopBackAuth.currentUserData.userTypeId, '5589c00cc05dc30300447176')){
        //sent requests
        Endorsement.find(
          {
            filter:{
              where:{
                id: $scope.id
              },
              include:['userDetail', 'userProfile', {'endorsementCompanies':['endorsementProjects']}]
            }
          },
          function(endorsements) {
            angular.forEach(endorsements, function(endorsement, key){
              if(endorsement.endorserAcceptStatus == 1){
                endorsements[key].endorserAcceptStatusText = 'accepted';
              } else if(endorsement.endorserAcceptStatus == 2){
                endorsements[key].endorserAcceptStatusText = 'declined';
              } else {
                endorsements[key].endorserAcceptStatusText = 'pending';
              }
              if(endorsement.endorserSeenAt){
                endorsements[key].endorserSeenAt = moment(endorsement.endorserSeenAt).toDate();
              }


            });

            console.log(endorsements);
            if(endorsements.length){
              $scope.profileName = endorsements[0].userProfile.profileName;
              $scope.profileId = endorsements[0].userProfile.id;

              if(angular.equals(endorsements[0].email, LoopBackAuth.currentUserData.email)){
                $scope.isEndorser = true;
                $scope.isProfessional = false;
                $scope.receivedEndorsements = endorsements;
                $scope.receivedEndorsement = endorsements[0];
              } else {
                $scope.isEndorser = false;
                $scope.isProfessional = true;
                $scope.endorsements = endorsements;
                $scope.selectRequest(endorsements[0], true);
              }

            }

          },
          function(errorResponse) { console.log(errorResponse); }
        );



      }
      else if(LoopBackAuth.currentUserData != null && angular.equals(LoopBackAuth.currentUserData.userTypeId, '5589c01bc05dc30300447177')){
        $state.go('dashboard');

      } else {
        $state.go('home');
      }

      /**
       * select sent/draft request handler
       * @param endorsement
       * @param isDisableElement
       */
      $scope.selectRequest = function(endorsement, isDisableElement){
        $scope.disableElement = isDisableElement;

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

        $scope.mainTabs.endorsets.active = false;
        $scope.mainTabs.endorsements.active = true;
        $scope.mainTabs.endorsements.buttons.list.active = false;
        $scope.mainTabs.endorsements.buttons.requests.active = true;
        $scope.mainTabs.endorsements.buttons.requests.buttons.sent.active = true;
        $scope.mainTabs.endorsements.buttons.requests.buttons.draft.active = false;
        $scope.mainTabs.endorsements.buttons.requests.buttons.received.active = false;

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
       * request form tab change handler
       * @param isValid
       * @param targetTab
       * @param currentTab
       */
      $scope.nextTab = function (isValid, targetTab, currentTab) {
        $scope.successMsg = false;
        $scope.errorMsg = false;

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
        if($scope.disableElement){
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
          $scope.errorMsg = true;
          $scope.errors = [
            {
              'error': "Complete the form!"
            }
          ];
        }

      };

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
                console.log(endorserEndorsement);

                var statusText = '';
                if(status == 1){
                  statusText = 'accepted';
                } else {
                  statusText = 'declined';
                }
                $scope.receivedEndorsement.endorserAcceptStatus = status;
                $scope.receivedEndorsement.endorserAcceptStatusText = statusText;
                $scope.successMsg = "Request "+statusText+" successfully!";
                $scope.errorMsg = false;


              });
          });
      };


    }]);