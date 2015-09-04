angular
  .module('app')
/**
 * Login service
 */
  .factory('LoginService', ['UserDetail', '$q', 'LoopBackAuth', 'auth', function(UserDetail, $q, LoopBackAuth, auth) {
    var useType = 0;

    /**
     * get role
     * @returns {number}
     */
    function getUseType(){
      return useType;
    }

    /**
     * set role
     * @param useType
     */
    function setUseType(useType){
      useType = useType;
    }
    function login(username, password, rememberMe) {
      /**
       * Login
       */
      return UserDetail
        .login({rememberMe: rememberMe, include: 'user'}, {username: username, password: password})
        .$promise;
    }

    /**
     * Logout
     * @returns {$promise|*}
     */
    function logout() {
      return UserDetail
        .logout()
        .$promise;
    }

    /**
     * Register
     * @param user
     * @returns {$promise|*}
     */
    function register(user) {
      return UserDetail
        .create(user)
        .$promise;
    }

    /**
     * Update user data
     * @param id
     * @param user
     * @returns {$promise|*}
     */
    function update( id, user) {
      return UserDetail
        .prototype$updateAttributes({id:id},user)
        .$promise;
    }

    /**
     * fetch current user data
     * @returns {Object|*}
     */
    function me(){
      return UserDetail.getCurrent();

    }

    /**
     * get current user
     */
    function getCurrentUser(callback){
      return UserDetail.find(
        {
          filter:{
            limit: 1,
            where:{
              id: LoopBackAuth.currentUserId
            },
            order: 'created DESC',
            include:[
              {"invitations": ['adminUser', {'userDetail':["company"]}]}
            ]
          }
        },
        function(users) {
          if(callback != undefined && users.length > 0){
            callback(users[0]);
          }

        },
        function(errorResponse) { console.log(errorResponse); });
    }


    return {
      login: login,
      logout: logout,
      register: register,
      update:update,
      me: me,
      getUseType: getUseType,
      setUseType: setUseType,
      getCurrentUser: getCurrentUser
    };
  }]);