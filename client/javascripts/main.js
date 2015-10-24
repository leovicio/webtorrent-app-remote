require('jquery-browserify')
require('bootstrap')

var torrent = require('../../lib/torrent.js')

var app = require('./app.js')
require('./torrents.js')(app)
require('./tracker.js')(app)
require('./create.js')(app, torrent)
require('./login.js')(app)
require('./users.js')(app)

require('./app.css')
