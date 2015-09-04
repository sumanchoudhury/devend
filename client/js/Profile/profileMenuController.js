angular
  .module('app')
/**
 * Profile menu controller
 */
  .controller('ProfileMenuController', ['$rootScope', '$scope', '$state', 'LoopBackAuth', 'UserDetail', 'UserProfile', '$cookies', 'EndorsementDataService',
    function($rootScope, $scope, $state, LoopBackAuth, UserDetail, UserProfile, $cookies, EndorsementDataService) {
      $scope.user = LoopBackAuth.currentUserData;
      $rootScope.menuProfiles = [];
      //fetch and update profiles menu
      UserDetail.userProfiles({id: LoopBackAuth.currentUserId})
        .$promise
        .then(function(response) {
          $rootScope.menuProfiles = response;
        });

      //change profile function
      $scope.changeProfile = function(profile){
        $rootScope.profileId = profile.id;
        $rootScope.profileName = profile.profileName;

        $cookies.put('profileId', profile.id);
        $cookies.put('profileName', profile.profileName);

        //EndorsementDataService.loadRequestsData(profile.id);
        //$rootScope.endorsements = EndorsementDataService.getEndorsements();
        //$rootScope.draftEndorsements = EndorsementDataService.getDraftEndorsements();

        if(LoopBackAuth.currentUserData){
          //EndorsementDataService.loadReceivedData(LoopBackAuth.currentUserData.email);
          //$rootScope.receivedEndorsements = EndorsementDataService.getReceivedData();
        }

        //EndorsementDataService.loadEndorsementReceivedData(profile.id);

      };

    }]);