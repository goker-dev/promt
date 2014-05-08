var express = require('express'),
    app = express(), // Web framework to handle routing requests
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    cons = require('consolidate'), // Templating library adapter for Express
    swig = require('swig'), // Templating library adapter for Express
    MongoClient = require('mongodb').MongoClient, // Driver for connecting to MongoDB
    routes = require('./routes'); // Routes for our application

io.sockets.on('connection', function (socket) {
    socket.emit('news', {
        hello: 'world'
    });
    socket.on('my other event', function (data) {
        console.log(data);
    });
});

// usernames which are currently connected to the chat
var usernames = {};

// rooms which are currently available in chat
var rooms = ['design', 'development', 'general'];

io.sockets.on('connection', function (socket) {

    // when the client emits 'adduser', this listens and executes
    socket.on('adduser', function (username) {
        // store the username in the socket session for this client
        socket.username = username;
        // store the room name in the socket session for this client
        //socket.room = 'general';
        // add the client's username to the global list
        //usernames[username] = username;
        socket.join(username);
        //socket.join('general');
        // echo to client they've connected
        socket.emit('serverlog', 'SERVER', 'hello, ' + username);
        socket.emit('serverlog', 'SERVER', 'you have connected to server');
        socket.emit('serverlog', 'SERVER', 'please, join a room from right side and start chat!');
        // echo to room 1 that a person has connected to their room
        //socket.broadcast.to('general').emit('updatechat', 'SERVER', username + ' has connected to this room');
        socket.emit('updaterooms', rooms);
    });



    // when the client emits 'sendchat', this listens and executes
    socket.on('sendchat', function (room, data) {
        // we tell the client to execute 'updatechat' with 2 parameters
        io.sockets.in(room).emit('chatlog', room, socket.username, data);
    });

    socket.on('joinRoom', function (room) {
        socket.join(room);
        socket.broadcast.to(room).emit('chatlog', room, 'SERVER', socket.username + ' has joined this room');
        socket.emit('chatlog', room, 'SERVER', ' you have joined ' + room + ' room');
        var clients = io.sockets.clients(room);
        var people = [];
        for (var i in clients)
            people.push(clients[i]['username']);
        //console.log(people);
        socket.broadcast.to(room).emit('updatepeople', room, people);
        socket.emit('updatepeople', room, people);
    });

    socket.on('privateRoom', function (room) {
        socket.join(room);
    });

    // when the user disconnects.. perform this
    socket.on('disconnect', function () {
        // remove the username from global usernames list
        delete usernames[socket.username];
        // update list of users in chat, client-side
        io.sockets.emit('updateusers', usernames);
        // echo globally that this client has left
        socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
        socket.leave(socket.room);
    });
});

MongoClient.connect('mongodb://localhost:27017/promt', function (err, db) {
    "use strict";
    if (err) throw err;

    // Register our templating engine
    app.engine('html', cons.swig);
    app.set('view engine', 'html');
    app.set('views', __dirname + '/views');
    swig.init({
        root: __dirname + '/views'
    });

    app.use(function (req, res, next) {

        // Website you wish to allow to connect
        res.setHeader('Access-Control-Allow-Origin', '*');

        // Request methods you wish to allow
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

        // Request headers you wish to allow
        res.setHeader('Access-Control-Allow-Headers', 'CLIENT_ID, X-Requested-With, content-type');

        // Set to true if you need the website to include cookies in the requests sent
        // to the API (e.g. in case you use sessions)
        res.setHeader('Access-Control-Allow-Credentials', true);

        // Pass to next layer of middleware
        next();
    });

    // ASSETES / JS / CSS / etc.
    // =============================================================================
    app.use(express.static(__dirname + '/assets'));
    var connect = require('connect');
    // Express middleware to populate 'req.cookies' so we can access cookies
    app.use(connect.cookieParser());
    // Express middleware to populate 'req.body' so we can access POST variables
    app.use(connect.bodyParser());
    // Application routes
    routes(app, db);
    server.listen(8082);
    console.log('Express server listening on port 8082');
});