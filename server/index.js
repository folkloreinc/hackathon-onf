var CONFIG = require('./config');

var Twilio = require('./twilio');
var express = require('express'),
    app = express(),
	server = require('http').createServer(app),
	io = require('socket.io').listen(server, {
		'flash policy server' : false
	});

app.configure(function() {
    app.use(express.compress());
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(__dirname + '/remote'));
});
app.enable("jsonp callback");

server.listen(CONFIG.port);

io.set('log level', 2);

//Configure Socket.io
io.configure('production', function(){
	io.set('log level', 1);
	io.enable('browser client minification');
	io.enable('browser client gzip');
});


var restClient = new Twilio.RestClient(CONFIG.twilio.SID, CONFIG.twilio.TOKEN);

var computers = {};
var remotes = {};

var clientsCount = 0;

//Handle socket.io
io.sockets.on('connection', function (socket) {

	clientsCount++;
	socket.clientIndex = clientsCount;

	//Send token to mobile
	socket.on('sendTokenBySMS', function (number) {

		var url = 'http://localhost:9000/remote.html?id='+socket.id;

		restClient.sendSms(CONFIG.twilio.FROM,number,url);

	});

	//Send token to mobile
	socket.on('setComputer', function (data,cb) {
		socket.computerID = ((10000 + socket.clientIndex)+'').substr(1);
		socket.currentData = data;
		socket.remotes = [];
		computers[socket.computerID] = socket;
		cb(socket.computerID);
	});

	//Send data to remote
	socket.on('updateData', function (data) {
		console.log('updateData');
		socket.currentData = data;
		if(socket.remotes) {
			for(var i = 0; i < socket.remotes.length; i++) {
				try {
					socket.remotes[i].emit('event','data',data || null);
				}catch(e){}
			}
		}
	});

	//Send token to mobile
	socket.on('setRemote', function (token,cb) {
		console.log('setRemote',token);
		if(!computers[token]) {
			cb(false);
			return;
		}
		socket.computer = computers[token];
		socket.computer.remotes.push(socket);
		socket.emit('event','data',socket.computer.currentData);
		cb(true);
		socket.computer.emit('hasRemote');
	});

	//Send token to mobile
	socket.on('sendCommand', function (method,data) {
		if(socket.computer) {
			socket.computer.emit('command',method,data || null);
		}

	});

	//Send token to mobile
	socket.on('sendEvent', function (type,data) {
		if(socket.remotes && socket.remotes.length) {
			for(var i = 0; i < socket.remotes.length; i++) {
				try {
					socket.remotes[i].emit('event',type,data || null);
				}catch(e){}
			}
		}

	});

	//When a user disconnect
	socket.on('disconnect', function () {

		if(socket.computer && socket.computer.remotes) {
			var remotes = [];
			for(var i = 0; i < socket.computer.remotes.length; i++) {
				if(socket.id != socket.computer.remotes[i].id) {
					remotes.push(socket.computer.remotes[i]);
				}
			}
			socket.computer.remotes = remotes;
		}

		if(socket.remotes && socket.remotes.length) {
			for(var i = 0; i < socket.remotes.length; i++) {
				try {
					socket.remotes[i].emit('computerDisconnect');
				}catch(e){}
			}
		}

		if(socket.computerID && computers[socket.computerID]) {
			computers[socket.computerID] = null;
			delete computers[socket.computerID];
		}
	});

});