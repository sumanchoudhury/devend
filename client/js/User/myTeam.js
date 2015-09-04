angular
  .module('app')
/**
 * My Team Controller
 */
  .controller('MyTeamController', ['$rootScope', '$scope', '$state', '$stateParams', 'LoopBackAuth', 'UserDetail', '$location', 'InviteUser', '$modal', '$log',
    function($rootScope, $scope, $state, $stateParams, LoopBackAuth, UserDetail, $location, InviteUser, $modal, $log) {

      $scope.animationsEnabled = false;
      /**
       * Open team modal
       * @param size
       */
      $scope.openMyTeamModal = function(size){
        var modalInstance = $modal.open({
          animation: $scope.animationsEnabled,
          templateUrl: 'myTeamModalContent.html',
          controller: 'TeamModalInstanceCtrl',
          size: size,
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
      };
    }])

/**
 * Team model controller
 */
  .controller('TeamModalInstanceCtrl', function ($rootScope, $scope, $state, $stateParams, $modalInstance, LoopBackAuth, UserDetail, $location, InviteUser, $modal, $log) {
    $rootScope.successMsg = false;
    $rootScope.errorMsg = false;
    $rootScope.errors = [];
    $scope.teamDataLoaded = false;

    $scope.members = [];


    $scope.roleTypes = [{id: 0, name: 'Select Role'}, {id: 1, name: 'Admin'}, {id: 2, name: 'Team Member'}];
    /**
     * load members
     */
    $scope.loadMembers = function(){
      InviteUser.find(
        {
          filter:{
            limit: 30,
            where:{
              createdBy: LoopBackAuth.currentUserId,
              status: 1
            },
            order: 'created DESC',
            include:[
              'adminUser', {'userDetail':["company"]}
            ]
          }
        },
        function(members) {
          $scope.teamDataLoaded = true;
          $scope.members = members;
          console.log($scope.members);

        },
        function(errorResponse) { console.log(errorResponse); }
      );
    };

    $scope.loadMembers();

    /**
     * remove member
     * @param member
     */
    $scope.removeMember = function(member) {
      $rootScope.successMsg = false;
      $rootScope.errorMsg = false;
      InviteUser.deleteById({id: member.id})
        .$promise
        .then(function (response) {
          $rootScope.successMsg = "Member removed successfully!";
          $rootScope.errorMsg = false;
          $scope.loadMembers();

        },
        function (error) {
          console.log(JSON.stringify(error));
        });

    };

    /**
     * change role type
     * @param roleType
     */
    $scope.changeRoleType = function(member, roleType){
      $rootScope.successMsg = false;
      $rootScope.errorMsg = false;
      InviteUser
        .prototype$updateAttributes({id: member.id},{roleType: roleType})
        .$promise
        .then(function(response) {
          //$scope.loadMembers();
          $rootScope.successMsg = "Role changed successfully!";
          $rootScope.errorMsg = false;
        });
    };

    $scope.animationsEnabled = false;
    /**
     * Open assign endorsets to team member model
     * @param member
     */
    $scope.openAssignEndorset = function(member, size){
      var modalInstance = $modal.open({
        animation: $scope.animationsEnabled,
        templateUrl: 'AssignEndorsetUserModalContent.html',
        controller: 'AssignEndorsetUserModalInstanceCtrl',
        size: size,
        resolve: {
          items: function () {
            return {
              member: member
            };
          }
        }
      });

      modalInstance.result.then(function (selectedItem) {
        console.log(selectedItem);
      }, function () {
        $log.info('Modal dismissed at: ' + new Date());
      });
    };


    $scope.ok = function () {
      $modalInstance.close('cancel');
    };

    //close modal
    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  })

/**
 * AssignEndorsetUser model controller
 */
  .controller('AssignEndorsetUserModalInstanceCtrl', function ($rootScope, $scope, $state, $modalInstance, items, $filter, LoopBackAuth, UserDetail, $location, InviteUser, $http, EndorsetSent, AssignEndorsets) {
    $rootScope.successMsg = false;
    $rootScope.errorMsg = false;
    $rootScope.errors = [];

    $scope.member = items.member;

    $scope.assign = {};
    $scope.disableElement = false;

    $scope.endorsets = [];
    $scope.users = [];

    /**
     * load endorsets
     */
    $scope.loadEndorsets = function(){
      EndorsetSent.find(
        {

          filter:{
            where:{
              companyUserId: LoopBackAuth.currentUserId
            },
            limit: 30,
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
          //console.log(endorsets);
          $scope.endorsets = endorsets;
        },
        function(errorResponse) { console.log(errorResponse); }
      );
    };

    $scope.loadEndorsets();

    /**
     * assign endorset
     * @param form
     */
    $scope.assignUserToEndorset = function(form){
      $rootScope.successMsg = false;
      $rootScope.errorMsg = false;
      if(form.$valid){
        $scope.assign.createdBy = LoopBackAuth.currentUserId;


        AssignEndorsets.saveAssignments(
          {
            data :{
              createdBy: LoopBackAuth.currentUserId,
              userDetailId: $scope.member.userDetailId,
              inviteUserId: $scope.member.id,
              endorsets: $scope.assign.endorsets
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
            'error': "Complete the form!"
          }
        ];
      }

    };


    $scope.ok = function () {
      $modalInstance.close('cancel');
    };

    //close modal
    $scope.cancel = function () {
      //console.log(items);
      $modalInstance.dismiss('cancel');
    };
  });