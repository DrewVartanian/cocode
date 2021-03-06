'use strict';
var chalk = require('chalk');

// Requires in ./db/index.js -- which returns a promise that represents
// mongoose establishing a connection to a MongoDB database.
var startDb = require('./db');

// Create a node server instance! cOoL!
var server = require('http').createServer();

var createApplication = function () {
    var app = require('./app');
    server.on('request', app); // Attach the Express application.
    var io=require('./io')(server);   // Attach socket.io.

    io.on('connection', function(socket){
        var room = null;
        socket.on('newVisitor', function(newVisitor) {
            room = newVisitor.room;
            socket.join(room);
        });

        socket.on('codeEdit', function(code) {
            socket.broadcast.to(room).emit('codeEdited', code);
        });

        socket.on('updateView', function(viewInfo) {
            socket.broadcast.to(room).emit('viewUpdated',viewInfo);
        });

        socket.on('chatSent', function(chat) {
            socket.broadcast.to(room).emit('chatReceived', chat);
        });
    });
};

var startServer = function () {

    var PORT = process.env.PORT || 3000;

    server.listen(PORT, function () {
        console.log(chalk.blue('Server started on port', chalk.magenta(PORT)));
    });

};

startDb.then(createApplication).then(startServer).catch(function (err) {
    console.error(chalk.red(err.stack));
    process.kill(1);
});
