;(function(){
  /**
   * date extract regexp
   * @type {RegExp}
   */
  var regexIso8601 = /^(\d{4}|\+\d{6})(?:-(\d{2})(?:-(\d{2})(?:T(\d{2}):(\d{2}):(\d{2})\.(\d{1,})(Z|([\-+])(\d{2}):(\d{2}))?)?)?)?$/;

  /**
   * convert date string to Date JS object
   * @param input
   * @returns {*}
   */
  function convertDateStringsToDates(input) {
    // Ignore things that aren't objects.
    if (typeof input !== "object") return input;

    for (var key in input) {
      if (!input.hasOwnProperty(key)) continue;

      var value = input[key];
      var match;
      // Check for string properties which look like dates.
      if (typeof value === "string" && (match = value.match(regexIso8601))) {
        // Assume that Date.parse can parse ISO 8601 strings, or has been shimmed in older browsers to do so.
        var milliseconds = Date.parse(match[0]);
        if (!isNaN(milliseconds)) {
          input[key] = new Date(milliseconds);
        }
      } else if (typeof value === "object") {
        // Recurse into object
        convertDateStringsToDates(value);
      }
    }
  }

  /**
   * JWT auth
   * @param $window
   */
  function auth($window) {
    var self = this;

    // Parse JWT token
    self.parseJwt = function(token) {
      var base64Url = token.split('.')[1];
      var base64 = base64Url.replace('-', '+').replace('_', '/');
      return JSON.parse($window.atob(base64));
    };

    /**
     * save JWT token
     * @param token
     */
    self.saveToken = function(token) {
      $window.localStorage['endorsetToken'] = token;
    };

    /**
     * get JWT token
     * @returns {*}
     */
    self.getToken = function() {
      return $window.localStorage['endorsetToken'];
    };

    /**
     * check is auth
     * @returns {boolean}
     */
    self.isAuthed = function() {
      var token = self.getToken();
      if(token) {
        var params = self.parseJwt(token);
        return Math.round(new Date().getTime() / 1000) <= params.exp;
      } else {
        return false;
      }
    };

    /**
     * Logout
     */
    self.logout = function() {
      $window.localStorage.removeItem('endorsetToken');
    };
  }

  //Function for unsubscribing..
  var unSubscribeAll = function(PubSub){
    //Unsubscribe all listeners..
    PubSub.unSubscribeAll();
  };

angular
  .module('app', [
    'ngRoute',
    'ngResource',
    'ngAnimate',
    'ui.router',
    'lbServices',
    'ui.bootstrap',
    'mwl.confirm',
    'ngCookies',
    'angularMoment',
    'ngFileUpload',
    'react',
    'angular-loading-bar',
    'ngToast',
    'angular.filter'
  ])
  //API endpoint constant
  .constant('API', 'http://endorset.herokuapp.com/api')
  .service('auth', auth)
  //states
  .config(['$stateProvider', '$urlRouterProvider', '$httpProvider', function($stateProvider,
      $urlRouterProvider, $httpProvider) {
    $stateProvider
      .state('/login', {
        url: '/login',
        templateUrl: 'views/home.html',
        //Here unsubscribe function must be called to unsubcribe all events on state change
        onExit: unSubscribeAll
      })
      .state('forbidden', {
        url: '/forbidden',
        templateUrl: 'views/forbidden.html',
        //Here unsubscribe function must be called to unsubcribe all events on state change
        onExit: unSubscribeAll
      })
      .state('home', {
        url: '/home',
        templateUrl: 'views/home.html',
        //Here unsubscribe function must be called to unsubcribe all events on state change
        onExit: unSubscribeAll
      })

      .state('logout', {
        url: '/logout',
        controller: 'LogoutController',
        //Here unsubscribe function must be called to unsubcribe all events on state change
        onExit: unSubscribeAll
      })
      .state('sign-up', {
        url: '/sign-up',
        templateUrl: 'views/signup/sign-up-form.html',
        controller: 'SignUpController',
        //Here unsubscribe function must be called to unsubcribe all events on state change
        onExit: unSubscribeAll
      })
      .state('sign-up-success', {
        url: '/sign-up/success',
        templateUrl: 'views/signup/sign-up-success.html',
        //Here unsubscribe function must be called to unsubcribe all events on state change
        onExit: unSubscribeAll
      })
      .state('edit-account', {
        url: '/edit-account',
        templateUrl: 'views/user/edit-account.html',
        controller: 'MyAccountController',
        authenticate: true,
        //Here unsubscribe function must be called to unsubcribe all events on state change
        onExit: unSubscribeAll
      })
      .state('user-identity', {
        url: '/user-identity',
        templateUrl: 'views/identity/user-identity.html',
        controller: 'IdentityController',
        authenticate: true,
        //Here unsubscribe function must be called to unsubcribe all events on state change
        onExit: unSubscribeAll
      })
      .state('add-profile', {
        url: '/add-profile',
        templateUrl: 'views/profile/add-profile.html',
        controller: 'MyProfileController',
        authenticate: true,
        //Here unsubscribe function must be called to unsubcribe all events on state change
        onExit: unSubscribeAll
      })
      .state('edit-profile', {
        url: '/edit-profile/:profileId',
        templateUrl: 'views/profile/edit-profile.html',
        controller: 'EditProfileController',
        authenticate: true,
        //Here unsubscribe function must be called to unsubcribe all events on state change
        onExit: unSubscribeAll
      })
      .state('delete-profile', {
        url: '/delete-profile/:profileId',
        templateUrl: 'views/profile/delete-profile.html',
        controller: 'DeleteProfileController',
        authenticate: true,
        //Here unsubscribe function must be called to unsubcribe all events on state change
        onExit: unSubscribeAll
      })
      .state('endorsement', {
        url: '/endorsement/:profileId',
        templateUrl: 'views/endorsement/endorsement-application.html',
        controller: 'EndorsementController',
        authenticate: true
      })
      .state('endorsements', {
        url: '/endorsements/:profileId',
        templateUrl: 'views/endorsement/endorsements.html',
        controller: 'EndorsementListController',
        authenticate: true,
        //Here unsubscribe function must be called to unsubcribe all events on state change
        onExit: unSubscribeAll
      })
      .state('dashboard', {
        url: '/',
        templateProvider: function(LoginService, $stateParams, $templateFactory, $cookies) {
          return LoginService.me().$promise
            .then(function(response) {
              var currentDashboard = $cookies.get('currentDashboard');
              if(currentDashboard == null || currentDashboard == undefined){
                currentDashboard = 'dashboard';
              }
              if (response.userTypeId == '5589c00cc05dc30300447176' && angular.equals(currentDashboard, 'dashboard') ) {
                return $templateFactory.fromUrl('views/dashboard/dashboard.html', $stateParams);
              } else if (response.userTypeId != '5589c00cc05dc30300447176' && angular.equals(currentDashboard, 'dashboard') ) {
                return $templateFactory.fromUrl('views/dashboard/company-dashboard.html', $stateParams);
              } else if(angular.equals(currentDashboard, 'companydashboard')){
                return $templateFactory.fromUrl('views/dashboard/company-user-dashboard.html', $stateParams);
              } else {
                return $templateFactory.fromUrl('views/dashboard/dashboard.html', $stateParams);
              }
            });

        },
        //templateUrl: 'views/dashboard/dashboard.html',
        controller: 'UseTypeController',
        authenticate: true,
        //Here unsubscribe function must be called to unsubcribe all events on state change
        onExit: unSubscribeAll
      })
      .state('companydashboard', {
        url: '/',
        templateUrl: 'views/dashboard/company-user-dashboard.html',
        //controller: 'CompanyUserDashboardController',
        authenticate: true,
        //Here unsubscribe function must be called to unsubcribe all events on state change
        onExit: unSubscribeAll
      })
      .state('endorsementsrequest', {
        url: '/endorsements/:id/request',
        templateUrl: 'views/endorsement/request.html',
        controller: 'EndorsementRequestController',
        authenticate: true,
        //Here unsubscribe function must be called to unsubcribe all events on state change
        onExit: unSubscribeAll
      })
      .state('endorsementsreceived', {
        url: '/endorsements/:id/received',
        templateUrl: 'views/endorsement/received.html',
        controller: 'EndorsementReceivedController',
        authenticate: true,
        //Here unsubscribe function must be called to unsubcribe all events on state change
        onExit: unSubscribeAll
      })
      .state('endorsetsrequest', {
        url: '/endorsets/:id/request',
        templateUrl: 'views/endorset/request.html',
        controller: 'EndorsetRequestController',
        authenticate: true,
        //Here unsubscribe function must be called to unsubcribe all events on state change
        onExit: unSubscribeAll
      })
      .state('questions', {
        url: '/questions/:id',
        templateUrl: 'views/question/question.html',
        controller: 'QuestionController',
        authenticate: true,
        //Here unsubscribe function must be called to unsubcribe all events on state change
        onExit: unSubscribeAll
      })
      .state('my-endorsets', {
        url: '/my-endorsets',
        templateUrl: 'views/endorset/my-endorsets.html',
        controller: 'MyEndorsetController',
        authenticate: true,
        //Here unsubscribe function must be called to unsubcribe all events on state change
        onExit: unSubscribeAll
      })
      .state('notifications', {
        url: '/notifications',
        templateUrl: 'views/notification/notifications.html',
        controller: 'NotificationController',
        authenticate: true,
        //Here unsubscribe function must be called to unsubcribe all events on state change
        onExit: unSubscribeAll
      })
      .state('invite', {
        url: '/invite',
        templateUrl: 'views/user/invite-company-user.html',
        controller: 'InviteUserController',
        authenticate: true,
        //Here unsubscribe function must be called to unsubcribe all events on state change
        onExit: unSubscribeAll
      })
      .state('receivedinvites', {
        url: '/received-invites',
        templateUrl: 'views/user/received-invites.html',
        //controller: 'ReceivedInviteController',
        authenticate: true,
        //Here unsubscribe function must be called to unsubcribe all events on state change
        onExit: unSubscribeAll
      })
      .state('sentinvites', {
        url: '/sent-invites',
        templateUrl: 'views/user/sent-invites.html',
        //controller: 'SentInviteController',
        authenticate: true,
        //Here unsubscribe function must be called to unsubcribe all events on state change
        onExit: unSubscribeAll
      })
      .state('myteam', {
        url: '/my-team',
        templateUrl: 'views/user/my-team.html',
        authenticate: true,
        //Here unsubscribe function must be called to unsubcribe all events on state change
        onExit: unSubscribeAll
      })
      .state('verified', {
        url: '/verified',
        templateUrl: 'views/user/verified.html'
      });
    $urlRouterProvider.otherwise('/home');

    //config CORS
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
    $httpProvider.defaults.transformResponse.push(function(responseData){
      //convertDateStringsToDates(responseData);
      return responseData;
    });

    $httpProvider.interceptors.push(function($q, $location, $rootScope, LoopBackAuth, auth) {

      return {

        /**
         * un-auth access handler
         * @param rejection
         * @returns {Promise}
         */
        responseError: function(rejection) {
          if (rejection.status == 401) {
            //Now clearing the loopback values from client browser for safe logout...
            LoopBackAuth.clearUser();
            LoopBackAuth.clearStorage();

            $rootScope.currentUser = null;

            $location.nextAfterLogin = $location.path();
            $location.path('/home');
          }
          return $q.reject(rejection);
        }
      };
    });
  }])
  .run(['$rootScope', '$state', 'LoopBackAuth', 'LoginService', 'UserDetail', 'auth', function($rootScope, $state, LoopBackAuth, LoginService, UserDetail, auth) {
    $rootScope.$on('$stateChangeStart', function(event, next, toParams) {
      if($rootScope.currentUser == undefined){
        $rootScope.currentUser = null;
      }
      $rootScope.successMsg = false;
      $rootScope.errorMsg = false;
      $rootScope.success = false;
      $rootScope.error = false;

      if (UserDetail.isAuthenticated()) {
        //console.log(UserDetail.getCurrentId());
        //console.log($state.current.name);
        if(!angular.equals($state.current.name, "home") && !angular.equals($state.current.name, "logout")){
          /**
           * update current user data
           */
          LoginService.getCurrentUser(function(response){
            $rootScope.currentUser = {
              id: response.id,
              email: response.email,
              userTypeId: response.userTypeId,
              tokenId: LoopBackAuth.accessTokenId,
              inviteUser: (response.invitations != undefined && response.invitations.roleType != 1) ? response.invitations : null
            };

            //console.log(response);
            //user after login force redirect if identity incomplete
            if(response.userTypeId == '5589c00cc05dc30300447176' && (typeof response.firstName == 'undefined' || typeof response.lastName == 'undefined')){
              $state.go('user-identity');
            } else if(response.userTypeId == '5589c00cc05dc30300447176') {
              //if no profile created redirect to add-profile page
              UserDetail.userProfiles({id: LoopBackAuth.currentUserId})
                .$promise
                .then(function(response) {
                  if(response.length == 0){
                    $state.go('add-profile');
                  } else {

                  }
                });
            }
          });
        }



      } else {
        $rootScope.currentUser = null;
        LoopBackAuth.clearUser();
        LoopBackAuth.clearStorage();


      }
      // redirect to login page if not logged in
      if (next.authenticate && !UserDetail.isAuthenticated()) {
        event.preventDefault(); //prevent current page from loading

        //console.log(toParams);
        //console.log(next);

        $rootScope.currentUser = null;
        LoopBackAuth.clearUser();
        LoopBackAuth.clearStorage();


        $rootScope.returnToState = next.url;
        $rootScope.returnToStateParams = toParams;

        $state.go('home');
      }
    });
  }])
})();
