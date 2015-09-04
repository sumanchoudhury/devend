angular
  .module('app')
/**
 * Endorsement listing controller
 */
  .controller('EndorsementListController', ['$rootScope', '$scope', '$window', '$state', '$stateParams', '$modal', '$log', 'LoopBackAuth', 'UserDetail', 'UserProfile',
    function ($rootScope, $scope, $window, $state, $stateParams, $modal, $log,  LoopBackAuth, UserDetail, UserProfile) {
      $scope.user = LoopBackAuth.currentUserData;
      $scope.successMsg = false;
      $scope.errorMsg = false;
      $scope.errors = [];

      $scope.profileId = $stateParams.profileId;

      $scope.profile = {};
      $scope.endorsements = [];

      //fetch current user's profiles
      $scope.getProfile = function(){
        UserProfile.findById({id: $stateParams.profileId})
          .$promise
          .then(function (profile) {
            $scope.profile = profile;
            //console.log(profile);
          },
          function (error) {
            console.log(error);
            $scope.successMsg = false;
            $scope.errorMsg = true;
            $scope.errors = error.data.error.details.messages;
          });
      };
      $scope.getProfile();

      //fetch endorsements
      $scope.getEndorsements = function (){
        UserProfile.endorsements({id: $stateParams.profileId})
          .$promise
          .then(function (endorsements) {
            $scope.endorsements = endorsements;
            //console.log(endorsements);
          },
          function (error) {
            console.log(error);
            $scope.successMsg = false;
            $scope.errorMsg = true;
            $scope.errors = error.data.error.details.messages;
          });
      };

      $scope.getEndorsements();


    }]);