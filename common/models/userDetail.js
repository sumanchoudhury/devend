var app = require('../../server/server');
var config = require('../../server/config.json');
var cloudinary = require('cloudinary');
var path = require('path');
var bodyParser = require('body-parser');
var formidable = require('formidable');
var fs =require('fs-extra');

//app.use(bodyParser({defer: true}));

module.exports = function(UserDetail) {
// Set the username to the users email address by default.
  UserDetail.observe('before save', function setDefaultUsername(ctx, next) {


    if (ctx.instance) {
      if (ctx.instance.username === undefined) {
        ctx.instance.username = ctx.instance.email;
      }
      ctx.instance.status = 'created';
      ctx.instance.created = Date.now();
      ctx.instance.modified = Date.now();
    }
    if (ctx.currentInstance) {
      ctx.data.modified = Date.now();
    }
    next();
  });

  UserDetail.afterRemote('login', function(ctx, affectedModelInstance, next) {
    console.log( ctx.result.user);
    if(ctx.result.user.id != undefined){
      var InviteUser = ctx.Model.app.models.InviteUser;
      InviteUser.find({
        where: {
          userDetailId: affectedModelInstance.user.id,
          status: 1
        }
      }, function (err, acceptedInvitation) {
        if(err){
          console.log(err)
        }
        console.log(acceptedInvitation);
        if(acceptedInvitation){
          affectedModelInstance.user.acceptedInvitation = acceptedInvitation;
          ctx.result.user.acceptedInvitation = acceptedInvitation;
        }
        next();
      });
    } else {
      next();
    }

  });
  //send verification email after registration
  UserDetail.afterRemote('create', function(context, UserDetail, next) {
    console.log('> user.afterRemote triggered');
    var options = {
      type: 'email',
      to: UserDetail.email,
      from: 'noreply@endorset.com',
      subject: 'Thanks for registering.',
      template: path.resolve(__dirname, '../../server/views/verify.ejs'),
      redirect: '/verified',
      user: UserDetail,
      host: "endorset.herokuapp.com"
    };
    UserDetail.verify(options, function(err, response) {
      if (err) {
        console.log(err);
      } else {
        console.log('> verification email sent:', response);
      }
      next();
    });
  });

  UserDetail.on('resetPasswordRequest', function (info) {
    console.log(info.email); // the email of the requested user
    console.log(info.accessToken.id); // the temp access token to allow password reset

    // requires AccessToken.belongsTo(User)
    info.accessToken.user(function (err, userDetail) {
      //console.log(userDetail); // the actual user

    });
  });

  /*Upload files to Cloudinary*/
  UserDetail.upload = function (ctx, options, cb) {

    cloudinary.config({
      cloud_name: 'communycreation-ltd',
      api_key: '287336142959814',
      api_secret: 'jDfyNXsUaK8xkAXHMfHtKuCyxVc'
    });

    var form = new formidable.IncomingForm();
    //form.uploadDir = "./img";       //set upload directory
    form.keepExtensions = true;     //keep file extension

    form.parse(ctx.req, function(err, fields, files) {
      //console.log(fields);
      if(err){
        cb(err);
      }

      //TESTING
      /*console.log("file size: "+JSON.stringify(files.fileUploaded.size));
      console.log("file path: "+JSON.stringify(files.fileUploaded.path));
      console.log("file name: "+JSON.stringify(files.fileUploaded.name));
      console.log("file type: "+JSON.stringify(files.fileUploaded.type));
      console.log("astModifiedDate: "+JSON.stringify(files.fileUploaded.lastModifiedDate));
      */
      //Formidable changes the name of the uploaded file
      //Rename the file to its original name
      fs.rename(files.file.path, files.file.name, function(err) {
        if (err)
          cb(err);
        console.log('renamed complete');
      });
      cloudinary.uploader.upload(
        files.file.name,
        function(result) {
          var medium = cloudinary.url(result.public_id, { width: 100, height: 100, crop: "fill" });
          var mini = cloudinary.url(result.public_id, { width: 32, height: 32, crop: "fill" });
          //console.log(medium);
          UserDetail.update({id: fields.id},
            {
              fullImage: medium,
              thumbImage: mini,
              cloudinaryImageId: result.public_id
            }, function (err, user) {
              if(err){
                cb(err);
              }
              //console.log(user);
          });
          //console.log(result);
          cb(null, result);
        }
      );
    });

    /*cloudinary.config({
      cloud_name: 'communycreation-ltd',
      api_key: '287336142959814',
      api_secret: 'jDfyNXsUaK8xkAXHMfHtKuCyxVc'
    });

    console.log(ctx.req);
    cloudinary.uploader.upload(
      ctx.req.file,
      function(result) {
        console.log(result);
        cb(result);
      }
    );*/
    //console.log(ctx.req);

  };

  UserDetail.remoteMethod(
    'upload',
    {
      description: 'Uploads a file',
      accepts: [
        { arg: 'ctx', type: 'object', http: { source:'context' } },
        { arg: 'options', type: 'object', http:{ source: 'query'} }
      ],
      returns: {
        arg: 'result', type: 'object', root: true
      },
      http: {verb: 'post'}
    }
  );


};
