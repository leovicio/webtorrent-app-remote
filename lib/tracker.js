var Server = require('bittorrent-tracker').Server
var store = require('data-store')('settings', {cwd: 'settings'})

var tracker = {
  server: false,
  check_settings: function () {
    var settings = store.get().data
    if (settings.tracker) {
      console.log('Tracker enabled')
      tracker.enable_server(settings)
    }
  },
  enable_server: function (settings) {
    var server = new Server({
      udp: settings.tracker_udp, // enable udp server? [default=true]
      http: settings.tracker_http, // enable http server? [default=true]
      ws: settings.tracker_ws // enable websocket server? [default=true]
    })
    server.listen(settings.port, function () {
    // fired when all requested servers are listening
      console.log('listening on http port:' + tracker.server.http.address().port)
      console.log('listening on udp port:' + tracker.server.udp.address().port)
      console.log('listening on ws port:' + tracker.server.ws.address().port)
    })
    server.on('error', function (err) {
      // fatal server error!
      console.log(err.message)
    })
    server.on('warning', function (err) {
      // client sent bad data. probably not a problem, just a buggy client.
      console.log(err.message)
    })
    tracker.server = server
  },
  getOptions: function (cb) {
    console.log(store.get().data)
    cb(store.get().data)
  },
  saveOptions: function (opts, cb) {
    store.set(opts)
    cb(opts)
  },
  getTracker: function (cb) {
    cb({
      ws_port: tracker.server.ws.address().port,
      http_port: tracker.server.http.address().port,
      udp_port: tracker.server.udp.address().port
    })
  }
}
module.exports = tracker
