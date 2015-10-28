var prettyBytes = require('pretty-bytes')
var moment = require('moment')

function Torrent () {

}

Torrent.prototype.client = false

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

Torrent.prototype.getTorrents = function (cb, currentUser) {
  var torrents = []
  var torrent = {}
  var global = {}

  if (typeof this.client !== 'undefined') {
    var get_torrents = this.torrent_db.find({'user': currentUser})
    for (var i in get_torrents) {
      var get_torrent = this.client.get(get_torrents[i].magnet)
      torrent = this.extractTorrent(get_torrent)
      torrents.push(torrent)
      torrent = null
    }

    // Ugly workaround for: https://github.com/feross/webtorrent/issues/463
    try {
      global.ratio = Math.round(this.client.ratio * 100) / 100
    } catch (Ex) {
      global.ratio = 0
    }

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
Torrent.prototype.addTorrent = function (torrent, cb, currentUser) {
  var self = this
  this.client.add(torrent, {
    path: '/home/torrents'
  }, function (torrent) {
    self.torrent_db.insert({'user': currentUser, magnet: torrent.magnetURI, infoHash: torrent.infoHash})
    cb(torrent)
  })
}

/**
 * Removes a torrent
 *
 * First parameter is the torrent infoHash
 *
 * @param {String} infoHash
 * @param {Function} cb
 */
Torrent.prototype.remove = function (infoHash, currentUser, cb) {
  var self = this
  self.torrent_db.find({infoHash: infoHash, user: currentUser}, function (err) {
    if (err) {
      cb(err)
    } else {
      self.client.remove(infoHash, function () {
        cb(false)
      })
    }
  })
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
Torrent.prototype.getTorrent = function (infoHash, cb, currentUser) {
  var torrent = {}
  var get_torrent = this.client.get(infoHash)
  torrent = this.extractTorrent(get_torrent, true)
  cb(torrent)
}

module.exports = Torrent
