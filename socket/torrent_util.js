var prettyBytes = require('pretty-bytes');
var moment = require('moment');

var torrent_util = {
    client: false,
    getTorrents: function() {
        var torrents = [];
        var torrent = {};
        var global = {};
        var fs = require('fs');

        if (torrent_util.client) {
            for (var i in torrent_util.client.torrents) {
                torrent = {};
                torrent.infoHash = torrent_util.client.torrents[i].infoHash;
                torrent.name = torrent_util.client.torrents[i].name;
                torrent.progress = (100 * torrent_util.client.torrents[i].progress).toFixed(1);
                if (torrent_util.client.torrents[i].swarm) {
                    torrent.peers = torrent_util.client.torrents[i].swarm.wires.length;
                    torrent.d_speed = prettyBytes(torrent_util.client.torrents[i].swarm.downloadSpeed());
                    torrent.u_speed = prettyBytes(torrent_util.client.torrents[i].swarm.uploadSpeed());
                    if(torrent_util.client.torrents[i].length){
                        torrent.downloaded = prettyBytes(torrent_util.client.torrents[i].downloaded) + '/' +  prettyBytes(torrent_util.client.torrents[i].length);
                        torrent.status = (torrent_util.client.torrents[i].downloaded >= torrent_util.client.torrents[i].length) ? 2 : 1;
                    }else{
                        torrent.status = 2;
                    }
                    if(torrent_util.client.torrents[i].swarm.uploaded)
                        torrent.uploaded = prettyBytes(torrent_util.client.torrents[i].swarm.uploaded);
                    
                    torrent.ratio = Math.round(torrent_util.client.torrents[i].swarm.ratio * 100) / 100;
                    torrent.estimate = moment.duration(torrent.timeRemaining / 1000, 'seconds').humanize();
                }
                torrents.push(torrent);
                torrent = null;
            }

            //global.ratio = Math.round(torrent_util.client.ratio * 100) / 100;

            global.d_speed = prettyBytes(torrent_util.client.downloadSpeed());
            global.u_speed = prettyBytes(torrent_util.client.uploadSpeed());
            return {
                'torrents': torrents,
                'global': global
            };
        }
        else {
            return;
        }
    },
    addTorrent: function(torrent, cb) {
        console.log('torrent');
        var torrent = torrent_util.client.add(torrent);
        torrent.on('ready', function(torrent) {
            console.log('Client is downloading:', torrent)
            cb();
        });
    },
    remove: function(infoHash, cb) {
        torrent_util.client.remove(infoHash, function() {
            cb();
        })
    },
    removeAll: function(cb) {
        console.log('remove all');
        torrent_util.client.destroy(function() {
            cb();
        })
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