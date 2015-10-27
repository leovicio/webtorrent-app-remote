module.exports = function (io, Torrent, System, tracker, user) {
  'use strict'
  var clients = []

  io.sockets.on('connection', function (socket) {
    socket.auth = false
    socket.on('authenticate', function (data) {
      user.checkLogin({user: data.user, pass: data.password}, function (err, user) {
        if (!err && user) {
          clients[socket.id] = []
          clients[socket.id]['cron_torrents'] = false
          clients[socket.id]['cron_server'] = false
          if (data.user.isAdmin) {
            clients[socket.id]['admin'] = true
          }
          clients[socket.id]['id'] = user.$loki
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
      if (!clients[socket.id]) {
        socket.emit('loggedout')
        return false
      }
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
      if (!clients[socket.id]) {
        return false
      }
      if (!clients[socket.id]['cron_torrents']) {
        clients[socket.id]['cron_torrents'] = setInterval(sendTorrents, 2500)
        sendTorrents()
      }

      if (!clients[socket.id]['cron_server']) {
        clients[socket.id]['cron_server'] = setInterval(sendServerInfo, 10000)
        sendServerInfo()
      }
    })

    socket.on('torrent:download', function (data) {
      if (!clients[socket.id]) {
        socket.emit('loggedout')
        return false
      }
      if (!clients[socket.id]['admin']) {
        socket.emit('permission:denied')
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
      if (!clients[socket.id]) {
        socket.emit('loggedout')
        return false
      }
      if (!clients[socket.id]['admin']) {
        socket.emit('permission:denied')
      }
      Torrent.remove(data.infoHash, function () {
        io.to(socket.id).emit('torrent:removed', {
          success: true
        })
      })
    })

    socket.on('torrent:remove_all', function (data) {
      if (!clients[socket.id]) {
        socket.emit('loggedout')
        return false
      }
      if (!clients[socket.id]['admin']) {
        socket.emit('permission:denied')
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
      if (!clients[socket.id]) {
        socket.emit('loggedout')
        return false
      }
      Torrent.getTorrent(data.infoHash, function (torrent) {
        io.to(socket.id).emit('torrent:info', {
          torrent: torrent
        })
      })
    })

    socket.on('tracker:getOptions', function () {
      if (!clients[socket.id]) {
        socket.emit('loggedout')
        return false
      }
      tracker.getOptions(function (options) {
        io.to(socket.id).emit('tracker:options', {
          options: options
        })
      })
    })

    socket.on('tracker:saveOptions', function (options) {
      if (!clients[socket.id]) {
        socket.emit('loggedout')
        return false
      }
      if (!clients[socket.id]['admin']) {
        socket.emit('permission:denied')
      }
      tracker.saveOptions(options, function (res) {
        io.to(socket.id).emit('tracker:optionsSaved', {
          options: res
        })
      })
    })

    socket.on('tracker:getTracker', function (data) {
      if (!clients[socket.id]) {
        socket.emit('loggedout')
        return false
      }
      tracker.getTracker(function (details) {
        io.to(socket.id).emit('tracker:details', {
          details: details
        })
      })
    })

    socket.on('users:list', function (data) {
      if (!clients[socket.id]) {
        socket.emit('loggedout')
        return false
      }
      user.list(function (users) {
        io.to(socket.id).emit('users:listed', {
          users: users
        })
      })
    })

    socket.on('users:getInfo', function (id) {
      if (!clients[socket.id]) {
        socket.emit('loggedout')
        return false
      }
      if (!clients[socket.id]['admin'] && clients[socket.id]['id'] !== id) {
        socket.emit('permission:denied')
      }
      id = (id === 'me') ? clients[socket.id]['id'] : id
      user.info(id, function (info) {
        io.to(socket.id).emit('users:info', {user: info})
      })
    })

    socket.on('users:save', function (data) {
      if (!clients[socket.id]) {
        socket.emit('loggedout')
        return false
      }
      if (!clients[socket.id]['admin'] && clients[socket.id]['id'] !== data.$loki) {
        socket.emit('permission:denied')
      }
      user.signup(data, function (users) {
        io.to(socket.id).emit('users:saved')
      })
    })

    socket.on('users:update', function (data) {
      if (!clients[socket.id]) {
        socket.emit('loggedout')
        return false
      }
      if (!clients[socket.id]['admin']) {
        socket.emit('permission:denied')
      }
      user.update(data, function (users) {
        io.to(socket.id).emit('users:saved')
      })
    })

    socket.on('users:remove', function (id) {
      if (!clients[socket.id]) {
        socket.emit('loggedout')
        return false
      }
      if (!clients[socket.id]['admin']) {
        socket.emit('permission:denied')
      }
      user.remove(id, function () {
        io.to(socket.id).emit('users:removed')
      })
    })

    var logout = function () {
      if (clients[socket.id]) {
        clearInterval(clients[socket.id]['cron_server'])
        clearInterval(clients[socket.id]['cron_torrent'])
      }
      delete clients[socket.id]
      socket.emit('loggedout')
    }

    socket.on('users:loggout', logout)

    socket.on('disconnect', logout)
  })
}
