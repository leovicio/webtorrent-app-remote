/* global createjs */
/* global $ */
var queue = new createjs.LoadQueue()

queue.on('progress', onProgress)

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
    id: '4',
    src: '/javascripts/build/bundle.min.js?' + Math.random()
  }
])

function onProgress (event) {
  var progress = Math.round(event.loaded * 100)

  $('#prc').text(progress + '%')
  $('#progressbar .bar').css({
    'width': progress + '%'
  })
}
