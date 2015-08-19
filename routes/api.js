var express = require('express');
var router = express.Router();
var WebTorrent = require('webtorrent-hybrid');
var prettyBytes = require('pretty-bytes')
var client = new WebTorrent();

router.get('/torrents', function(req, res, next) {
    var torrents = [];
    var torrent = {};
    var global = {};
    var fs = require('fs');

    for(var i in client.torrents){
        torrent = {};
        torrent.name = client.torrents[i].name;
        torrent.progress = (100 * client.torrents[i].downloaded / client.torrents[i].parsedTorrent.length).toFixed(1);
        torrent.peers = client.torrents[i].swarm.wires.length;
        torrent.d_speed = prettyBytes(client.downloadSpeed());
        torrent.u_speed = prettyBytes(client.uploadSpeed());
        torrents.push(torrent);
        torrent = null
    }
    
    global.ratio = client.ratio;
    res.send({
        torrents: torrents,
        global: global,
        "success": true
    });
});

router.post('/add', function(req, res, next) {
    var magnet = req.body.magnet;
    client.add(magnet, function(torrent) {
        res.send({
            torrent: torrent.infoHash,
            "success": true
        });
    });

});

router.get('/torrent/', function(req, res, next){
    var torrent = client.get(req.body.infoHash);
    var return_info = {}
    return_info.name=torrent.name;
    return_info.progress = (100 * torrent.downloaded / torrent.parsedTorrent.length).toFixed(1);
    return_info.peers = torrent.swarm.wires.length;
    return_info.d_speed = prettyBytes(client.downloadSpeed());
    return_info.u_speed = prettyBytes(client.uploadSpeed());    
});


module.exports = router;
