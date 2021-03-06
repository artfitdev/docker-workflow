var mongoose    = require('mongoose');
var Schema      = mongoose.Schema;
	
var Tracker     = require('./tracker');

var UserSchema   = new Schema({	
	name: String,
    email: String,
    password: String,
    token: String,
    trackers: [ Tracker ]
});



module.exports = mongoose.model('User', UserSchema);
