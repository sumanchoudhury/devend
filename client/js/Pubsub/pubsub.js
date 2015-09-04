'use strict';
angular.module('app')
  .factory('PubSub', function (socket, $window) {
    var container =  [];
    $window.onbeforeunload = function (e) {
      socket.close();
    };
    return {
      getData: function(name, callback){
        socket.on(name, callback);
        this.pushContainer(name);
      },
      subscribe: function(options, callback){
        if(options){
          var collectionName = options.collectionName;
          var modelId = options.modelId;
          var method = options.method;
          if(method === 'POST'){
            var name = '/' + collectionName + '/' + method;
            socket.on(name, callback);
          }
          else{
            var name = '/' + collectionName + '/' + modelId + '/' + method;
            socket.on(name, callback);
          }
          //Push the container..
          this.pushContainer(name);
        }else{
          throw 'Error: Option must be an object';
        }
      }, //end subscribe

      pushContainer : function(subscriptionName){
        container.push(subscriptionName);
      },

      //Unsubscribe all containers..
      unSubscribeAll: function(){
        for(var i=0; i<container.length; i++){
          socket.removeAllListeners(container[i]);
        }
        //Now reset the container..
        container = [];
      }

    };
  });