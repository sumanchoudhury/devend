var app = require('../../server/server');
var loopback = require('loopback');
var pubsub = require('../../server/pubsub.js');

module.exports = function(Notification) {

  // Returns null if the access token is not valid
  function getCurrentUserId() {
    var ctx = loopback.getCurrentContext();
    var currentUser = ctx && ctx.get('currentUser');
    //console.log('currentUser.id: ', currentUser.id);
    var userId = currentUser && currentUser.id;
    return userId;
  }

  Notification.observe('before save', function setDefaultCreated(ctx, next) {
    if (ctx.instance) {
      ctx.instance.created = Date.now();
      ctx.instance.modified = Date.now();
    }
    if (ctx.currentInstance) {
      ctx.data.modified = Date.now();
    }

    next();
  });

  //Notification after save..
  Notification.observe('after save', function (ctx, next) {
    var socket = Notification.app.io;
    if(ctx.isNewInstance){
      //Now publishing the data..
      pubsub.publish(socket, {
        collectionName : 'Notification',
        data: ctx.instance,
        method: 'POST'
      });
      //console.log(ctx.instance);

    }else{
      //Now publishing the data..
      if (ctx.instance) {
        pubsub.publish(socket, {
          collectionName : 'Notification',
          data: ctx.instance,
          modelId: ctx.instance.id,
          method: 'PUT'
        });

      }
      pubsub.notify(socket, 'common', ctx.instance);
    }
    //Calling the next middleware..
    next();
  }); //after save..

  //Endorsement before delete..
  Notification.observe("before delete", function(ctx, next){
    var socket = Notification.app.io;
    //Now publishing the data..
    pubsub.publish(socket, {
      collectionName : 'Notification',
      data: ctx.instance.id,
      modelId: ctx.instance.id,
      method: 'DELETE'
    });
    //move to next middleware..
    next();

  }); //before delete..

  Notification.observe('loaded', function (ctx, next) {
    var EndorsementCompany = app.models.EndorsementCompany;
    if(ctx.instance != undefined && ctx.instance.type){
      if(ctx.instance.type == 1){
        EndorsementCompany.findOne({
          where: {
            endorsementId: ctx.instance.modelId
          }
        }, function (err, company) {
          if (err) {
            console.log(err);
          }
          if (company) {
            ctx.instance.title += ' ' +company.companyName;
            ctx.instance.shortDescription += ' ' +company.companyName;
          }
        });

      }
    }

    next();
  });


  Notification.autoUpdate = function(msg, cb) {
    var EndorsementCompany = app.models.EndorsementCompany;
    Notification.find({where:{type: 1}}, function(err, notifications){
      notifications.forEach(function(item){
        EndorsementCompany.findOne({
          where: {
            endorsementId: item.modelId
          }
        }, function (err, company) {
          if(err){
            console.log(err)
          }

          if(company){
            Notification.update({id: item.id}, {title: 'You have a new endorsement request. Find your ex colleague at ' +company.companyName, shortDescription: 'You have a new endorsement request. Find your ex colleague at ' +company.companyName});
          }

        });
      });
    });
    cb(null, 'Greetings... ' + msg);
  };

  Notification.remoteMethod(
    'autoUpdate',
    {
      accepts: {arg: 'msg', type: 'string'},
      returns: {arg: 'greeting', type: 'string'}
    }
  );
};
