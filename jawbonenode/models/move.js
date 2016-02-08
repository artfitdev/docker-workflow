var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var MoveSchema = new Schema({ 

        xid: String,
        title: String,
        type: String,
        time_created: Number,
        time_updated: Number,
        time_completed: Number,
        date: Number,
		snapshot_image: String, //Link to the image of this move event (relative, add prefix https://jawbone.com)
		distance:Number,	//Distance travelled, in meters.
		km:Number, //Distance travelled, in kilometers.
		steps:Number, //	Number of steps taken.
		active_time:Number, //	Total active time for move, in seconds.
		longest_active:Number, //	Longest consecutive active period, in seconds.
		inactive_time:Number, //	Total inactive time for move, in seconds.
		longest_idle:Number, //	Longest consecutive inactive period, in seconds.
		calories:Number, //	Total calories burned. This is computed by this formula: wo_calories+bg_calories+bmr_day / 86400 * active_time
		bmr_day:Number, //	Estimated basal metabolic rate for entire day, in calories.
		bmr:Number, //	Estimated basal metabolic rate at current time. For previous days should approximately equal bmr_day.
		bg_calories:Number, //	Calories directly from UP band activity outside the context of a workout.
		wo_calories:Number, //	Calories burned from workouts.
		wo_time:Number, //	Total time spent in workouts, in seconds.
		wo_active_time:Number, //	Actual active time during workout (where user was stepping) in seconds.
		wo_count:Number, //	Number of workouts logged during this move.
		wo_longest:Number, //	Longest workout period, in seconds.
		sunrise:Number, //	Epoch timestamp of sunrise.
		sunset:Number, //	Epoch timestamp of sunset.
		tz:String, //	Time zone when this event was generated. Whenever possible, Olson format (e.g., "America/Los Angeles") will be returned, otherwise the GMT offset (e.g., "GMT+0800") will be returned.
		tzs: [{timestamp: Number, timezone: Number}], //	Move can have more than one timezone associated with it if the user has crossed timezone in the given day. Epoch timestamp for the period starting in that time zone, and the time zone string.
		hourly_totals: [{
			distance: Number, 
			calories: Number,
			steps: Number,
			active_time: Number,
			inactive_time:Number,
			longest_active_time: Number,
			longest_idle_time: Number }],
		ticks: [{
			distance: Number,
			time_completed: Number,
			active_time: Number, 
         	calories: Number, 
         	steps: Number, 
         	time: Number, 
         	speed: Number }] //	Data broken out by hour (values as above).		

});


module.exports =  MoveSchema;