var request = 	require('request');
var schedule = require('node-schedule');

var rule = new schedule.RecurrenceRule();
rule.dayOfWeek = [0, new schedule.Range(1, 5)];
rule.hour = 1;
rule.minute = 00;


var sendMessage = function(message){
	var restKey = 'MTMyYWY4NjktMzlmZi00MjQ0LWI2NzAtNzlmNWMyZWQ1YjRj';
	var appID = 'b0963a36-5d81-44c5-89bb-06f55c3fec1e';
	var date = new Date()
	date.setDate(date.getDate() + 1)
	date.setHours(5)
	date.setMinutes(30)
	date.setSeconds(0)
	request(
		{
			method:'POST',
			uri:'https://onesignal.com/api/v1/notifications',
			headers: {
				"authorization": "Basic "+restKey,
				"content-type": "application/json"
			},
			json: true,
			body:{
				'app_id': appID,
				'contents': message,
				'delivery_time_of_day': '7:30AM',
				'delayed_option' : 'timezone',
				'included_segments' : ['All'],
				'send_after' : date.toString()
				/*,
				'include_player_ids': Array.isArray(device) ? device : [device] */
			}
		},
		function(error, response, body) {
			console.log(body);
		}
	);
}

var j = schedule.scheduleJob(rule, function(){
  sendMessage({'en': 'Your outfits are ready for today :)', 'fr': 'Vos tenues sont prêtes pour aujourdhui :)'});
});

//sendMessage({'en': 'Your outfits are ready for today :)', 'fr': 'Vos tenues sont prêtes pour aujourdhui :)'});