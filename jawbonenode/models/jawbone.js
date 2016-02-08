var mongoose    = require('mongoose');
var Schema      = mongoose.Schema,
	ObjectId = Schema.ObjectId;
var Move     = require('./move');

var JawboneSchema   = new Schema({
	tracker_id: ObjectId,
	updated_after: Number, //Epoch time of last update call.
	Moves: [Move]
});

module.exports = mongoose.model('Jawbone', JawboneSchema);