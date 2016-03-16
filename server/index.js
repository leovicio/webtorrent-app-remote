/**
 * Module dependecies
 */

/** Since 1.0 Webtorrent Hybrid now requires an screen, since electron expects one*/

var Xvfb = require('xvfb');
var xvfb = new Xvfb();
xvfb.startSync();

var WebTorrent = require('webtorrent-hybrid')
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
  
  var port = process.env.PORT || '8080'
  var server = http.createServer(function (request, response) {
    request.addListener('end', function () {
      file.serve(request, response)
    }).resume()
  })
  server.listen(port, '0.0.0.0')

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

  var torrent_db = db.getCollection('torrents')
  if (torrent_db === null) {
    torrent_db = db.addCollection('torrents')
  }
  Torrent.torrent_db = torrent_db

  var Tracker = require('../lib/tracker.js')
  Tracker = new Tracker()
  Tracker.check_settings()

  var System_info = require('../lib/system_info.js')
  System_info = new System_info()

  var User = require('../lib/user.js')
  User = new User()

  var users_db = db.getCollection('users')
  if (users_db === null) {
    users_db = db.addCollection('users')
  }
  User.db = users_db

  console.log('Database loaded')
  /**
  * Now require Socket.js Events
  */
  require('./socket.js')(io, Torrent, System_info, Tracker, User)
}

/**
 * Initiate database
 */

console.log('Loading database');

var db = new Loki('./server/settings/db.json', {
  autoload: true,
  autoloadCallback: onloadDatabase,
  autosave: true,
  autosaveInterval: 10000
})
