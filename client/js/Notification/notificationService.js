angular
  .module('app')
  .factory('notificationService', ['$rootScope', 'Notification', 'LoopBackAuth', function ($rootScope, Notification, LoopBackAuth) {

    var service = {

      notificationData: {
        notification: {},
        eventName: '',
        selectedObject : {}
      },

      SaveState: function () {
        sessionStorage.notificationService = angular.toJson(service.notificationData);
      },

      RestoreState: function () {
        service.notificationData = angular.fromJson(sessionStorage.notificationService);
      },

      resetData: function(){
        service.notificationData = {
          notification: {},
          eventName: '',
          selectedObject : {}
        };
      },

      loadNotifications: function(userId, paginate, callback){
        if(userId == undefined || !userId){
          userId =  LoopBackAuth.currentUserId;
        }
        Notification.find(
          {
            filter:{
              limit: paginate.limit,
              skip: paginate.skip,
              where:{
                userDetailId: userId

              },
              order: 'created DESC'
            }
          },
          function(notifications,  httpHeader) {
            if(callback != undefined){
              callback(notifications);
            }
          },
          function(errorResponse) { console.log(errorResponse); }
        );
      },
      countNotification: function(userId, callback){
        if(userId == undefined || !userId){
         userId =  LoopBackAuth.currentUserId;
        }
        Notification.count(
          {
            where:{
              isViewed: {neq: true},
              userDetailId: userId

            }
          },
          function(count,  httpHeader) {
            if(callback != undefined){
              callback(count);
            }
          },
          function(errorResponse) { console.log(errorResponse); }
        );
      }
    };

    $rootScope.$on("savestate", service.SaveState);
    $rootScope.$on("restorestate", service.RestoreState);

    return service;
  }]);
