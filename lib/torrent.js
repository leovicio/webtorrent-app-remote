var prettyBytes = require('pretty-bytes')
var moment = require('moment')
var os = require('os')
var disk = require('diskusage')

function Torrent () {

}

Torrent.prototype.client = false

/**
 * Get Server info
 *
 * @param {function} cb
 */

Torrent.prototype.serverInfo = function (cb) {
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
}

/**
 * Extract only informations we need
 *
 * Webtorrent property client.torrent, has many torrent information,
 * but we don't need all of it
 *
 * This function extracts and translate all we need
 *
 * @param {Object} torrent_info
 */

Torrent.prototype.extractTorrent = function (torrent_info, full) {
  var torrent = {}

  torrent.infoHash = torrent_info.infoHash
  torrent.name = torrent_info.name
  torrent.progress = (100 * torrent_info.progress).toFixed(1)
  if (torrent_info.swarm) {
    if (full) {
      var peers_list = []
      var peer = {}
      for (var l in torrent_info.swarm.wires) {
        peer = {}
        peer.ip = torrent_info.swarm.wires[l].remoteAddress + ':' + torrent_info.swarm.wires[l].remotePort
        peer.d_speed = prettyBytes(torrent_info.swarm.wires[l].downloadSpeed())
        peer.u_speed = prettyBytes(torrent_info.swarm.wires[l].uploadSpeed())
        peers_list.push(peer)
        peer = null
      }
      torrent.peers_list = peers_list
      peers_list = null

      torrent.files = []
      for (var file in torrent_info.files) {
        var f = torrent_info.files[file]
        torrent.files.push({
          'name': f.name,
          'path': f.path,
          'size': prettyBytes(f.length)
        })
      }
    }
    torrent.peers = torrent_info.swarm.numPeers
    torrent.d_speed = prettyBytes(torrent_info.swarm.downloadSpeed())
    torrent.u_speed = prettyBytes(torrent_info.swarm.uploadSpeed())
    if (torrent_info.length) {
      torrent.downloaded = prettyBytes(torrent_info.downloaded) + '/' + prettyBytes(torrent_info.length)
      torrent.status = (torrent_info.downloaded >= torrent_info.length) ? 2 : 1
    } else {
      torrent.status = 2
    }
    if (torrent_info.swarm.uploaded) {
      torrent.uploaded = prettyBytes(torrent_info.swarm.uploaded)
    } else {
      torrent.uploaded = prettyBytes(0)
    }
    torrent.ratio = Math.round(torrent_info.swarm.ratio * 100) / 100
    torrent.estimate = moment.duration(torrent_info.timeRemaining / 1000, 'seconds').humanize()
  }
  return torrent
}

/**
 * List all current torrents
 *
 * @param {Function} cb
 */

Torrent.prototype.getTorrents = function (cb) {
  var torrents = []
  var torrent = {}
  var global = {}

  if (this.client) {
    var current_torrents = this.client.torrents
    for (var i in current_torrents) {
      torrent = this.extractTorrent(this.client.torrents[i])
      torrents.push(torrent)
      torrent = null
    }

    global.ratio = Math.round(this.client.ratio * 100) / 100

    global.d_speed = prettyBytes(this.client.downloadSpeed())
    global.u_speed = prettyBytes(this.client.uploadSpeed())

    cb({
      'torrents': torrents,
      'global': global
    })
  } else {
    return
  }
}

/**
 * Add a torrent for download
 *
 * First param can be a Array Buffer, a parsed torrent or a magnet URI
 *
 * @param {Buffer|String} torrent
 * @param {Function} cb
 */
Torrent.prototype.addTorrent = function (torrent, cb) {
  this.client.add(torrent, {
    path: '/home/torrents'
  }, cb(torrent))
}

/**
 * Removes a torrent
 *
 * First parameter is the torrent infoHash
 *
 * @param {String} infoHash
 * @param {Function} cb
 */
Torrent.prototype.remove = function (infoHash, cb) {
  this.client.remove(infoHash, cb)
}

/**
 * Removes All torrents
 *
 * @param {Function} cb
 */
Torrent.prototype.removeAll = function (cb) {
  this.client.destroy(cb)
}

/**
 * Get information for a specific torrent
 *
 * First parameteris the infoHash of wanted torrent
 *
 * @param {String} infoHash
 * @param {Function} cb
 */
Torrent.prototype.getTorrent = function (infoHash, cb) {
  var torrent = {}
  var get_torrent = this.client.get(infoHash)
  torrent = this.extractTorrent(get_torrent, true)
  cb(torrent)
}

module.exports = Torrent
