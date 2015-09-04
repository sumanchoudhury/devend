var app = require('../../server/server');
var loopback = require('loopback');
var pubsub = require('../../server/pubsub.js');
var url = 'https://endorset.herokuapp.com/';

module.exports = function(EndorserEndorsement) {
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

  EndorserEndorsement.observe('before save', function setDefaultCreated(ctx, next) {
    if (ctx.instance) {
      ctx.instance.created = Date.now();
      ctx.instance.modified = Date.now();
    }

    var UserDetail = ctx.Model.app.models.UserDetail;
    var Endorsement = ctx.Model.app.models.Endorsement;
    var Notification = ctx.Model.app.models.Notification;
    //var url = app.get('url');

    if(ctx.currentInstance){
      ctx.data.modified = Date.now();
      if(ctx.data.isDraft == false){
        Endorsement.findOne({
          where: {
            id: ctx.currentInstance.endorsementId
          },
          include: {
            relation: 'userDetail', // include the owner object
            scope: { // further filter the owner object
              fields: ['id', 'email']
            }
          }
        }, function(err, endorsement) {
          if(err){
            console.log(err);
          } else {
            //console.log(endorsement);
            //console.log(endorsement.userDetail.email);
            UserDetail.findOne({
              where: {
                id: endorsement.userDetailId
              }
            }, function (err, user) {
              if(err){
                console.log(err)
              } else {
                //creating notifications
                Notification.create({
                  title: 'You have received an endorsement by ' + getCurrentUserName() + '.',
                  shortDescription: 'You have received an endorsement by ' + getCurrentUserName() + '.',
                  model: 'EndorserEndorsement',
                  modelId: ctx.currentInstance.id,
                  userDetailId: user.id,
                  createdBy: getCurrentUserId(),
                  isViewed: false,
                  type: 5
                }, function(err, obj){
                  if(err){
                    console.log(err);
                  }
                  //console.log(obj);
                });

                app.models.Email.send({
                  to: user.email,
                  from: 'noreply@endorset.com',
                  subject: 'New Endorsement received from endorser',
                  text: 'You have received a new endorsement from endorser.',
                  html: 'You have received a new endorsement from endorser.<br />To view <a href="'+url+'#/endorsements/'+ctx.currentInstance.endorsementId+'/received">Click here</a>'
                }, function(err, mail) {
                  console.log('email sent!');

                });
              }

            });
          }

        });


      }
    }

    next();
  });
  //Notification after save..
  EndorserEndorsement.observe('after save', function (ctx, next) {
    var socket = EndorserEndorsement.app.io;
    if(ctx.isNewInstance){
      //Now publishing the data..
      pubsub.publish(socket, {
        collectionName : 'EndorserEndorsement',
        data: ctx.instance,
        method: 'POST'
      });
    }else{
      //Now publishing the data..
      if (ctx.instance) {
        pubsub.publish(socket, {
          collectionName : 'EndorserEndorsement',
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

  EndorserEndorsement.observe('loaded', function processData(ctx, next) {
    //console.log(ctx.Model.scopes);
    if(ctx.instance != undefined && ctx.instance.acceptStatus){
      if(ctx.instance.acceptStatus == 1){
        ctx.instance.endorserAcceptStatus = 1;
      } else if(ctx.instance.acceptStatus == 2){
        ctx.instance.endorserAcceptStatus = 2;
      } else {
        ctx.instance.endorserAcceptStatus = 0;
      }
    }

    next();
  });

};
