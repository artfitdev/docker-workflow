var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TrackerSchema = new Schema({
        
        type: String,
        name: String,
        oauthtoken: String,
        oauthrefreshtoken: String
});

module.exports = TrackerSchema;