module.exports = function (io, Torrent, System, tracker, user) {
  'use strict'
  var clients = []

  io.sockets.on('connection', function (socket) {
    socket.auth = false
    socket.on('authenticate', function (data) {
      user.checkLogin({user: data.user, pass: data.password}, function (err, user) {
        if (!err && user.length) {
          clients[socket.id] = []
          clients[socket.id]['cron_torrents'] = false
          clients[socket.id]['cron_server'] = false
          if (user[0].isAdmin) {
            clients[socket.id]['admin'] = true
          }
          clients[socket.id]['id'] = user[0].$loki
          io.to(socket.id).emit('auth:reply', {
            auth: true,
            user: user
          })
        } else {
          io.to(socket.id).emit('auth:reply', {
            auth: false
          })
        }
      })
    })

    var sendTorrents = function () {
      if (!clients[socket.id]) {
        io.to(socket.id).emit('loggedout')
        return false
      }
      Torrent.getTorrents(function (torrents) {
        io.to(socket.id).emit('torrents', {
          data: torrents
        })
      }, clients[socket.id]['id'])
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
        io.to(socket.id).emit('loggedout')
        return false
      }
      if (!clients[socket.id]['admin']) {
        io.to(socket.id).emit('permission:denied')
        return false
      }
      Torrent.addTorrent(data.torrent, function () {
        io.to(socket.id).emit('torrent:added', {
          success: true
        })
      }, clients[socket.id]['id'])
    })

    socket.on('torrent:remove', function (data) {
      // @Todo: Check if torrent belongs to that user!
      //
      if (!clients[socket.id]) {
        io.to(socket.id).emit('loggedout')
        return false
      }
      if (!clients[socket.id]['admin']) {
        io.to(socket.id).emit('permission:denied')
        return false
      }
      Torrent.remove(data.infoHash, clients[socket.id]['id'], function () {
        io.to(socket.id).emit('torrent:removed', {
          success: true
        })
      })
    })

    socket.on('torrent:remove_all', function (data) {
      // @Todo: check if is adm
      if (!clients[socket.id]) {
        io.to(socket.id).emit('loggedout')
        return false
      }
      if (!clients[socket.id]['admin']) {
        io.to(socket.id).emit('permission:denied')
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
      if (!clients[socket.id]) {
        io.to(socket.id).emit('loggedout')
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
        io.to(socket.id).emit('loggedout')
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
        io.to(socket.id).emit('loggedout')
        return false
      }
      if (!clients[socket.id]['admin']) {
        io.to(socket.id).emit('permission:denied')
        return false
      }
      tracker.saveOptions(options, function (res) {
        io.to(socket.id).emit('tracker:optionsSaved', {
          options: res
        })
      })
    })

    socket.on('tracker:getTracker', function (data) {
      if (!clients[socket.id]) {
        io.to(socket.id).emit('loggedout')
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
        io.to(socket.id).emit('loggedout')
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
        io.to(socket.id).emit('loggedout')
        return false
      }
      if (!clients[socket.id]['admin'] && clients[socket.id]['id'] !== id) {
        io.to(socket.id).emit('permission:denied')
        return false
      }
      id = (id === 'me') ? clients[socket.id]['id'] : id
      user.info(id, function (info) {
        io.to(socket.id).emit('users:info', {user: info})
      })
    })

    socket.on('users:save', function (data) {
      if (!clients[socket.id]) {
        io.to(socket.id).emit('loggedout')
        return false
      }
      if (!clients[socket.id]['admin'] && clients[socket.id]['id'] !== data.$loki) {
        io.to(socket.id).emit('permission:denied')
        return false
      }
      user.signup(data, function (users) {
        io.to(socket.id).emit('users:saved')
      })
    })

    socket.on('users:update', function (data) {
      if (!clients[socket.id]) {
        io.to(socket.id).emit('loggedout')
        return false
      }
      if (!clients[socket.id]['admin']) {
        io.to(socket.id).emit('permission:denied')
        return false
      }
      user.update(data, function (users) {
        io.to(socket.id).emit('users:saved')
      })
    })

    socket.on('users:remove', function (id) {
      if (!clients[socket.id]) {
        io.to(socket.id).emit('loggedout')
        return false
      }
      if (!clients[socket.id]['admin']) {
        io.to(socket.id).emit('permission:denied')
        return false
      }
      user.remove(id, function (err) {
        if (err) {
          io.to(socket.id).emit('permission:denied')
        } else {
          io.to(socket.id).emit('users:removed')
        }
      })
    })

    var logout = function () {
      if (clients[socket.id]) {
        clearInterval(clients[socket.id]['cron_server'])
        clearInterval(clients[socket.id]['cron_torrent'])
      }
      delete clients[socket.id]
      io.to(socket.id).emit('loggedout')
    }

    socket.on('users:loggout', logout)

    socket.on('disconnect', logout)
  })
}
