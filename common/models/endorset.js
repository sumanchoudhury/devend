var app = require('../../server/server');
var loopback = require('loopback');
var pubsub = require('../../server/pubsub.js');
var moment = require("moment");

var url = 'https://endorset.herokuapp.com/';

module.exports = function(Endorset) {
  Endorset.observe('before save', function setDefaultCreated(ctx, next) {
    if (ctx.instance) {
      ctx.instance.created = Date.now();
      ctx.instance.modified = Date.now();
    }
    if (ctx.currentInstance) {
      ctx.data.modified = Date.now();
    }
    next();
  });


  //Endorset after save..
  Endorset.observe('after save', function (ctx, next) {
    var Endorsement = app.models.Endorsement;
    var EndorserEndorsement = app.models.EndorserEndorsement;
    if(ctx.isNewInstance){
      Endorsement.update({id: ctx.instance.endorsementId}, {userProfileId: ctx.instance.userProfileId}, function(err, obj){if(err){console.log(err);}});
      EndorserEndorsement.update({id: ctx.instance.endorserEndorsementId}, {userProfileId: ctx.instance.userProfileId}, function(err, obj){if(err){console.log(err);}});
    }else{
      if (ctx.instance) {

      }
    }
    //Calling the next middleware..
    next();
  }); //after save..
};
