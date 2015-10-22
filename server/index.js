/**
 * Module dependecies 
 */

var express = require('express')
var path = require('path')
var auth = require('http-auth')
var logger = require('morgan')
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
var WebTorrent = require('webtorrent-hybrid/node_modules/webtorrent')
var debug = require('debug')('webtorrentapp:server');
var http = require('http');

/**
 * Express routes 
 */
var routes = require('./routes/index')

var app = express()
var port = normalizePort(process.env.PORT || '3001');
app.set('port', port);
var server = http.createServer(app)

server.listen(port);

/**
 * Handle Server Events
 */
server.on('error', onError);
server.on('listening', onListening);

/**
 * Basic Auth (should be removed soon)
 */
var basic = auth.basic({
  realm: 'WebTorrent App Area.',
  file: __dirname + '/users.htpasswd'
})
app.use(auth.connect(basic))

/**
 * Socket IO Server 
 */
var io = require('socket.io')
var http = require('http')

io = io.listen(server)

/* 
 * Setup express views
 */
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: false
}))
app.use(cookieParser())
app.use(express.static(__dirname + '/../client'))

app.use('/', routes)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found')
  err.status = 404
  next(err)
})

/**
 * Express error handler Event
 */
app.use(function (err, req, res, next) {
  res.status(err.status || 500)
  res.render('error', {
    message: err.message,
    error: {}
  })
})

/**
 * Start webTorrent Client
 */
var client = new WebTorrent()

/**
 * Require torrent, tracker, and system utils
 */
var Torrent = require('../lib/torrent.js')
Torrent = new Torrent()
Torrent.client = client
var Tracker = require('../lib/tracker.js')
Tracker = new Tracker()
Tracker.check_settings()
var System_info = require('../lib/system_info.js')
System_info = new System_info()

/**
 * Now require Socket.js Events
 */
require('./socket.js')(io, Torrent, System_info, Tracker)


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
    console.log(bind)
  debug('Listening on ' + bind);
}
