var express = require('express'),
    http = require('http'),
    redis = require('redis'),
    configKey = '0adff4342f3f87a9b584b88bbabbe9d1',
    configSecret  = '8eec31295b71c172c01260bff308fc46',
    app = express(),
    session = require('express-session'),
    Fitbit = require('fitbit'),
    cookieParser = require('cookie-parser'),
    redisStore = require('connect-redis')(session);
    
    
var app = express();

var RedisClient = redis.createClient('6379', 'redis');

//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(session({
    secret: 'ssshhhhhsomethingverylong',
    // create new redis store.
    store: new redisStore({ host: 'redis', port: 6379, client: RedisClient,ttl :  260}),
    saveUninitialized: true,
    resave: true
}));

console.log(process.env.REDIS_PORT_6379_TCP_ADDR + ':' + process.env.REDIS_PORT_6379_TCP_PORT);
 
// OAuth flow 
app.get('/fitbit', function (req, res) {

    if(req.session.accessToken) {
        // if email key is sent redirect.      
      res.redirect('/stats');      
    } else {
        // else go to home page.
      req.session.somevalue="Somevalue"
      res.redirect('/fitbit/login');

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

    req.session.RequestToken = requesttoken.toString();
    req.session.RequestTokenSecret = requesttokenSecret.toString();
    
    

    console.log('RequestToken: ' + requesttoken) 
    console.log('Session: ' + JSON.stringify( req.session) )

    res.redirect(client.authorizeUrl(requesttoken));
  });
});

 
// On return from the authorization 
app.get('/fitbit/oauth/callback', function (req, res) {

  var verifier = req.query.oauth_verifier    
    , fitbitclient = new Fitbit(configKey, configSecret);
  
  var oauthSettings;

    console.log('oauthSettings: ' + req.session.RequestToken + '\n' + req.session.RequestTokenSecret) 
    console.log('\nCallback Session: ' + JSON.stringify( req.session))

    // Request an access token 
    fitbitclient.getAccessToken(
      req.session.RequestToken,
      req.session.RequestTokenSecret,
      verifier,
      function (err, token, secret) {
          if (err) {
            console.log('ERROR: ' + err);
            return;
          }

          console.log('Access Token ' + token+ '\n' + 'Secrete' + secret);

          req.session.accessToken = token
          req.session.accessTokenSecret = secret

          console.log('\nRedirecting to stats ' );
          res.redirect('/fitbit/stats');
        }
    );
//  });
});
 
// Display some stats 
app.get('/fitbit/stats', function (req, res) {

  client = new Fitbit(
      configKey
    , configSecret
    , { // Now set with access tokens 
          accessToken: req.session.accessToken
        , accessTokenSecret: req.session.accessTokenSecret
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

http.createServer(app).listen(process.env.PORT || 8080, function() {
  console.log('Listening on port ' + (process.env.PORT || 8080));
});