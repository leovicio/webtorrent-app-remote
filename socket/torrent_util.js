var prettyBytes = require('pretty-bytes');

var torrent_util = {
    client: false,
    getTorrents: function() {
        var torrents = [];
        var torrent = {};
        var global = {};
        var fs = require('fs');

        for (var i in torrent_util.client.torrents) {
            torrent = {};
            torrent.infoHash = torrent_util.client.torrents[i].infoHash;
            torrent.name = torrent_util.client.torrents[i].name;
            console.log(torrent_util.client.torrents[i].progress);
            torrent.progress = (100 * torrent_util.client.torrents[i].progress).toFixed(1);
            torrent.peers = torrent_util.client.torrents[i].swarm.wires.length;
            torrent.d_speed = prettyBytes(torrent_util.client.torrents[i].swarm.downloadSpeed());
            torrent.u_speed = prettyBytes(torrent_util.client.torrents[i].swarm.uploadSpeed());
            torrent.ratio = Math.round(torrent_util.client.torrents[i].swarm.ratio * 100) / 100;

            torrents.push(torrent);
            torrent = null;
        }

        global.ratio = Math.round(torrent_util.client.ratio * 100) / 100;
        global.d_speed = prettyBytes(torrent_util.client.downloadSpeed());
        global.u_speed = prettyBytes(torrent_util.client.uploadSpeed());
        return {'torrents': torrents, 'global': global};
    },
    addTorrent: function(magnet) {
        torrent_util.client.add(magnet, function(torrent) {
            /*res.send({
                torrent: torrent.infoHash,
                "success": true
            });*/
        });
    },
    getTorrent: function(infoHash) {
        var return_info = {}
        return_info.name = torrent.name;
        return_info.progress = (100 * torrent.downloaded / torrent.parsedTorrent.length).toFixed(1);
        return_info.peers = torrent.swarm.wires.length;
        return_info.d_speed = prettyBytes(torrent_util.client.downloadSpeed());
        return_info.u_speed = prettyBytes(torrent_util.client.uploadSpeed());
        torrent.ratio = torrent.swarm.ratio;
        return_info.peers = [];
    }

}

module.exports = torrent_util;