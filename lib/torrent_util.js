var prettyBytes = require('pretty-bytes')
var moment = require('moment')
var os = require('os')
var disk = require('diskusage')

var torrent_util = {
  client: false,
  serverInfo: function (cb) {
    var os_info = {}
    os_info.load_avg = os.loadavg()
    for (var l in os_info.load_avg) {
      os_info.load_avg[l] = Math.round(os_info.load_avg[l] * 100) / 100
    }
    os_info.totalmem = os.totalmem()
    os_info.freemem = os.freemem()
    os_info.mem_used = os_info.totalmem - os_info.freemem
    os_info.prc_mem_used = Math.round((((os_info.mem_used * 100) / os_info.totalmem) * 100) / 100)
    os_info.totalmem = prettyBytes(os_info.totalmem)
    os_info.memused = prettyBytes(os_info.mem_used)

    disk.check('/', function (err, info) {
      if (err) {
        console.log(err)
      }
      os_info.disk_total = info.total
      os_info.disk_free = info.free
      os_info.disk_used = info.total - info.free
      os_info.prc_disk_used = Math.round((((os_info.disk_used * 100) / os_info.disk_total) * 100) / 100)
      os_info.disk_used = prettyBytes(os_info.disk_used)
      os_info.disk_total = prettyBytes(os_info.disk_total)
      cb({
        'os_info': os_info
      })
    })
  },
  getTorrents: function (cb) {
    var torrents = []
    var torrent = {}
    var global = {}

    if (torrent_util.client) {
      var current_torrents = torrent_util.client.torrents
      for (var i in current_torrents) {
        torrent = {}
        torrent.infoHash = torrent_util.client.torrents[i].infoHash
        torrent.name = torrent_util.client.torrents[i].name
        torrent.progress = (100 * torrent_util.client.torrents[i].progress).toFixed(1)
        if (torrent_util.client.torrents[i].swarm) {
          torrent.peers = torrent_util.client.torrents[i].swarm.numPeers
          torrent.d_speed = prettyBytes(torrent_util.client.torrents[i].swarm.downloadSpeed())
          torrent.u_speed = prettyBytes(torrent_util.client.torrents[i].swarm.uploadSpeed())
          if (torrent_util.client.torrents[i].length) {
            torrent.downloaded = prettyBytes(torrent_util.client.torrents[i].downloaded) + '/' + prettyBytes(torrent_util.client.torrents[i].length)
            torrent.status = (torrent_util.client.torrents[i].downloaded >= torrent_util.client.torrents[i].length) ? 2 : 1
          } else {
            torrent.status = 2
          }
          if (torrent_util.client.torrents[i].swarm.uploaded) {
            torrent.uploaded = prettyBytes(torrent_util.client.torrents[i].swarm.uploaded)
          } else {
            torrent.uploaded = prettyBytes(0)
          }
          torrent.ratio = Math.round(torrent_util.client.torrents[i].swarm.ratio * 100) / 100
          torrent.estimate = moment.duration(torrent_util.client.torrents[i].timeRemaining / 1000, 'seconds').humanize()
        }
        torrents.push(torrent)
        torrent = null
      }

      global.ratio = Math.round(torrent_util.client.ratio * 100) / 100

      global.d_speed = prettyBytes(torrent_util.client.downloadSpeed())
      global.u_speed = prettyBytes(torrent_util.client.uploadSpeed())

      cb({
        'torrents': torrents,
        'global': global
      })
    } else {
      return
    }
  },
  addTorrent: function (torrent, cb) {
    console.log('Add torrent')
    torrent_util.client.add(torrent, {
      path: '/home/torrents'
    }, cb(torrent))
  },
  remove: function (infoHash, cb) {
    torrent_util.client.remove(infoHash, cb)
  },
  removeAll: function (cb) {
    torrent_util.client.destroy(cb)
  },
  getTorrent: function (infoHash, cb) {
    var torrent = {}
    var get_torrent = torrent_util.client.get(infoHash)
    torrent.infoHash = get_torrent.infoHash
    torrent.name = get_torrent.name
    torrent.progress = (100 * get_torrent.progress).toFixed(1)
    if (get_torrent.swarm) {
      var peers_list = []
      var peer = {}
      for (var l in get_torrent.swarm.wires) {
        peer = {}
        peer.ip = get_torrent.swarm.wires[l].remoteAddress + ':' + get_torrent.swarm.wires[l].remotePort
        peer.d_speed = prettyBytes(get_torrent.swarm.wires[l].downloadSpeed())
        peer.u_speed = prettyBytes(get_torrent.swarm.wires[l].uploadSpeed())
        peers_list.push(peer)
        peer = null
      }
      torrent.peers_list = peers_list
      peers_list = null
      torrent.peers = get_torrent.swarm.wires.numPeers
      torrent.d_speed = prettyBytes(get_torrent.swarm.downloadSpeed())
      torrent.u_speed = prettyBytes(get_torrent.swarm.uploadSpeed())
      if (get_torrent.length) {
        torrent.size = prettyBytes(get_torrent.length)
        torrent.downloaded = prettyBytes(get_torrent.downloaded)
        torrent.status = (get_torrent.downloaded >= get_torrent.length) ? 2 : 1
      } else {
        torrent.status = 2
      }
      if (get_torrent.swarm.uploaded) {
        torrent.uploaded = prettyBytes(get_torrent.swarm.uploaded)
      } else {
        torrent.uploaded = prettyBytes(0)
      }
      if (get_torrent.swarm.ratio) {
        torrent.ratio = Math.round(get_torrent.swarm.ratio * 100) / 100
      } else {
        torrent.ratio = 0
      }

      torrent.files = []
      for (var file in get_torrent.files) {
        var f = get_torrent.files[file]
        torrent.files.push({
          'name': f.name,
          'path': f.path,
          'size': prettyBytes(f.length)
        })
      }
      torrent.estimate = moment.duration(torrent.timeRemaining / 1000, 'seconds').humanize()
      torrent.location = get_torrent.path
    }
    cb(torrent)
    torrent = null
  }

}

module.exports = torrent_util
