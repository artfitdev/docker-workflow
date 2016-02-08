var mongoose    = require('mongoose');
var Schema      = mongoose.Schema,
	ObjectId = Schema.ObjectId;
var Tracker     = require('./tracker');

var UserSchema   = new Schema({
	_id: ObjectId,
    email: String,
    password: String,
    token: String,
    trackers: [ Tracker ]
});



module.exports = mongoose.model('User', UserSchema);
