var loopback = require('loopback');
var boot = require('loopback-boot');
var path = require('path');
var bodyParser = require('body-parser');
var http = require('http');
var https = require('https');
var sslConfig = require('./ssl-config');
var app = module.exports = loopback();

// configure view handler
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// configure body parser
app.use(bodyParser.urlencoded({extended: true, defer: true}));


app.start = function(httpOnly) {
  if(httpOnly === undefined) {
    httpOnly = process.env.HTTP;
  }
  var server = null;
  if(!httpOnly) {
    var options = {
      key: sslConfig.privateKey,
      cert: sslConfig.certificate
    };
    server = https.createServer(options, app);
  } else {
    server = http.createServer(app);
  }
  server.listen(app.get('port'), function() {
    var baseUrl = (httpOnly? 'http://' : 'https://') + app.get('host') + ':' + app.get('port');
    app.emit('started', baseUrl);
    console.log('LoopBack server listening @ %s%s', baseUrl, '/');
  });
  return server;
};

app.use(loopback.token({ model: app.models.AccessToken, currentUserLiteral: 'currentUser' }));

app.use(loopback.context());
//app.use(loopback.token());
app.use(function setCurrentUser(req, res, next) {
  if (!req.accessToken) {
    return next();
  }
  app.models.UserDetail.findById(req.accessToken.userId, function(err, user) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return next(new Error('No user with this access token was found.'));
    }
    var loopbackContext = loopback.getCurrentContext();
    if (loopbackContext) {
      loopbackContext.set('currentUser', user);
    }
    next();
  });
});

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function(err) {
  if (err) throw err;

  // start the server if `$ node server.js`
  if (require.main === module){
    //app.start();

    app.io = require('socket.io')(app.start());
    require('socketio-auth')(app.io, {
      authenticate: function (value, callback) {

        var AccessToken = app.models.AccessToken;
        //get credentials sent by the client
        var token = AccessToken.find({
          where:{
            and: [{ userId: value.userId }, { id: value.id }]
          }
        }, function(err, tokenDetail){
          if (err) throw err;
          if(tokenDetail.length){
            callback(null, true);
          }else{
            callback(null, false);
          }
        }); //find function..
      } //authenticate function..
    });

    app.io.on('connection', function(socket){
      console.log('a user connected');
      socket.on('disconnect', function(){
        console.log('user disconnected');
      });
    });
  }

});
