require('jquery-browserify')
require('bootstrap')

var app = require('./app.js')
require('./config.js')(app)
require('./torrents.js')(app)
require('./tracker.js')(app)

require('./app.css')
