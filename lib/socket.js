module.exports = function (io, Torrent, System, tracker) {
  'use strict'
  var clients = []
  var crons = []

  io.sockets.on('connection', function (socket) {
    clients.push(socket.id)
    crons[socket.id] = []

    socket.emit('init', {
      welcome: 'welcome to the jungle nanananananana ai ai '
    })

    var sendTorrents = function () {
      Torrent.getTorrents(function (torrents) {
        io.to(socket.id).emit('torrents', {
          data: torrents
        })
      })
    }

    socket.on('startCrons', function (data) {
      if (!crons[socket.id]['torrents']) {
        crons[socket.id]['torrents'] = setInterval(sendTorrents, 2500)
        sendTorrents()
      }

      if (!crons[socket.id]['server']) {
        crons[socket.id]['server'] = setInterval(sendServerInfo, 10000)
        sendServerInfo()
      }
    })

    var sendServerInfo = function () {
      System.serverInfo(function (details) {
        io.to(socket.id).emit('server:info', {
          details: details
        })
      })
    }

    socket.on('torrent:download', function (data) {
      Torrent.addTorrent(data.torrent, function () {
        setTimeout(function () {
          io.to(socket.id).emit('torrent:added', {
            success: true
          })
        }, 3500)
      })
    })

    socket.on('torrent:remove', function (data) {
      Torrent.remove(data.infoHash, function () {
        io.to(socket.id).emit('torrent:removed', {
          success: true
        })
      })
    })

    socket.on('torrent:remove_all', function (data) {
      Torrent.removeAll(function () {
        var WebTorrent = require('webtorrent-hybrid')
        Torrent.client = new WebTorrent()
        io.to(socket.id).emit('torrent:removed_all', {
          success: true
        })
      })
    })

    socket.on('torrent:get_info', function (data) {
      Torrent.getTorrent(data.infoHash, function (torrent) {
        console.log('Got torrent info')
        io.to(socket.id).emit('torrent:info', {
          torrent: torrent
        })
      })
    })

    socket.on('tracker:getOptions', function () {
      tracker.getOptions(function (options) {
        io.to(socket.id).emit('tracker:options', {
          options: options
        })
      })
    })

    socket.on('tracker:saveOptions', function (options) {
      tracker.saveOptions(options, function (res) {
        io.to(socket.id).emit('tracker:optionsSaved', {
          options: res
        })
      })
    })

    socket.on('tracker:getTracker', function (data) {
      tracker.getTracker(function (details) {
        io.to(socket.id).emit('tracker:details', {
          details: details
        })
      })
    })

    socket.on('disconnect', function () {
      clearInterval(crons[socket.id]['server'])
      clearInterval(crons[socket.id]['torrent'])
      delete clients[socket.id]
      console.info('Client gone (id=' + socket.id + ').')
    })
  })
}
