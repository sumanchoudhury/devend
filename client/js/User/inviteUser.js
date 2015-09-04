angular
  .module('app')
/**
 * Invite User controller
 */
  .controller('InviteUserController', ['$rootScope', '$scope', '$state', '$stateParams', 'LoopBackAuth', 'UserDetail', '$modal', '$log',
    function($rootScope, $scope, $state, $stateParams, LoopBackAuth, UserDetail, $modal, $log) {
      $scope.user = LoopBackAuth.currentUserData;
      $rootScope.successMsg = false;
      $rootScope.errorMsg = false;
      $rootScope.errors = [];

      $scope.animationsEnabled = false;

      /**
       * open invite user modal
       * @param size
       */
      $scope.openInviteUserModal = function (size) {

        var modalInstance = $modal.open({
          animation: $scope.animationsEnabled,
          templateUrl: 'InviteUserModalContent.html',
          controller: 'InviteUserModalInstanceCtrl',
          size: size,
          resolve: {
            items: function () {
              return {
                user: $scope.user
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

      $scope.toggleAnimation = function () {
        $scope.animationsEnabled = !$scope.animationsEnabled;
      };

    }])
/**
 * Invite User model controller
 */
  .controller('InviteUserModalInstanceCtrl', function ($rootScope, $scope, $state, $modalInstance, items, $filter, LoopBackAuth, UserDetail, $location, InviteUser, $http) {
    $rootScope.successMsg = false;
    $rootScope.errorMsg = false;
    $rootScope.errors = [];

    $scope.companyUser = {};
    $scope.disableElement = false;

    $scope.invites = [];
    $scope.users = [];

    /**
     * load invites
     */
    $scope.loadInvites = function(){
      InviteUser.find(
        {
          filter:{
            limit: 30,
            where:{
              createdBy: LoopBackAuth.currentUserId
            },
            order: 'created DESC',
            include:[
              'adminUser', 'userDetail'
            ]
          }
        },
        function(invites) {
          $scope.invites = invites;

        },
        function(errorResponse) { console.log(errorResponse); }
      );
    };

    $scope.loadInvites();

    /**
     * get users
     * @param viewValue
     */
    $scope.getUsers = function(viewValue){
      $http.get('/api/userDetails', {
        params: {
          filter: {
            "where": {
              //firstName: {like: '%'+viewValue+'%'},
              //"userTypeId":"5589c00cc05dc30300447176"
              "id":{neq: LoopBackAuth.currentUserId}
            },
            "order":"firstName ASC",
            include:[
              'company',
              'invitations'
            ]
          }
        }
      })

        .then(function(users){
          angular.forEach(users.data, function(user, key){
            user.displayName = user.firstName + ' ' + user.lastName;
            $scope.users.push(user);
          });
          return $scope.users;
        });

    };

    $scope.getUsers('');

    /**
     * set user
     * @param user
     */
    $scope.setUserData = function(item, model, label){
      /*console.log(item);
       console.log(model);
       console.log(label);*/
      $scope.companyUser.firstName = item.firstName;
      $scope.companyUser.lastName = item.lastName;
      $scope.companyUser.email = item.email;
      $scope.companyUser.fullImage = item.fullImage;
    };



    //new invitation
    $scope.resetInvitation = function(){
      $scope.companyUser = {
        firstName: '',
        lastName: '',
        email: ''
      };
      $scope.disableElement = false;
    };

    /**
     * send invite
     * @param form
     */
    $scope.sendInviteToEmail = function(form){
      $rootScope.successMsg = false;
      $rootScope.errorMsg = false;
      if(form.$valid){
        $scope.companyUser.createdBy = LoopBackAuth.currentUserId;

        InviteUser.count(
          {
            where:{
              //isViewed: {neq: true},
              createdBy: LoopBackAuth.currentUserId

            }
          },
          function(invite,  httpHeader) {
            if(invite.count < 4){
              InviteUser.count(
                {
                  where:{
                    email: $scope.companyUser.email,
                    createdBy: LoopBackAuth.currentUserId

                  }
                },
                function(existingUser,  httpHeader) {
                  if(existingUser.count == 0 || angular.equals(existingUser.count, "0")){
                    InviteUser.create(
                      {
                        createdBy: LoopBackAuth.currentUserId,
                        firstName: $scope.companyUser.firstName,
                        lastName: $scope.companyUser.lastName,
                        email: $scope.companyUser.email
                      }
                    )
                      .$promise
                      .then(function(res){
                        //console.log(res);
                        $rootScope.errorMsg = false;
                        $rootScope.successMsg = "Invitation sent successfully!";
                        $scope.disableElement = true;
                        form.$setPristine();
                        $scope.resetInvitation();
                        $modalInstance.close('cancel');
                      });
                  } else {
                    $rootScope.errorMsg = true;
                    $rootScope.errors = [
                      {
                        'error': "This professional is already your team member."
                      }
                    ];
                  }
                },
                function(errorResponse) { console.log(errorResponse); }
              );

            } else {
              $rootScope.errorMsg = true;
              $rootScope.errors = [
                {
                  'error': "You have invited 4 members!"
                }
              ];
            }
          },
          function(errorResponse) { console.log(errorResponse); }
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