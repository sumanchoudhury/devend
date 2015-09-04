var app = require('../../server/server');
var pubsub = require('../../server/pubsub.js');
var loopback = require('loopback');

var url = 'https://endorset.herokuapp.com/';

module.exports = function(EndorsetSent) {
  // Returns null if the access token is not valid
  function getCurrentUserId() {
    var ctx = loopback.getCurrentContext();
    var currentUser = ctx && ctx.get('currentUser');
    //console.log('currentUser.id: ', currentUser.id);
    var userId = currentUser && currentUser.id;
    return userId;;
  }

  function getCurrentUserName() {
    var ctx = loopback.getCurrentContext();
    var currentUser = ctx && ctx.get('currentUser');
    //console.log('currentUser.id: ', currentUser.id);
    var firstName = currentUser && currentUser.firstName;
    var lastName = currentUser && currentUser.lastName;

    return firstName + ' ' + lastName;
  }

  EndorsetSent.observe('before save', function setDefaultCreated(ctx, next) {
    if (ctx.instance) {
      ctx.instance.created = Date.now();
      ctx.instance.modified = Date.now();
    }

    var UserDetail = ctx.Model.app.models.UserDetail;

    if (ctx.currentInstance) {
      ctx.data.modified = Date.now();
    }

    next();

  });

  //EndorsetSent after save..
  EndorsetSent.observe('after save', function (ctx, next) {
    var socket = EndorsetSent.app.io;
    if(ctx.isNewInstance){
      //Now publishing the data..
      pubsub.publish(socket, {
        collectionName : 'EndorsetSent',
        data: ctx.instance,
        method: 'POST'
      });
    }else{
      //Now publishing the data..
      if (ctx.instance) {
        pubsub.publish(socket, {
          collectionName : 'EndorsetSent',
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

  //send notification email after create
  EndorsetSent.afterRemote('create', function(context, EndorsetSent, next) {
    var UserDetail = app.models.UserDetail;
    var Notification = app.models.Notification;
    UserDetail.findOne({
      where: {
        id: EndorsetSent.companyUserId
      }
    }, function (err, user) {

      //creating notifications
      Notification.create({
        title: 'You have received an endorset from ' + getCurrentUserName() + '.',
        shortDescription: 'You have received an endorset from ' + getCurrentUserName() + '.',
        model: 'EndorsetSent',
        modelId: EndorsetSent.id,
        userDetailId: user.id,
        createdBy: EndorsetSent.userDetailId,
        isViewed: false,
        type: 8
      }, function(err, obj){
        if(err){
          console.log(err);
        }
        //console.log(obj);
      });

      app.models.Email.send({
        to: user.email,
        from: 'noreply@endorset.com',
        subject: 'New Endorset',
        text: 'You have received a new endorset.',
        html: 'You have received a new endorset..<br />To view <a href="'+url+'#/dashboard">Click here</a>'
      }, function(err, mail) {
        console.log('email sent!');

      });
    });


    next();
  });
};
