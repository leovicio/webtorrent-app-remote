require('jquery-browserify')
require('bootstrap')

var WebTorrent = require('webtorrent-hybrid/node_modules/webtorrent')
var torrent = require('../../lib/torrent.js')

var app = require('./app.js')
require('./torrents.js')(app)
require('./tracker.js')(app)
require('./create.js')(app, WebTorrent, torrent)

require('./app.css')