var express = require('express'),
  app = express(),
  http = require('http'),  
  port = 8083,
  jawboneAuth = {
       clientID: 'PO1vlJWHWPI',
       clientSecret: 'd9650ce5b08152caac453065d3ad7751b4ecae09',
       authorizationURL: 'https://jawbone.com/auth/oauth2/auth',
       tokenURL: 'https://jawbone.com/auth/oauth2/token',
       callbackURL: 'http://www.fotolite.net/jawbone/oauth/callback'
    },
  cookiesParser = require ( "cookie-parser" );

  var mongoose   = require("mongoose");
  mongoose.connect("mongodb://mongodb:27017");
  var User     = require('./models/User');

//  app.use(bodyParser.json());

app.get('/jawbone/sleepdata', ensureAuthorized, function(req, res) {

    User.findOne({token: req.token, 'trackers.type': 'jawbone'}, function(err, usertracker){
        if (err) {
            return done(err, null, console.log('Error with Mongo'));
        } else {
          console.log('DEBUG: ', req.token)
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
                    res.send(JSON.parse(body).data);
                  }
              });
          }
        }
      })
});

app.get('/jawbone/events/body', ensureAuthorized, function(req, res) {

  User.findOne({token: req.token, 'trackers.type': 'jawbone'}, function(err, usertracker){
      if (err) {
          return done(err, null, console.log('Error with Mongo'));
      } else {
          console.log('DEBUG: ', usertracker.trackers[0].oauthtoken);

          if (usertracker) {
              var options = {
                  access_token: usertracker.trackers[0].oauthtoken,
                  client_id: jawboneAuth.clientID,
                  client_secret: jawboneAuth.clientSecret
              };

              res.setHeader('Content-Type', 'application/json');

              up = require('jawbone-up')(options);

              up.events.body.get({}, function(err, bodydata) {
                  if (err) {
                      console.log('Error receiving Jawbone UP data');
                  } else {  
                      res.send(JSON.parse(bodydata).data); 
                  }
              });
          }
      }
  })
});

app.get('/jawbone/workouts', ensureAuthorized, function(req, res) {

  User.findOne({token: req.token, 'trackers.type': 'jawbone'}, function(err, usertracker){
      if (err) {
          return done(err, null, console.log('Error with Mongo'));
      } else {
          console.log('DEBUG: ', usertracker.trackers[0].oauthtoken);

          if (usertracker) {
              var options = {
                  access_token: usertracker.trackers[0].oauthtoken,
                  client_id: jawboneAuth.clientID,
                  client_secret: jawboneAuth.clientSecret
              };

              res.setHeader('Content-Type', 'application/json');

              up = require('jawbone-up')(options);

              up.workouts.get({}, function(err, bodydata) {
                  if (err) {
                      console.log('Error receiving Jawbone UP data');
                  } else {  
                      res.send(JSON.parse(bodydata).data); 
                  }
              });
          }
      }
  })
});

app.get('/jawbone/moves', ensureAuthorized, function(req, res) {

  User.findOne({token: req.token, 'trackers.type': 'jawbone'}, function(err, usertracker){
      if (err) {
          return done(err, null, console.log('Error with Mongo'));
      } else {
          console.log('DEBUG: ', usertracker.trackers[0].oauthtoken);

          if (usertracker) {
              var options = {
                  access_token: usertracker.trackers[0].oauthtoken,
                  client_id: jawboneAuth.clientID,
                  client_secret: jawboneAuth.clientSecret
              };

              res.setHeader('Content-Type', 'application/json');

              up = require('jawbone-up')(options);

              //check to see what do we have in the Store

              up.moves.get({}, function(err, bodydata) {
                  if (err) {
                      console.log('Error receiving Jawbone UP data');
                  } else {  
                      res.send(JSON.parse(bodydata).data); 
                  }
              });
          }
      }
  })
});

app.get('/jawbone/update', ensureAuthorized, function(req, res) {
  User.findOne({token: req.token, 'trackers.type': 'jawbone'}, function(err, usertracker){
      if (err) {
          return done(err, null, console.log('Error with Mongo'));
      } else {
          console.log('DEBUG: ', usertracker.trackers[0].oauthtoken);

          if (usertracker) {
              var options = {
                  access_token: usertracker.trackers[0].oauthtoken,
                  client_id: jawboneAuth.clientID,
                  client_secret: jawboneAuth.clientSecret
              };

              res.setHeader('Content-Type', 'application/json');

              up = require('jawbone-up')(options);

              //check to see what do we have in the Store

              up.moves.get({}, function(err, bodydata) {
                  if (err) {
                      console.log('Error receiving Jawbone UP data');
                  } else {  
                      // so here is we have data. Lets update Store
                      var Jawbone     = require('./models/jawbone');
                      var newJawbone = new Jawbone();
                      newJawbone.tracker_id = usertracker.trackers[0]._id;
                      newJawbone.updated_after = Date.now().getUnixTime();
                      
                  }
              });
          }
      }
  })

});

app.get('/', function(req, res) {
 console.log(' Hit /');
 res.body= 'hello';
});



var Server = http.createServer(app).listen(port, function(){
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
    else if (typeof req.cookies !== 'undefined') {
      if (typeof req.cookies.JWT_TOKEN !== 'undefined')
      {
        var bearer = req.cookies.JWT_TOKEN;
        bearerToken = bearer;
        req.token = bearerToken;
        next();
      }
    }
    else
    {
      console.log ('User unauthorized', req.headers)
      res.send(403);
    }
    
}