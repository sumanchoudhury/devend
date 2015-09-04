var app = require('../../server/server');
var loopback = require('loopback');
var pubsub = require('../../server/pubsub.js');
var moment = require("moment");

var url = 'https://endorset.herokuapp.com/';

module.exports = function(InviteUser) {
// Returns null if the access token is not valid
  function getCurrentUserId() {
    var ctx = loopback.getCurrentContext();
    var currentUser = ctx && ctx.get('currentUser');
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


  InviteUser.observe('before save', function setDefaultCreated(ctx, next) {
    var socket = InviteUser.app.io;
    var UserDetail = ctx.Model.app.models.UserDetail;
    if (ctx.instance) {
      ctx.instance.created = Date.now();
      ctx.instance.modified = Date.now();
      ctx.instance.userDetailId = 0;
      ctx.instance.status = 0;
      ctx.instance.isViewed = false;
      ctx.instance.roleType = 2;// 1= admin, 2=member

      if(ctx.instance.createdBy == undefined){
        ctx.instance.createdBy = getCurrentUserId();
      }

      if (ctx.instance.email) {
        UserDetail.findOne({
          where: {
            email: ctx.instance.email
          }
        }, function (err, user) {
          if (err) {
            console.log(err)
          }

          if (user) {
            //console.log(user);
            ctx.instance.userDetailId = user.id;
          }

        });
      }

      if(ctx.currentInstance){
        ctx.data.modified = Date.now();
      }
    }
    next();
  });


  //InviteUser after save..
  InviteUser.observe('after save', function (ctx, next) {
    var socket = InviteUser.app.io;
    if(ctx.isNewInstance){
      //Now publishing the data..
      pubsub.publish(socket, {
        collectionName : 'InviteUser',
        data: ctx.instance,
        method: 'POST'
      });
      pubsub.notify(socket, 'common', ctx.instance);
    }else{
      //Now publishing the data..
      if (ctx.instance) {
        pubsub.publish(socket, {
          collectionName : 'InviteUser',
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

  //send email after create
  InviteUser.afterRemote('create', function(context, InviteUser, next) {
    //var url = app.get('url');
    var UserDetail = app.models.UserDetail;
    var Notification = app.models.Notification;

    UserDetail.findOne({
        where: {
          id: InviteUser.createdBy
        }
      },
      function (err, companyUser) {
        if(err){
          console.log(err);
        }
        if(companyUser){
          UserDetail.findOne({
            where: {
              email: InviteUser.email
            }
          }, function (err, user) {
            if(err){
              console.log(err);
            }
            if(user){
              //creating notifications
              Notification.create({
                title: 'You have received an invitation from ' + companyUser.firstName + ' '+ companyUser.lastName +'.',
                shortDescription: 'You have received an invitation from ' + companyUser.firstName + ' '+ companyUser.lastName +'.',
                model: 'InviteUser',
                modelId: InviteUser.id,
                userDetailId: user.id,
                createdBy: InviteUser.createdBy,
                isViewed: false,
                type: 11
              }, function(err, obj){
                if(err){
                  console.log(err);
                }
                console.log(obj);
              });
            }

          });

          app.models.Email.send({
            to: InviteUser.email,
            from: 'noreply@endorset.com',
            subject: 'You have received an invitation.',
            text: 'You have received an invitation from ' + companyUser.firstName + ' '+ companyUser.lastName +'.',
            html: 'You have received a new invitation  from ' + companyUser.firstName + ' '+ companyUser.lastName +'.<br />To view <a href="'+url+'#/invitations">Click here</a>'
          }, function(err, mail) {
            console.log('email sent!');

          });
        }

      });


    next();
  });

};
