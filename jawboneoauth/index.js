var express = require('express'),
  app = express(),
  https = require('https'),
  fs = require('fs'),
  passport = require('passport'),
  JawboneStrategy = require('passport-oauth').OAuth2Strategy,
  port = 8081,  
  mongoose   = require("mongoose"),

  jawboneAuth = {
       clientID: 'PO1vlJWHWPI',
       clientSecret: 'd9650ce5b08152caac453065d3ad7751b4ecae09',
       authorizationURL: 'https://jawbone.com/auth/oauth2/auth',
       tokenURL: 'https://jawbone.com/auth/oauth2/token',
       callbackURL: 'https://www.fotolite.net/jawbone/oauth/callback'
    },
  sslOptions = {
    key: fs.readFileSync('./server.key'),
    cert: fs.readFileSync('./server.crt')
  },
  cookiesParser = require ( "cookie-parser" ),
  User     = require('./models/User');


  mongoose.connect("mongodb://mongodb:27017");

//  app.use(bodyParser.json());

  app.use(express.static(__dirname + '/public'));
  app.use(cookiesParser());


// ----- Passport set up ----- //
app.use(passport.initialize());

app.get('/jawbone/login', 
  ensureAuthorized,
  passport.authorize('jawbone', {
    scope: ['basic_read','sleep_read'],
    failureRedirect: '/'
  })
);

app.get('/jawbone/oauth/callback',ensureAuthorized,
  passport.authorize('jawbone', {
        scope: ['basic_read','sleep_read'],
        failureRedirect: '/'
      }), function(req, res) {
        res.redirect('/#/me');
      }
  
);

app.get('/jawbone/sleepdata', function(req, res) {

    console.log(' Hit /jawbone/sleepdata');

    User.findOne({token: req.token, 'trackers.type': 'jawbone'}, function(err, usertracker){
        if (err) {
            return done(err, null, console.log('Error with Mongo'));
        } else {
          console.log('DEBUG: ', tracker)
          if (usertracker) {
              var options = {
                access_token: usertracker.trackers[0].oauthtoken,
                client_id: jawboneAuth.clientID,
                client_secret: jawboneAuth.clientSecret
              },
              up = require('jawbone-up')(options);

              up.sleeps.get({}, function(err, body) {
                  if (err) {
                    console.log('Error receiving Jawbone UP data');
                  } else {
                    res.json = JSON.parse(body).data;
                  }
              });
          }
        }
      })
});

app.get('/jawbone/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

app.get('/jawbone/', function(req, res) {
  
    console.log(' Hit /jawbone/');

});

passport.use('jawbone', new JawboneStrategy({
  clientID: jawboneAuth.clientID,
  clientSecret: jawboneAuth.clientSecret,
  authorizationURL: jawboneAuth.authorizationURL,
  tokenURL: jawboneAuth.tokenURL,
  callbackURL: jawboneAuth.callbackURL,
  passReqToCallback : true
}, function(req, token, refreshToken, profile, done) {

  // we need to record this token
  
  User.findOne({token: req.token}, function(err, user) {
      if (err) {
        return done(err, null, console.log('Error with Mongo'));
      } else {
          if (user) {
            // user was found
            console.log('DEBUG ', user);
            
            User.findOne({token: req.token, 'trackers.type': 'jawbone'}, function(err, tracker){
              if (err) {
                  return done(err, null, console.log('Error with Mongo'));
              } else {
                console.log('DEBUG: ', tracker)
                if (tracker) {

                  //found tracker lets udpate
                  tracker.type = 'jawbone';

                  tracker.name='Name';
                  tracker.oauthtoken = token;
                  tracker.oauthrefreshtoken = refreshToken;
                  tracker.save(function (err) {
                    if (err) {
                      console.log('new tracker record failed' + err); 
                    }
                  });

                }
                else
                {
                  //need to add new tracker
                  user.trackers.push(
                    {type: 'jawbone', name: 'jawbone', oauthtoken: token, oauthrefreshtoken: refreshToken});
                  user.save(function (err) {
                    if (err) {
                      console.log('user.trackers.push failed ' + err);
                    }
                  });
                }
              }
            });

          }
          else
          {
            // user was not found 
            return done(err, options, console.log('Error finding user, broken JWT token maybe'));

          }
      }
  }  );



  req.OAuth2Token = token;
  req.OAuth2RefreshToken = refreshToken;

  var options = {
      access_token: token,
      client_id: jawboneAuth.clientID,
      client_secret: jawboneAuth.clientSecret
    }    

    return done(null, options, console.log('Jawbone UP data ready to be displayed.'));
  }
));


var secureServer = https.createServer(sslOptions, app).listen(port, function(){
    console.log('UP server listening on ' + port);
});

function ensureAuthorized(req, res, next) {
    var bearerToken;

    var bearerHeader = req.headers["authorization"];
    if (typeof bearerHeader !== 'undefined') {
        var bearer = bearerHeader.split(" ");
        bearerToken = bearer[1];
        req.token = bearerToken;
        next();
    }
    else if (typeof req.cookies.JWT_TOKEN !== 'undefined')
    {
      var bearer = req.cookies.JWT_TOKEN;
      bearerToken = bearer;
      req.token = bearerToken;
      next();
    }
    else {
        console.log ('User unauthorized')
        res.send(403);
    }
}