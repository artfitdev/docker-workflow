// Required Modules
var express    = require("express");
var morgan     = require("morgan");
var bodyParser = require("body-parser");
var jwt        = require("jsonwebtoken");
var mongoose   = require("mongoose");
var app        = express();
var fs = require('fs');


var port = 8082;
var User     = require('./models/User');
var JWT_SECRET = 'shshshshshshshshsh';

//var https = require('https');
var sslOptions = {
    key: fs.readFileSync('./server.key'),
    cert: fs.readFileSync('./server.crt')
  };
var https = require('https');

// Connect to DB
mongoose.connect("mongodb://mongodb:27017");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan("dev"));
app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, accept, access-control-allow-methods, access-control-allow-origin, authorization');
    next();
});



app.post('/api/authenticate', function(req, res) {
    User.findOne({email: req.body.email, password: req.body.password}, function(err, user) {
        if (err) {
            res.json({
                type: false,
                data: "Error occured: " + err
            });
        } else {
            if (user) {
               res.json({
                    type: true,
                    data: user,
                    token: user.token
                }); 
            } else {
                res.json({
                    type: false,
                    data: "Incorrect email/password"
                });    
            }
        }
    });
});


app.post('/api/signin', function(req, res) {
    console.log('New User email: ' + req.body.email);
    User.findOne({email: req.body.email, password: req.body.password}, 
        function(err, user) {

            if (err) {
                res.json({
                    type: false,
                    data: "Error occured: " + err
                });
            } else {
                if (user) {
                    res.json({
                        type: false,
                        data: "User already exists!"
                    });
                } else {

                    var userModel = new User();
                    userModel.email = req.body.email;
                    userModel.password = req.body.password;
                    userModel.token = jwt.sign({'email':req.body.email, 'password': req.body.password}, JWT_SECRET);

                    console.log('Creating new user');

                    userModel.save(function(err, user) {
                        if (err) {
                            console.log("ERROR: ", err);
                            res.json({
                            type: false,
                            data: "Error updating token in the DataBase"                            
                            });
                        } else {
                            res.json({
                                type: true,
                                data: user,
                                token: user.token                            
                            });
                        }
                        
                    });


                    console.log('New User created');
                }
            }
    });
    console.log("Done User additions")
});

app.get('/api/me', ensureAuthorized, function(req, res) {
    User.findOne({token: req.token}, function(err, user) {
        if (err) {
            res.json({
                type: false,
                data: "Error occured: " + err
            });
        } else {
            res.json({
                type: true,
                data: user
            });
        }
    });
});

app.get('/api/jawbone', ensureAuthorized, function(req, res) {
    User.findOne({token: req.token, 'trackers.type': 'jawbone'}, function(err, user) {
        if (err) {
            res.json({
                type: false,
                data: "Error occured: " + err
            });
        } else {
            res.json({
                type: true,
                trackerType: user.trackers[0].type, 
                trackerName: user.trackers[0].name 
            });
        }
    });
});

app.get('/api/jawbone/data', ensureAuthorized, function(req, res) {
    //this is where we need to get generic health data from our DB's

    

    //Temp: Lets hit Jawbone service sleepdata for now
    var jawboneAuth = {
       clientID: 'PO1vlJWHWPI',
       clientSecret: 'd9650ce5b08152caac453065d3ad7751b4ecae09',
       authorizationURL: 'https://jawbone.com/auth/oauth2/auth',
       tokenURL: 'https://jawbone.com/auth/oauth2/token',
       callbackURL: 'http://www.fotolite.net/jawbone/oauth/callback'
    };

    User.findOne({token: req.token, 'trackers.type': 'jawbone'}, function(err, usertracker){
        if (err) {
            return done(err, null, console.log('Error with Mongo'));
        } else {
          console.log('DEBUG: ', usertracker.trackers[0].oauthtoken)
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
                        res.setHeader('Content-Type', 'application/json');

                        res.send(JSON.parse(body).data);
                        console.log ('Getting sleep data');
                        
                  }
              });
          }
        }
      })


});

function ensureAuthorized(req, res, next) {
    var bearerToken;
    var bearerHeader = req.headers["authorization"];
    //TODO check if
    if (typeof bearerHeader !== 'undefined') {
        var bearer = bearerHeader.split(" ");
        bearerToken = bearer[1];
        req.token = bearerToken;
        next();
    } else {
        res.send(403);
    }
}

process.on('uncaughtException', function(err) {
    console.log(err);
});

var secureServer = https.createServer(sslOptions, app).listen(port, function(){
    console.log('UP server listening on ' + port);
});

// Start Server
//app.listen(port, function () {
//    console.log( "Express server listening on port " + port);
//});