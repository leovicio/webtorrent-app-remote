/* global createjs */
/* global $ */

var supportsWebSockets = 'WebSocket' in window || 'MozWebSocket' in window
if (supportsWebSockets) {
  var queue = new createjs.LoadQueue()

  queue.on('progress', function (event) {
    var progress = Math.round(event.loaded * 100)

    $('#prc').text(progress + '%')
    $('#progressbar .bar').css({
      'width': progress + '%'
    })
  })

  queue.loadManifest([
    {
      id: '1',
      src: '/stylesheets/bootstrap.min.css'
    },
    {
      id: '2',
      src: '/stylesheets/style.css'
    },
    {
      id: '3',
      src: '/javascripts/lib/webtorrent.min.js'
    },
    {
      id: '5',
      src: '/javascripts/build/bundle.min.js'
    }
  ])
} else {
  $(function () {
    $('#error').text('Error: Your browser does not support websockets')
  })
}
