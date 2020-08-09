#!/usr/bin/env node

/**
 * Module dependencies.
 */

var app = require('./app');
var debug = require('debug')('moon:server');
var http = require('http');

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);

var io = require('socket.io')(server);

/**
 * Integrate the game server.
 */
let gameroomClass = require('./gameroomClass')
let connections = new Map()
let gameclerkClass = require('./gameclerkClass')
let clerk = new gameclerkClass(io, 3)
let playerClass = require('./playerClass')
io.on('connection', (socket) => {
    connections.set(socket,socket)
    console.log(`Connections=${connections.size}`)
    let data = clerk.getVacancies()
    //console.log('vacancies')
    //console.log(data)
    socket.emit('vacancies', data)
    socket.once('disconnect', () => {
        connections.delete(socket)
        //rooms.leave(socket)
        clerk.leave(socket)
        console.log(`Connections=${connections.size}`)
    })
    socket.once('roomreq', (data) => {
        console.log(`Player ${data.player} requested room ${data.room}`)
        //let player = new playerClass(socket, data.player)
        //gameServer.players[socket.id] = player
        let room = clerk.arrive(socket, data)
    })
    socket.once('playWithBots', function(data) {
        console.log(`Player ${data.player} in ${data.room} wants to play with bots`)
        clerk.playWithBots(data)
    })
})
console.log('mainServer finished integrating game server')

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

// Custom server termination
process.on('SIGTERM', () => {
    server.close(() => {
	console.log('Process terminated')
    })
})

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}
