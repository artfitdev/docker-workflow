var express = require('express'),
    http = require('http'),
    redis = require('redis'),
    configKey = '0adff4342f3f87a9b584b88bbabbe9d1',
    configSecret  = '8eec31295b71c172c01260bff308fc46',
    app = express(),
    session = require('express-session'),
    Fitbit = require('fitbit'),
    
    redisStore = require('connect-redis')(session);
    bodyParser = require('body-parser');
    
var app = express();

var RedisClient = redis.createClient('6379', 'redis');

app.use(session({
    secret: 'ssshhhhh',
    // create new redis store.
    store: new redisStore({ host: 'redis', port: 6379, client: RedisClient,ttl :  260}),
    saveUninitialized: false,
    resave: false
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


console.log(process.env.REDIS_PORT_6379_TCP_ADDR + ':' + process.env.REDIS_PORT_6379_TCP_PORT);



// app.get('/', function(req, res, next) {
//   client.incr('counter', function(err, counter) {
//     if(err) return next(err);
//     res.send('This page has been viewed ' + counter + ' times!');
//   });
// });
//
 
//app.use(express.cookieParser());
//app
    //.use( session({secret: 'hekdhthigib', resave: false, saveUninitialized: true}));

 
// OAuth flow 
app.get('/', function (req, res) {

    if(req.session.key) {
        // if email key is sent redirect.
      res.redirect('/admin/fitbit');
    } else {
        // else go to home page.
      res.redirect('/stats');
    }
  
});


app.get("/fitbit/login", function (req, res) {

  // Create an API client and start authentication via OAuth 
  var client = new Fitbit(configKey, configSecret);
 
  client.getRequestToken(function (err, requesttoken, requesttokenSecret) {
    if (err) {
      // Take action  
      return;
    }
  
    RedisClient.hmset('OauthToken', {
      'RequestToken': requesttoken.toString(), 
      'RequestTokenSecret': requesttokenSecret.toString()
      }
    );    

    console.log('RequestToken: ' + requesttoken) 

    // req.session.oauth = {  
    //     requestToken: token
    //   , requestTokenSecret: tokenSecret
    // };
    res.redirect(client.authorizeUrl(requesttoken));
  });
});

 
// On return from the authorization 
app.get('/oauth/fitbit/callback', function (req, res) {

  var verifier = req.query.oauth_verifier    
    , fitbitclient = new Fitbit(configKey, configSecret);
  
  var oauthSettings;
  RedisClient.hgetall('OauthToken', function (err, oauthSettings){


    console.log('oauthSettings: ' + oauthSettings['RequestToken'] + '\n' + oauthSettings) 
     
    // Request an access token 
    fitbitclient.getAccessToken(
        oauthSettings['RequestToken']
      , oauthSettings['RequestTokenSecret']
      , verifier
      , function (err, token, secret) {
          if (err) {
            console.log('ERROR: ' + err);
            return;
          }

          console.log('Access Token ' + token);

          RedisClient.hmset('OauthToken', {
            'accessToken': token,
            'accessTokenSecret': secret
          }, function (err, reply){
            if (err) {
            // Take action 
            return;
          }
          });

   
          res.redirect('/stats');
        }
    );
  });
});
 
// Display some stats 
app.get('/stats', function (req, res) {

  
  RedisClient.hgetall('OauthToken', function(err, tokenHash) {
    var _accessToken = tokenHash['accessToken'],
    _accessTokenSecret = tokenHash ['accessTokenSecret']

    console.log(tokenHash);
    client = new Fitbit(
        configKey
      , configSecret
      , { // Now set with access tokens 
            accessToken: _accessToken
          , accessTokenSecret: _accessTokenSecret
          , unitMeasure: 'en_GB'
        }
    );
   
    // Fetch todays activities 
    client.getActivities(function (err, activities) {
      if (err) {
        // Take action 
        return;
      }
   
      // `activities` is a Resource model 
      var reponse = [
        {name: "Total Steps", value: activities.steps()},
        {name: "Total Floors", value: activities.floors()},
        //{name: "Total Activity Calories", value: activities.activityCalories()}
      ]

      res.json(reponse);
    });
  });
});

http.createServer(app).listen(process.env.PORT || 8080, function() {
  console.log('Listening on port ' + (process.env.PORT || 8080));
});