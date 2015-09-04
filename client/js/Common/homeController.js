angular
  .module('app')
  .controller('HomeController', ['$rootScope', '$scope', 'LoginService', '$state', 'LoopBackAuth', 'UserDetail', '$filter',
    function($rootScope, $scope, LoginService, $state, LoopBackAuth, UserDetail, $filter) {
      //console.log($rootScope.currentUser);
      if (UserDetail.isAuthenticated()) {
        //console.log($state.current.name);
        if($state.is('home')){
          $state.go('dashboard');
        }

      } else {
        $rootScope.currentUser = null;
      }
    }
  ]
  );
