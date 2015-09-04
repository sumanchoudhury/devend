angular
  .module('app')
/**
 * Login controller
 */
  .controller('LoginController', ['$scope', '$rootScope', 'LoginService', '$state', '$cookies', 'auth', 'UserProfile', 'PubSub', 'notificationService', 'InviteUser',
    function($scope, $rootScope, LoginService, $state, $cookies, auth, UserProfile, PubSub, notificationService, InviteUser) {
      $scope.user = {
        username: 'jane',
        password: '123456',
        rememberMe: false
      };

      $rootScope.acceptedInvitationCount  = 0;

      $scope.paginate = {skip: 0, limit: 10, disabled: false};
      $scope.loadNotifications = function(userId){
        //console.log(userId);
        notificationService.countNotification(
          userId,
          function(count){
            //console.log(count);
            $rootScope.notificationCount = count.count;
          }
        );
        notificationService.loadNotifications(
          userId,
          $scope.paginate,
          function(notifications){
            //console.log(notifications);
            $rootScope.notifications = notifications;
          }
        );
      };

      PubSub.getData(
        'common',
        function(data){
          //console.log(data);
          $scope.loadNotifications(0);
        }
      );

      $scope.login = function() {
        //reset selected profile info
        $cookies.put('profileId', false);
        $cookies.put('profileName', false);
        $rootScope.profileId = false;
        $rootScope.profileName = false;
        //calling login function
        LoginService.login($scope.user.username, $scope.user.password, $scope.user.rememberMe)
          .then(function(response) {
            //console.log(response);



            $scope.loadNotifications(response.user.id);

            PubSub.getData(
              'common',
              function(data){
                console.log(data);
                $scope.loadNotifications(response.user.id);
              }
            );

            //save login auth token
            auth.saveToken(response.id);
            $scope.handleRequest(response);

            if(angular.equals(response.user.userTypeId, '5589c00cc05dc30300447176')){
              UserProfile.find(
                {
                  filter:{
                    where:{
                      userDetailId: response.user.id
                    },
                    order: 'created DESC'
                  }
                },
                function(response1) {

                  if(response1.length){
                    //console.log(response[0]);
                    $rootScope.profileId = response1[0].id;
                    $rootScope.profileName = response1[0].profileName;
                    $cookies.put('profileId', response1[0].id);
                    $cookies.put('profileName', response1[0].profileName);

                    //set current user root scope
                    $rootScope.currentUser = {
                      id: response.user.id,
                      tokenId: response.id,
                      email: response.user.email,
                      userTypeId: response.user.userTypeId,
                      inviteUser: null
                    };
                    InviteUser.count(
                      {
                        where:{
                          userDetailId: response.user.id,
                          status: 1
                        }
                      },
                      function(acceptedInvitationCount) {
                        $rootScope.acceptedInvitationCount  = acceptedInvitationCount.count;
                        if( $rootScope.returnToState === "/endorsements/:id/request" && $rootScope.returnToStateParams != undefined) {
                          $state.go("endorsementsrequest", { id: $rootScope.returnToStateParams.id });
                        } else if( $rootScope.returnToState === "/endorsements/:id/received"  && $rootScope.returnToStateParams != undefined) {
                          $state.go("endorsementsreceived", { id: $rootScope.returnToStateParams.id });
                        } else if( $rootScope.returnToState === "/endorsets/:id/request" && $rootScope.returnToStateParams != undefined ) {
                          $state.go("endorsetsrequest", { id: $rootScope.returnToStateParams.id });
                        } else if( $rootScope.returnToState === "/questions/:id" && $rootScope.returnToStateParams != undefined ) {
                          $state.go("questions", { id: $rootScope.returnToStateParams.id });
                        } else {
                          //redirect dashboard
                          $state.go('dashboard');
                        }
                      },
                      function(errorResponse) { console.log(errorResponse); }
                    );


                    //$state.go('dashboard');
                  } else {
                    $state.go('dashboard');
                  }
                },
                function(errorResponse) { console.log(errorResponse); }
              );
            } else {
              $rootScope.currentUser = {
                id: response.user.id,
                tokenId: response.id,
                email: response.user.email,
                userTypeId: response.user.userTypeId,
                inviteUser: null
              };
              $state.go('dashboard');
            }



          });
      };

      $scope.handleRequest = function(res){
        var token = res.id ? res.id : null;
        if(token) {
          //console.log('JWT:', token);
        }
      }
    }]);