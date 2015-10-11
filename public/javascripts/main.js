require('jquery-browserify')
require('bootstrap')

var WebTorrent = require('webtorrent-hybrid/node_modules/webtorrent')

var app = require('./app.js')
require('./torrents.js')(app)
require('./tracker.js')(app)
require('./create.js')(app, WebTorrent)

require('./app.css')
