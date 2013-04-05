module.exports = exports = {

	'port' : process.env.NODE_ENV == 'production' ? 80:9001,

	'twilio' : {
		'SID' : '',
		'TOKEN' : '',
		'FROM' : ''
	}

};