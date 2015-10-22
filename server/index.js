/**
 * Module dependecies 
 */
var WebTorrent = require('webtorrent-hybrid/node_modules/webtorrent')
//var debug = require('debug')('webtorrentapp:server')
var http = require('http')
var NodeStatic = require( 'node-static' )

/**
 * Initiate levelup database
 */
var levelup = require('levelup')
var db = levelup(__dirname + '/settings/database')


/**
 * Static file serve
 */
var file = new NodeStatic.Server( './client', {
    cache: 3600,
    gzip: true
} );

var port = process.env.PORT || '3001';
var server = http.createServer(function ( request, response ) {
    request.addListener( 'end', function () {
        file.serve( request, response );
    } ).resume();
})

server.listen(port);

/**
 * Socket IO Server 
 */
var io = require('socket.io')
var http = require('http')

io = io.listen(server)

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
