require('jquery-browserify')
require('bootstrap')

var app = require('./app.js')
require('./torrents.js')(app)
require('./tracker.js')(app)

require('./app.css')
