var app = require('../../server/server');
var pubsub = require('../../server/pubsub.js');
var loopback = require('loopback');
var url = 'https://endorset.herokuapp.com/';
var pubsub = require('../../server/pubsub.js');

module.exports = function(AssignEndorsets) {

  // Returns null if the access token is not valid
  function getCurrentUserId() {
    var ctx = loopback.getCurrentContext();
    var currentUser = ctx && ctx.get('currentUser');
    //console.log('currentUser.id: ', currentUser.id);
    var userId = currentUser && currentUser.id;
    return userId;
  }
  function getCurrentUserName() {
    var ctx = loopback.getCurrentContext();
    var currentUser = ctx && ctx.get('currentUser');
    //console.log('currentUser.id: ', currentUser.id);
    var firstName = currentUser && currentUser.firstName;
    var lastName = currentUser && currentUser.lastName;

    return firstName + ' ' + lastName;
  }

  AssignEndorsets.observe('before save', function setDefaultCreated(ctx, next) {
    if (ctx.instance) {
      ctx.instance.created = Date.now();
      ctx.instance.modified = Date.now();
    }
    if (ctx.currentInstance) {
      ctx.data.modified = Date.now();
    }

    next();
  });

  AssignEndorsets.saveAssignments = function(data, cb) {
    var UserDetail = app.models.UserDetail;
    var Notification = app.models.Notification;
    //console.log(data);
    var results = [];

    if(data.endorsets != undefined){
      AssignEndorsets.destroyAll({userDetailId: data.userDetailId}, function(err, res){
        if(err)
          console.log(err);
        //console.log(res)
      });

      data.endorsets.forEach(function(endorsetSent){
        //creating AssignEndorsets
        AssignEndorsets.create({
          createdBy: data.createdBy,
          userDetailId: data.userDetailId,
          inviteUserId: data.inviteUserId,
          endorsetSentId: endorsetSent.id,
          created: Date.now(),
          modified:Date.now()
        }, function(err, objAssignEndorset){
          if(err){
            console.log(err);
          }
          results.push(objAssignEndorset);

          //creating notifications
          Notification.create({
            title: 'New Endorset assigned by ' + getCurrentUserName() + '.',
            shortDescription: 'New Endorset assigned by ' + getCurrentUserName() + '.',
            model: 'AssignEndorsets',
            modelId: objAssignEndorset.id,
            userDetailId: data.userDetailId,
            createdBy: data.createdBy,
            isViewed: false,
            type: 12
          }, function(err, obj){
            if(err){
              console.log(err);
            }
            //console.log(obj);
          });

          UserDetail.findOne({
            where: {
              id: data.userDetailId
            }
          }, function (err, user) {
            if(err){
              console.log(err)
            }

            if(user){
              //console.log(user);
              app.models.Email.send({
                to: user.email,
                from: 'noreply@endorset.com',
                subject: 'New Endorset assigned by ' + getCurrentUserName() + '.',
                text: 'New Endorset assigned by ' + getCurrentUserName() + '.',
                html: 'New Endorset assigned.<br />To view <a href="'+url+'">Click here</a>'
              }, function(err, mail) {
                console.log('email sent!');

              });
            }

          });



          //console.log(results);
        });
      });
    }
    cb(null, results);
  };

  AssignEndorsets.remoteMethod(
    'saveAssignments',
    {
      accepts: {arg: 'data', type: 'object'},
      returns: {arg: 'data', type: 'object'}
    }
  );


  //AssignEndorsets after save..
  AssignEndorsets.observe('after save', function (ctx, next) {
    var socket = AssignEndorsets.app.io;
    if(ctx.isNewInstance){
      //Now publishing the data..
      pubsub.publish(socket, {
        collectionName : 'AssignEndorsets',
        data: ctx.instance,
        method: 'POST'
      });
    }else{
      //Now publishing the data..
      if (ctx.instance) {
        pubsub.publish(socket, {
          collectionName : 'AssignEndorsets',
          data: ctx.instance,
          modelId: ctx.instance.id,
          method: 'PUT'
        });
      }
    }
    pubsub.notify(socket, 'common', ctx.instance);
    //Calling the next middleware..
    next();
  }); //after save..
};
