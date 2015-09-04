var app = require('../../server/server');
var loopback = require('loopback');
var pubsub = require('../../server/pubsub.js');
var moment = require("moment");

var url = 'https://endorset.herokuapp.com/';

  module.exports = function(Endorsement) {
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


  Endorsement.observe('before save', function setDefaultCreated(ctx, next) {
    var socket = Endorsement.app.io;
    var UserDetail = ctx.Model.app.models.UserDetail;
    if (ctx.instance) {
      ctx.instance.created = Date.now();
      ctx.instance.modified = Date.now();
      ctx.instance.endorserAcceptStatus = "pending";
      ctx.instance.endorserId = 0;

      if(ctx.instance.email){
        UserDetail.findOne({
          where: {
            email: ctx.instance.email
          }
        }, function (err, user) {
          if(err){
            console.log(err)
          }

          if(user){
            //console.log(user);
            ctx.instance.endorserId = user.id;
          }

        });
      }
    }


    var Notification = ctx.Model.app.models.Notification;
    //var url = app.get('url');

    if(ctx.currentInstance){
      if(ctx.currentInstance.email){
        UserDetail.findOne({
          where: {
            email: ctx.currentInstance.email
          }
        }, function (err, user) {
          if(err){
            console.log(err);
          }

          if(user){
            //console.log(user);
            ctx.currentInstance.endorserId = user.id;
          }

        });
      }

      ctx.data.modified = Date.now();
      UserDetail.findOne({
        where: {
          id: ctx.currentInstance.userDetailId
        }
      }, function (err, user) {
        //console.log(user);

        var email = user.email;

        //accept hook
        if(ctx.data.endorserAcceptStatus == 1){
          ctx.data.endorserAcceptStatus = "accepted";

          //creating notifications
          Notification.create({
            title: 'Your endorsement request has been accepted by ' + getCurrentUserName() + '.',
            shortDescription: 'Your endorsement request has been accepted by ' + getCurrentUserName() + '.',
            model: 'Endorsement',
            modelId: ctx.currentInstance.id,
            userDetailId: ctx.currentInstance.userDetailId,
            createdBy: getCurrentUserId(),
            isViewed: false,
            type: 3
          }, function(err, obj){
            if(err){
              console.log(err);
            }
            pubsub.notify(socket, 'common', obj);
            //console.log(obj);
          });

          app.models.Email.send({
            to: email,
            from: 'noreply@endorset.com',
            subject: 'Endorsement Request Accepted',
            text: 'Your endorsement request has been accepted by endorser.',
            html: 'Your endorsement request has been accepted by endorser.<br />To view <a href="'+url+'#/endorsements/'+ctx.currentInstance.id+'/request">Click here</a>'
          }, function(err, mail) {
            console.log('email sent!');

          });
        }
        //decline hook
        if(ctx.data.endorserAcceptStatus == 2){
          ctx.data.endorserAcceptStatus = "declined";
          //creating notifications
          Notification.create({
            title: 'Your endorsement request has been declined by ' + getCurrentUserName() + '.',
            shortDescription: 'Your endorsement request has been declined by ' + getCurrentUserName() + '.',
            model: 'Endorsement',
            modelId: ctx.currentInstance.id,
            userDetailId: ctx.currentInstance.userDetailId,
            createdBy: getCurrentUserId(),
            isViewed: false,
            type: 4
          }, function(err, obj){
            if(err){
              console.log(err);
            }
            pubsub.notify(socket, 'common', obj);
            //console.log(obj);
          });

          app.models.Email.send({
            to: email,
            from: 'noreply@endorset.com',
            subject: 'Endorsement Request Declined',
            text: 'Your endorsement request has been declined by endorser.',
            html: 'Your endorsement request has been declined by endorser.<br />To view <a href="'+url+'#/endorsements/'+ctx.currentInstance.id+'/request">Click here</a>'
          }, function(err, mail) {
            console.log('email sent!');

          });
        }

        //seen at hook
        if(ctx.data.endorserSeenAt){

          ctx.data.endorserSeenAt = Date.now();

          //creating notifications
          Notification.create({
            title: 'Your endorsement request has been seen by ' + getCurrentUserName() + '.',
            shortDescription: 'Your endorsement request has been seen by ' + getCurrentUserName() + '.',
            model: 'Endorsement',
            modelId: ctx.currentInstance.id,
            userDetailId: ctx.currentInstance.userDetailId,
            createdBy: getCurrentUserId(),
            isViewed: false,
            type: 2
          }, function(err, obj){
            if(err){
              console.log(err);
            }
            pubsub.notify(socket, 'common', obj);
            //console.log(obj);
          });

          app.models.Email.send({
            to: email,
            from: 'noreply@endorset.com',
            subject: 'Endorsement Request Seen',
            text: 'Your endorsement request has been seen by endorser.',
            html: 'Your endorsement request has been  seen by endorser.<br />To view <a href="'+url+'#/endorsements/'+ctx.currentInstance.id+'/request">Click here</a>'
          }, function(err, mail) {
            console.log('email sent!');

          });
        }
      });
      //console.log(Endorsement);

      //send new endorsement request
      //console.log(app.get('url'));
      if (ctx.data.isDraft == false) {
        UserDetail.findOne({
          where: {
            email: ctx.currentInstance.email
          }
        }, function (err, user) {
          if(err){
            console.log(err);
          }
          if(user){
            //creating notifications
            Notification.create({
              title: 'You have received an endorsement request. Find your ex colleague at',
              shortDescription: 'You have received an endorsement request. Find your ex colleague at',
              model: 'Endorsement',
              modelId: ctx.currentInstance.id,
              userDetailId: user.id,
              createdBy: getCurrentUserId(),
              isViewed: false,
              type: 1
            }, function(err, obj){
              if(err){
                console.log(err);
              }
              pubsub.notify(socket, 'common', obj);
              //console.log(obj);
            });
          }

        });


        app.models.Email.send({
          to: ctx.currentInstance.email,
          from: 'noreply@endorset.com',
          subject: 'New Endorsement Application',
          text: 'You have received a new endorsement application.',
          html: 'You have received a new endorsement application.<br />To view <a href="'+url+'#/endorsements/'+ctx.currentInstance.id+'/request">Click here</a>'
        }, function (err, mail) {
          console.log('email sent!');

        });
      }
    }


    next();
  });

  Endorsement.observe('loaded', function processData(ctx, next) {
    var UserDetail = app.models.UserDetail;
    //console.log(ctx.Model.scopes);
    //status manipulation
    if(ctx.instance != undefined && ctx.instance.endorserAcceptStatus && !ctx.instance.endorserAcceptStatusText){
      if(ctx.instance.endorserAcceptStatus == 1){
        ctx.instance.endorserAcceptStatusText = 'accepted';
      } else if(ctx.instance.endorserAcceptStatus == 2){
        ctx.instance.endorserAcceptStatusText = 'declined';
      } else {
        ctx.instance.endorserAcceptStatusText = 'pending';
      }
    }

    //set seen at
    if(ctx.instance != undefined && ctx.instance.endorserSeenAt){
      //ctx.instance.endorserSeenAt = moment(ctx.instance.endorserSeenAt).toDate();
    }
    next();
  });

  //Endorsement after save..
  Endorsement.observe('after save', function (ctx, next) {
    var socket = Endorsement.app.io;
    if(ctx.isNewInstance){
      //Now publishing the data..
      pubsub.publish(socket, {
        collectionName : 'Endorsement',
        data: ctx.instance,
        method: 'POST'
      });
      pubsub.notify(socket, 'common', ctx.instance);
    }else{
      //Now publishing the data..
      if (ctx.instance) {
        pubsub.publish(socket, {
          collectionName : 'Endorsement',
          data: ctx.instance,
          modelId: ctx.instance.id,
          method: 'PUT'
        });
        pubsub.notify(socket, 'common', ctx.instance);
      }
    }
    //Calling the next middleware..
    next();
  }); //after save..

  //Endorsement before delete..
  Endorsement.observe("before delete", function(ctx, next){
    var socket = Endorsement.app.io;
    //Now publishing the data..
    pubsub.publish(socket, {
      collectionName : 'Endorsement',
      data: ctx.instance.id,
      modelId: ctx.instance.id,
      method: 'DELETE'
    });
    //move to next middleware..
    next();

  }); //before delete..

  //send verification email after create
  Endorsement.afterRemote('create', function(context, Endorsement, next) {
    //var url = app.get('url');
    if(Endorsement.isDraft == false){
      var UserDetail = app.models.UserDetail;
      var Notification = app.models.Notification;
      UserDetail.findOne({
        where: {
          email: Endorsement.email
        }
      }, function (err, user) {
        if(err){
          console.log(err);
        }
        if(user){
          //creating notifications
          Notification.create({
            title: 'You have received an endorsement request. Find your ex colleague at.',
            shortDescription: 'You have received an endorsement request. Find your ex colleague at',
            model: 'Endorsement',
            modelId: Endorsement.id,
            userDetailId: user.id,
            createdBy: Endorsement.userDetailId,
            isViewed: false,
            type: 1
          }, function(err, obj){
            if(err){
              console.log(err);
            }
            //console.log(obj);
          });
        }

      });

      app.models.Email.send({
        to: Endorsement.email,
        from: 'noreply@endorset.com',
        subject: 'New Endorsement Application',
        text: 'You have received a new endorsement application.',
        html: 'You have received a new endorsement application.<br />To view <a href="'+url+'#/endorsements/'+Endorsement.id+'/request">Click here</a>'
      }, function(err, mail) {
        console.log('email sent!');

      });
    }

    next();
  });


    Endorsement.updateEndorserId = function(msg, cb) {
      var UserDetail = app.models.UserDetail;
      Endorsement.find({}, function(err, endorsements){
        endorsements.forEach(function(item){
          UserDetail.findOne({
            where: {
              email: item.email
            }
          }, function (err, user) {
            if(err){
              console.log(err)
            }

            if(user){
              //console.log(user);
              //ctx.instance.endorserUserDetail = {id: user.id, thumbImage: user.thumbImage, fullImage: user.fullImage};
              Endorsement.update({id: item.id}, {endorserId: user.id});
            }

          });
        });
      });
      cb(null, 'Greetings... ' + msg);
    };

    Endorsement.remoteMethod(
      'updateEndorserId',
      {
        accepts: {arg: 'msg', type: 'string'},
        returns: {arg: 'greeting', type: 'string'}
      }
    );

  };
