angular
  .module('app')
  //endorsement controller
  .controller('EndorsementController', ['$rootScope', '$scope', '$window', '$state', '$stateParams', '$modal', '$log', 'LoopBackAuth', 'UserDetail', 'UserProfile',
    function ($rootScope, $scope, $window, $state, $stateParams, $modal, $log,  LoopBackAuth, UserDetail, UserProfile) {
      $scope.user = LoopBackAuth.currentUserData;
      $rootScope.successMsg = false;
      $rootScope.errorMsg = false;
      $rootScope.errors = [];
      $rootScope.endorsementSent = false;

      $scope.state = $state.current;
      $scope.params = $stateParams;

      $scope.profileId = $stateParams.profileId;

      //request form tabs
      $scope.tabs = {
        who: {
          name: "who",
          active: true,
          disabled: false
        },
        where: {
          name: "where",
          active: false,
          disabled: true
        },
        when: {
          name: "when",
          active: false,
          disabled: true
        },
        what: {
          name: "what",
          active: false,
          disabled: true
        },
        which: {
          name: "which",
          active: false,
          disabled: true
        },
        why: {
          name: "why",
          active: false,
          disabled: true
        }
      };

      //default endorsement object
      $scope.endorsement = {userProfileId: $scope.profileId, userDetailId: LoopBackAuth.currentUserId};
      //company object
      $scope.company = {
        companyName: '',
        country: '',
        city: '',
        openStartDate: false,
        openEndDate: false
      };
      //company collection
      $scope.companies = [];
      //project collection
      $scope.projects = [];
      //project object
      $scope.project = {
        endorsementCompanyId: '',
        projectName: '',
        shortDescription: ''
      };

      //init date
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



      //add project
      $scope.projects.push(angular.copy($scope.project));
      $scope.addNewProject = function () {
        $scope.projects.push({endorsementCompanyId: '', projectName: '', shortDescription: ''});
      };

      //change request form tab
      $scope.nextTab = function (isValid, targetTab, currentTab) {
        $rootScope.successMsg = false;
        $rootScope.errorMsg = false;
        if(currentTab.name == 'where'){
          if($scope.companies.length > 0 && !isValid){
            isValid = true;
          }
        }
        if (isValid) {
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
          currentTab.active = false;
          currentTab.disabled = true;

          targetTab.active = true;
          targetTab.disabled = false;


        } else {
          $rootScope.errorMsg = true;
          $rootScope.errors = [
            {
              'error': "Complete the form!"
            }
          ];
        }

      };

      //add new company
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
      //remove company
      $scope.removeCompany = function (index) {
        $scope.companies.splice(index, 1);
      };

      $scope.animationsEnabled = false;

      //open request submit confirm modal
      $scope.openModal = function (size) {

        var modalInstance = $modal.open({
          animation: $scope.animationsEnabled,
          templateUrl: 'myModalContent.html',
          controller: 'ModalInstanceCtrl',
          size: size,
          resolve: {
            items: function () {
              return {
                endorsement: $scope.endorsement,
                companies: $scope.companies,
                project: $scope.project,
                projects: $scope.projects,
                profileId: $scope.profileId
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

      //submit endorsement
      $scope.submitEndorsement = function(){
        //console.log($scope.endorsement);
        //console.log($scope.companies);

      };

      //confirm endorsement request submit
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

    }])

  //submit request confirm modal instance controller
  .controller('ModalInstanceCtrl', function ($rootScope, $scope, $state, $modalInstance, items, $filter, LoopBackAuth, UserDetail, Endorsement, EndorsementCompany, EndorsementProject) {
    $scope.user = LoopBackAuth.currentUserData;
    $rootScope.successMsg = false;
    $rootScope.errorMsg = false;
    $rootScope.errors = [];


    //submit request if click on ok
    $scope.ok = function () {
      $rootScope.successMsg = false;
      $rootScope.errorMsg = false;
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
      Endorsement.create(endorsement)
        .$promise
        .then(function (response) {
          //console.log(response);
          endorsementId = response.id;
          angular.forEach(companies, function(companyItem, key) {
            var company = {
              companyName: companyItem.companyName,
              country: companyItem.country,
              city: companyItem.city,
              startDate: $filter('date')(companyItem.startDate, "yyyy-MM-dd"),
              endDate: $filter('date')(companyItem.endDate, "yyyy-MM-dd"),
              endorsementId: endorsementId
            };
            EndorsementCompany.create(company)
              .$promise
              .then(function (companyRes) {
                angular.forEach(projects, function(project, projectKey) {
                  if(project.endorsementCompanyId.companyName == company.companyName){
                    project.endorsementCompanyId.id = companyRes.id;
                    EndorsementProject.create({endorsementCompanyId: companyRes.id, projectName: project.projectName, shortDescription: project.shortDescription})
                      .$promise
                      .then(function (projectRes) {
                        $rootScope.endorsementSent = true;
                        //console.log(projectRes);
                      },
                      function (projectError) {
                        console.log(projectError);
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
                console.log(companyError);
                $rootScope.successMsg = false;
                $rootScope.errorMsg = true;
                $rootScope.errors = companyError.data.error.details.messages;
              });

          });
        },
        function (error) {
          console.log(error);
          $rootScope.successMsg = false;
          $rootScope.errorMsg = true;
          $rootScope.errors = error.data.error.details.messages;
        });

      $modalInstance.close();
    };

    //cancel modal
    $scope.cancel = function () {
      //console.log(items);
      $modalInstance.dismiss('cancel');
    };
  });