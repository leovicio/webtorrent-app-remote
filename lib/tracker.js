var Server = require('bittorrent-tracker').Server
var store = require('data-store')('settings', {cwd: 'settings'})

function Tracker () {

}

Tracker.prototype._server = false

/**
* Check storage settings and start server if enabled
*/
Tracker.prototype.check_settings = function () {
  var self = this
  var settings = store.get()
  if (settings.tracker) {
    self.enable_server(settings)
  }
}

/**
* Enable tracker server.
* Takes the settings to check wheter udp, ws and http are enabled or not
*
* @param {Object} Settings - From storage to mark which servers are enabled
*/
Tracker.prototype.enable_server = function (settings) {
  var self = this
  var server = new Server({
    udp: settings.tracker_udp, // enable udp server?
    http: settings.tracker_http, // enable http server?
    ws: settings.tracker_ws // enable websocket server?
  })
  server.listen(settings.port, function () {
    // fired when all requested servers are listening
    console.log('Tracker listening on http port:' + self.server.http.address().port)
    console.log('Tracker listening on udp port:' + self.server.udp.address().port)
    console.log('Tracker listening on ws port:' + self.server.ws.address().port)
  })

  // @Todo: Handle socket errors
  // server.on('error', function (err) {
  // fatal server error!
  // })
  // server.on('warning', function (err) {
  // client sent bad data. probably not a problem, just a buggy client.
  //  console.log(err.message)
  // })
  self.server = server
}

/**
* Get options from store
* Takes a callback as first parameter
*
* @param {Function} cb
*/
Tracker.prototype.getOptions = function (cb) {
  cb(store.get())
}

/**
* Save options to store
* Takes an object with options to save
* Takes a callback as second parameter
*
* @param {Object} opts
* @param {Function} cb
*/
Tracker.prototype.saveOptions = function (opts, cb) {
  store.set(opts)
  cb(opts)
}

/**
* Get tracker information (return each server port)
* Takes a callback as parameter
*
* @param {Function} cb
*/
Tracker.prototype.getTracker = function (cb) {
  var self = this
  cb({
    ws_port: self.server.ws.address().port,
    http_port: self.server.http.address().port,
    udp_port: self.server.udp.address().port
  })
}

module.exports = Tracker
