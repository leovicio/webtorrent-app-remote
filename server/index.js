/**
 * Module dependecies
 */
var WebTorrent = require('webtorrent-hybrid/node_modules/webtorrent')
// var debug = require('debug')('webtorrentapp:server')
var io = require('socket.io')
var http = require('http')
var NodeStatic = require('node-static')
var Loki = require('lokijs')

var onloadDatabase = function () {
  /**
   * Static file serve
   */
  var file = new NodeStatic.Server('./client', {
    cache: 0,
    gzip: true
  })

  var port = process.env.PORT || '3001'
  var server = http.createServer(function (request, response) {
    request.addListener('end', function () {
      file.serve(request, response)
    }).resume()
  })

  server.listen(port)

  /**
   * Socket IO Server
   */
  io = io.listen(server)

  /**
   * Start webTorrent Client
   */
  var client = new WebTorrent()

  /**
   * Require torrent, tracker, system and user utils
   */
  var Torrent = require('../lib/torrent.js')
  Torrent = new Torrent()
  Torrent.client = client

  var Tracker = require('../lib/tracker.js')
  Tracker = new Tracker()
  Tracker.check_settings()

  var System_info = require('../lib/system_info.js')
  System_info = new System_info()

  var User = require('../lib/user.js')
  User = new User()

  var users_db = db.getCollection('users');
  if (users_db === null) {
    users_db = db.addCollection('users');
  }
  User.db = users_db

  console.log('Database loaded')
  // The user will be an "default" user
  User.signup({user: 'admin', pass: 'root', name: 'Administator', numTorrents: 0, email: 'admin@admin.com', isAdmin: true}, function () {})
  /**
  * Now require Socket.js Events
  */
  require('./socket.js')(io, Torrent, System_info, Tracker, User)
}

/**
 * Initiate database
 */

console.log('Loading database')
var db = new Loki('./server/settings/users.json', {
  autoload: true,
  autoloadCallback : onloadDatabase,
  autosave: true,
  autosaveInterval: 10000
})