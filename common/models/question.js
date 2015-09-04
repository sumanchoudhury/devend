var app = require('../../server/server');
var pubsub = require('../../server/pubsub.js');
var loopback = require('loopback');

var url = 'https://endorset.herokuapp.com/';

module.exports = function(Question) {
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

  Question.observe('before save', function setDefaultCreated(ctx, next) {
    if (ctx.instance) {
      ctx.instance.created = Date.now();
      ctx.instance.modified = Date.now();
    }

    var UserDetail = ctx.Model.app.models.UserDetail;
    var EndorserEndorsement = ctx.Model.app.models.EndorserEndorsement;
    var Notification = ctx.Model.app.models.Notification;
    var Question2 = ctx.Model.app.models.Question;
    //var url = app.get('url');

    if(ctx.currentInstance) {
      ctx.data.modified = Date.now();

      //seen at hook
      if(ctx.data.seenAt) {
        ctx.data.seenAt = Date.now();

        Question2.findOne({
          where: {
            id: ctx.currentInstance.id
          },
          include: [
            'hrDetail',
            //'userDetail',
            {
              endorserEndorsement: "userDetail"
            },
            {
              endorsement: "userDetail"
            }
          ]
        }, function (err, question) {
          if (err) {
            console.log(err);
          } else {
            var questionJson = question.toJSON();
            //creating notifications
            Notification.create({
              title: 'Your question about '+questionJson.endorserEndorsement.userDetail.firstName + ' ' +questionJson.endorserEndorsement.userDetail.lastName +' has been seen',
              shortDescription: 'Your question about '+questionJson.endorserEndorsement.userDetail.firstName + ' ' +questionJson.endorserEndorsement.userDetail.lastName +' has been seen',
              model: 'CompanyRequest',
              modelId: ctx.currentInstance.id,
              userDetailId: questionJson.hrDetail.id,
              createdBy: getCurrentUserId(),
              isViewed: false,
              type: 10
            }, function (err, obj) {
              if (err) {
                console.log(err);
              }
              //console.log(obj);
            });


            app.models.Email.send({
              to: questionJson.hrDetail.email,
              from: 'noreply@endorset.com',
              subject: 'Your question has been seen',
              text: 'Your question has been seen',
              html: 'Your question has been seen.<br />To view <a href="' + url + '#/questions/' + ctx.currentInstance.id + '">Click here</a>'
            }, function (err, mail) {
              console.log('email sent!');

            });
          }
        });
      }


      //send question to endorser
      if(ctx.data.isDraft == false && ctx.data.endorserId == 0){
        EndorserEndorsement.findOne({
          where: {
            id: ctx.currentInstance.endorserEndorsementId
          },
          include: [
            'userDetail',
            {
              endorsement: "userDetail"
            }
          ]
        }, function(err, endorsement) {
          if(err){
            console.log(err);
          } else {
            var endorsementJson = endorsement.toJSON();

            Notification.create({
              title: 'You have received a question about ' + endorsementJson.endorsement.userDetail.firstName +' '+ endorsementJson.endorsement.userDetail.lastName,
              shortDescription: 'You have received a question about ' + endorsementJson.endorsement.userDetail.firstName +' '+ endorsementJson.endorsement.userDetail.lastName,
              model: 'Question',
              modelId: ctx.currentInstance.id,
              userDetailId: endorsementJson.userDetail.id,
              createdBy: getCurrentUserId(),
              isViewed: false,
              type: 9
            }, function(err, obj){
              if(err){
                console.log(err);
              }
              //console.log(obj);
            });

            app.models.Email.send({
              to: endorsementJson.userDetail.email,
              from: 'noreply@endorset.com',
              subject: 'New Questions',
              text: 'HR asked you a new question.',
              html: 'HR asked you a new question..<br />To view <a href="'+url+'#/questions/'+ ctx.currentInstance.id+'">Click here</a>'
            }, function(err, mail) {
              console.log('email sent!');

            });

          }

        });
      }

      //send answer to hr
      if(ctx.data.isDraft == false && ctx.data.hrId == 0){
        Question2.findOne({
          where: {
            id: ctx.currentInstance.replyId
          },
          include: [
            'hrDetail',
            {
              endorserEndorsement: "userDetail"
            },
            {
              endorsement: "userDetail"
            }
          ]
        }, function(err, question) {
          if(err){
            console.log(err);
          } else {
            var questionJson = question.toJSON();
            //creating notifications
            Notification.create({
              title: questionJson.endorserEndorsement.userDetail.firstName + ' ' +questionJson.endorserEndorsement.userDetail.lastName +' replied to your question about '+questionJson.endorsement.userDetail.firstName + ' ' +questionJson.endorsement.userDetail.lastName,
              shortDescription: questionJson.endorserEndorsement.userDetail.firstName + ' ' +questionJson.endorserEndorsement.userDetail.lastName +' replied to your question about '+questionJson.endorsement.userDetail.firstName + ' ' +questionJson.endorsement.userDetail.lastName,
              model: 'Question',
              modelId: ctx.currentInstance.id,
              userDetailId: questionJson.hrDetail.id,
              createdBy: getCurrentUserId(),
              isViewed: false,
              type: 10
            }, function(err, obj){
              if(err){
                console.log(err);
              }
              //console.log(obj);
            });

            app.models.Email.send({
              to: questionJson.hrDetail.email,
              from: 'noreply@endorset.com',
              subject: 'New Answer',
              text: 'Endorser reply your question.',
              html: 'Endorser reply your question.<br />To view <a href="'+url+'#/questions/'+ ctx.currentInstance.id+'">Click here</a>'
            }, function(err, mail) {
              console.log('email sent!');

            });

          }

        });
      }
    }
    next();
  });

  //Notification after save..
  Question.observe('after save', function (ctx, next) {
    var socket = Question.app.io;
    if(ctx.isNewInstance){
      //Now publishing the data..
      pubsub.publish(socket, {
        collectionName : 'Question',
        data: ctx.instance,
        method: 'POST'
      });
    }else{
      //Now publishing the data..
      if (ctx.instance) {
        pubsub.publish(socket, {
          collectionName : 'Question',
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


  //send verification email after create
  Question.afterRemote('create', function(context, Question, next) {
    var UserDetail = app.models.UserDetail;
    var EndorserEndorsement = app.models.EndorserEndorsement;
    var Notification = app.models.Notification;
    var Question2 = app.models.Question;

    //var url = app.get('url');
    //message to endorser
    if(Question.isDraft == false && Question.endorserId == 0){
      EndorserEndorsement.findOne({
        where: {
          id: Question.endorserEndorsementId
        },
        include: [
          'userDetail',
          {
            endorsement: "userDetail"
          }
        ]
      }, function(err, endorsement) {
        if(err){
          console.log(err);
        } else {
          //console.log(endorsement);
          var endorsementJson = endorsement.toJSON();
          //console.log(endorsementJson.userDetail);
          //console.log(endorsementJson.endorsement.userDetail);

          //creating notifications
          Notification.create({
            title: 'You have received a question about ' + endorsementJson.endorsement.userDetail.firstName +' '+ endorsementJson.endorsement.userDetail.lastName,
            shortDescription: 'You have received a question about ' + endorsementJson.endorsement.userDetail.firstName +' '+ endorsementJson.endorsement.userDetail.lastName,
            model: 'Question',
            modelId: Question.id,
            userDetailId: endorsementJson.userDetail.id,
            createdBy: getCurrentUserId(),
            isViewed: false,
            type: 9
          }, function(err, obj){
            if(err){
              console.log(err);
            }
            //console.log(obj);
          });

          app.models.Email.send({
            to: endorsementJson.userDetail.email,
            from: 'noreply@endorset.com',
            subject: 'New Questions',
            text: 'HR asked you a new question.',
            html: 'HR asked you a new question..<br />To view <a href="'+url+'#/questions/'+Question.id+'">Click here</a>'
          }, function(err, mail) {
            console.log('email sent!');

          });
        }

      });
    }

    //message to hr
    if(Question.isDraft == false && Question.hrId == 0){

      Question2.findOne({
        where: {
          id: Question.replyId
        },
        include: [
          'hrDetail',
          {
            endorserEndorsement: "userDetail"
          },
          {
            endorsement: "userDetail"
          }
        ]
      }, function(err, question) {
        if(err){
          console.log(err);
        } else {
          //console.log(question);
          var questionJson = question.toJSON();
          //console.log(questionJson);
          //creating notifications
          Notification.create({
            title: questionJson.endorserEndorsement.userDetail.firstName + ' ' +questionJson.endorserEndorsement.userDetail.lastName +' replied to your question about '+questionJson.endorsement.userDetail.firstName + ' ' +questionJson.endorsement.userDetail.lastName,
            shortDescription: questionJson.endorserEndorsement.userDetail.firstName + ' ' +questionJson.endorserEndorsement.userDetail.lastName +' replied to your question about '+questionJson.endorsement.userDetail.firstName + ' ' +questionJson.endorsement.userDetail.lastName,
            model: 'Question',
            modelId: Question.id,
            userDetailId: questionJson.hrDetail.id,
            createdBy: getCurrentUserId(),
            isViewed: false,
            type: 10
          }, function(err, obj){
            if(err){
              console.log(err);
            }
            //console.log(obj);
          });

          app.models.Email.send({
            to: questionJson.hrDetail.email,
            from: 'noreply@endorset.com',
            subject: 'New Answer',
            text: 'Endorser sent you answer.',
            html: 'Endorser sent you answer.<br />To view <a href="'+url+'#/questions/'+Question.id+'">Click here</a>'
          }, function(err, mail) {
            console.log('email sent!');

          });

        }

      });
    }

    next();
  });
};
