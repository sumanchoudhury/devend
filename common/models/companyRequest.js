var app = require('../../server/server');
var pubsub = require('../../server/pubsub.js');
var loopback = require('loopback');
var url = 'https://endorset.herokuapp.com/';
var pubsub = require('../../server/pubsub.js');

module.exports = function(CompanyRequest) {
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

  CompanyRequest.observe('before save', function setDefaultCreated(ctx, next) {
    var UserDetail = ctx.Model.app.models.UserDetail;
    if (ctx.instance) {
      ctx.instance.created = Date.now();
      ctx.instance.modified = Date.now();
      ctx.instance.professionalUserId = 0;

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
            ctx.instance.professionalUserId = user.id;
          }

        });
      }
    }


    var Notification = ctx.Model.app.models.Notification;
    //var url = app.get('url');

    if (ctx.currentInstance) {
      ctx.data.modified = Date.now();

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
            ctx.currentInstance.professionalUserId = user.id;
          }

        });
      }

      UserDetail.findOne({
        where: {
          id: ctx.currentInstance.userDetailId
        }
      }, function (err, user) {
        //console.log(user);

        var email = user.email;

        //seen at hook
        if(ctx.data.seenAt){
          ctx.data.seenAt = Date.now();
          //creating notifications
          Notification.create({
            title: 'Your endorset request has been seen by ' + getCurrentUserName() + '.',
            shortDescription: 'Your endorset request has been seen by ' + getCurrentUserName() + '.',
            model: 'CompanyRequest',
            modelId: ctx.currentInstance.id,
            userDetailId: user.id,
            createdBy: getCurrentUserId(),
            isViewed: false,
            type: 7
          }, function(err, obj){
            if(err){
              console.log(err);
            }
            //console.log(obj);
          });

          console.log()

          app.models.Email.send({
            to: email,
            from: 'noreply@endorset.com',
            subject: 'Endorset Request Seen',
            text: 'Your Endorset request has been seen by professional.',
            html: 'Your Endorset request has been seen by professional.<br />To view <a href="'+url+'#/endorsets/'+ctx.currentInstance.id+'/request">Click here</a>'
          }, function(err, mail) {
            console.log('email sent!');

          });
        }

      });



    }

    next();

  });

  //CompanyRequest after save..
  CompanyRequest.observe('after save', function (ctx, next) {
    var socket = CompanyRequest.app.io;
    if(ctx.isNewInstance){
      //Now publishing the data..
      pubsub.publish(socket, {
        collectionName : 'CompanyRequest',
        data: ctx.instance,
        method: 'POST'
      });
    }else{
      //Now publishing the data..
      if (ctx.instance) {
        pubsub.publish(socket, {
          collectionName : 'CompanyRequest',
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
  CompanyRequest.afterRemote('create', function(context, CompanyRequest, next) {
    //var url = app.get('url');
    var UserDetail = app.models.UserDetail;
    var Notification = app.models.Notification;
    UserDetail.findOne({
      where: {
        email: CompanyRequest.email
      }
    }, function (err, user) {
      if(err){
        console.log(err);
      }
      if(user){
        //creating notifications
        Notification.create({
          title: 'You have received an endorset request by ' + getCurrentUserName() + '.',
          shortDescription: 'You have received an endorset request by ' + getCurrentUserName() + '.',
          model: 'CompanyRequest',
          modelId: CompanyRequest.id,
          userDetailId: user.id,
          createdBy: CompanyRequest.userDetailId,
          isViewed: false,
          type: 6
        }, function(err, obj){
          if(err){
            console.log(err);
          }
          //console.log(obj);
        });
      }

    });

    app.models.Email.send({
      to: CompanyRequest.email,
      from: 'noreply@endorset.com',
      subject: 'New Endorset Request',
      text: 'You have received a new endorset request.',
      html: 'You have received a new endorset request.<br />To view <a href="'+url+'#/endorsets/'+CompanyRequest.id+'/request">Click here</a>'
    }, function(err, mail) {
      console.log('email sent!');

    });

    next();
  });


  CompanyRequest.updateProfessionalUserId = function(msg, cb) {
    var UserDetail = app.models.UserDetail;
    CompanyRequest.find({}, function(err, requests){
      //console.log(requests);
      requests.forEach(function(item){
        UserDetail.findOne({
          where: {
            email: item.email
          }
        }, function (err, user) {
          if(err){
            console.log(err)
          }

          if(user){
            CompanyRequest.update({id: item.id}, {professionalUserId: user.id});
          }

        });
      });
    });
    cb(null, 'Greetings... ' + msg);
  };

  CompanyRequest.remoteMethod(
    'updateProfessionalUserId',
    {
      accepts: {arg: 'msg', type: 'string'},
      returns: {arg: 'greeting', type: 'string'}
    }
  );
};
