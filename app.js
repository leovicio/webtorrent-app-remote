var express = require('express')
var path = require('path')
var auth = require('http-auth')
var logger = require('morgan')
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
var WebTorrent = require('webtorrent-hybrid')

var routes = require('./routes/index')

var app = express()
var basic = auth.basic({
  realm: 'WebTorrent App Area.',
  file: __dirname + '/users.htpasswd'
})
app.use(auth.connect(basic))

var io = require('socket.io')
var http = require('http')
var server = http.createServer(app)
server.listen(3001)
io = io.listen(server)

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

// uncomment after placing your favicon in /public
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: false
}))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use('/', routes)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found')
  err.status = 404
  next(err)
})

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500)
    res.render('error', {
      message: err.message,
      error: err
    })
  })
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500)
  res.render('error', {
    message: err.message,
    error: {}
  })
})

/* WebTorrent Client*/
var client = new WebTorrent()

var Torrent = require('./lib/torrent.js')
Torrent = new Torrent()
Torrent.client = client
var Tracker = require('./lib/tracker.js')
Tracker = new Tracker()
Tracker.check_settings()
var System = require('./lib/system_info.js')
System = new System
require('./lib/socket.js')(io, Torrent, System, Tracker)

module.exports = app
