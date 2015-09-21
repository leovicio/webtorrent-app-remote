var prettyBytes = require('pretty-bytes');
var moment = require('moment');

var torrent_util = {
    client: false,
    getTorrents: function() {
        var torrents = [];
        var torrent = {};
        var global = {};

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
                    if (torrent_util.client.torrents[i].length) {
                        torrent.downloaded = prettyBytes(torrent_util.client.torrents[i].downloaded) + '/' + prettyBytes(torrent_util.client.torrents[i].length);
                        torrent.status = (torrent_util.client.torrents[i].downloaded >= torrent_util.client.torrents[i].length) ? 2 : 1;
                    }
                    else {
                        torrent.status = 2;
                    }
                    if (torrent_util.client.torrents[i].swarm.uploaded)
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
        console.log('Add torrent');
        torrent_util.client.add(torrent, {path: '/home/torrents'}, cb(torrent));
    },
    remove: function(infoHash, cb) {
        torrent_util.client.remove(infoHash, cb);
    },
    removeAll: function(cb) {
        torrent_util.client.destroy(cb);
    },
    getTorrent: function(infoHash, cb) {
        var torrent = {};
        var get_torrent = torrent_util.client.get(infoHash);
        torrent.infoHash = get_torrent.infoHash;
        torrent.name = get_torrent.name;
        torrent.progress = (100 * get_torrent.progress).toFixed(1);
        if (get_torrent.swarm) {
            torrent.peers = get_torrent.swarm.wires.length;
            torrent.d_speed = prettyBytes(get_torrent.swarm.downloadSpeed());
            torrent.u_speed = prettyBytes(get_torrent.swarm.uploadSpeed());
            if (get_torrent.length) {
                torrent.size = prettyBytes(get_torrent.length);
                torrent.downloaded = prettyBytes(get_torrent.downloaded); 
                torrent.status = (get_torrent.downloaded >= get_torrent.length) ? 2 : 1;
            } else {
                torrent.status = 2;
            }
            if (get_torrent.swarm.uploaded)
                torrent.uploaded = prettyBytes(get_torrent.swarm.uploaded);
            else
                torrent.uploaded = prettyBytes(0);

            if(get_torrent.swarm.ratio)
                torrent.ratio = Math.round(get_torrent.swarm.ratio * 100) / 100;
            else
                torrent.ratio = 0;
            
            torrent.files = Array();
            for(var file in get_torrent.files){
                var f = get_torrent.files[file];
                console.log(f.length + ' ' + f.name);
                torrent.files.push({'name': f.name, 'path': f.path, 'size': prettyBytes(f.length)})
            }
            torrent.estimate = moment.duration(torrent.timeRemaining / 1000, 'seconds').humanize();
            torrent.location = get_torrent.path;
        }
        cb(torrent);
        torrent = null;
    }

}

module.exports = torrent_util;