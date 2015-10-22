module.exports = function (io, Torrent, System, tracker, user) {
  'use strict'
  var clients = []
  var crons = []

  io.sockets.on('connection', function (socket) {
    socket.auth = false
    socket.on('authenticate', function (data) {
      user.checkLogin({user: data.user, pass: data.password}, function (err, user) {
        if (!err && user) {
          clients.push(socket.id)
          crons[socket.id] = []
          socket.emit('auth:reply', {
            auth: true,
            user: user
          })
        } else {
          socket.emit('auth:reply', {
            auth: false
          })
        }
      })
    })

    var sendTorrents = function () {
      Torrent.getTorrents(function (torrents) {
        io.to(socket.id).emit('torrents', {
          data: torrents
        })
      })
    }

    var sendServerInfo = function () {
      System.serverInfo(function (details) {
        io.to(socket.id).emit('server:info', {
          details: details
        })
      })
    }

    socket.on('startCrons', function (data) {
      if (!crons[socket.id]) {
        return false
      }
      if (!crons[socket.id]['torrents']) {
        crons[socket.id]['torrents'] = setInterval(sendTorrents, 2500)
        sendTorrents()
      }

      if (!crons[socket.id]['server']) {
        crons[socket.id]['server'] = setInterval(sendServerInfo, 10000)
        sendServerInfo()
      }
    })

    socket.on('torrent:download', function (data) {
      if (!crons[socket.id]) {
        return false
      }
      Torrent.addTorrent(data.torrent, function () {
        setTimeout(function () {
          io.to(socket.id).emit('torrent:added', {
            success: true
          })
        }, 3500)
      })
    })

    socket.on('torrent:remove', function (data) {
      if (!crons[socket.id]) {
        return false
      }
      Torrent.remove(data.infoHash, function () {
        io.to(socket.id).emit('torrent:removed', {
          success: true
        })
      })
    })

    socket.on('torrent:remove_all', function (data) {
      if (!crons[socket.id]) {
        return false
      }
      Torrent.removeAll(function () {
        var WebTorrent = require('webtorrent-hybrid')
        Torrent.client = new WebTorrent()
        io.to(socket.id).emit('torrent:removed_all', {
          success: true
        })
      })
    })

    socket.on('torrent:get_info', function (data) {
      if (!crons[socket.id]) {
        return false
      }
      Torrent.getTorrent(data.infoHash, function (torrent) {
        io.to(socket.id).emit('torrent:info', {
          torrent: torrent
        })
      })
    })

    socket.on('tracker:getOptions', function () {
      if (!crons[socket.id]) {
        return false
      }
      tracker.getOptions(function (options) {
        io.to(socket.id).emit('tracker:options', {
          options: options
        })
      })
    })

    socket.on('tracker:saveOptions', function (options) {
      if (!crons[socket.id]) {
        return false
      }
      tracker.saveOptions(options, function (res) {
        io.to(socket.id).emit('tracker:optionsSaved', {
          options: res
        })
      })
    })

    socket.on('tracker:getTracker', function (data) {
      if (!crons[socket.id]) {
        return false
      }
      tracker.getTracker(function (details) {
        io.to(socket.id).emit('tracker:details', {
          details: details
        })
      })
    })

    socket.on('disconnect', function () {
      if (crons[socket.id]) {
        clearInterval(crons[socket.id]['server'])
        clearInterval(crons[socket.id]['torrent'])
      }
      delete clients[socket.id]
      console.info('Client gone (id=' + socket.id + ').')
    })
  })
}
