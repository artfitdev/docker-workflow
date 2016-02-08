var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var jawbone     = require('./jawbone');

var TrackerSchema = new Schema({
        _id: Schema.ObjectId,        
        type: String,
        name: String,
        oauthtoken: String,
        oauthrefreshtoken: String        
});

module.exports = TrackerSchema;