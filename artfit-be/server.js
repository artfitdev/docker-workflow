// Required Modules
var express    = require("express");
var morgan     = require("morgan");
var bodyParser = require("body-parser");
var jwt        = require("jsonwebtoken");
var mongoose   = require("mongoose");
var app        = express();

var port = process.env.PORT || 8082;
var User     = require('./models/User');
var JWT_SECRET = 'shshshshshshshshsh';

// Connect to DB
mongoose.connect("mongodb://mongodb:27017");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan("dev"));
app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
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
                    console.log('Creating new user');
                    userModel.save(function(err, user) {
                        user.token = jwt.sign(user, JWT_SECRET);
                        user.save(function(err, user1) {
                            res.json({
                                type: true,
                                data: user1,
                                token: user1.token                            
                            });
                            console.log(user1 + '\n' + user1.token);
                        });

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

app.get('/api/jawbone/sleepdata', ensureAuthorized, function(req, res) {
    $http.get()
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

// Start Server
app.listen(port, function () {
    console.log( "Express server listening on port " + port);
});