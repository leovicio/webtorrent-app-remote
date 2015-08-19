var express = require('express');
var router = express.Router();
var WebTorrent = require('webtorrent-hybrid');
var prettyBytes = require('pretty-bytes')
var client = new WebTorrent();

router.get('/torrents', function(req, res, next) {
    var torrents = [];
    var torrent = {};
    var fs = require('fs');

    for(var i in client.torrents){
        torrent = {};
        torrent.name = client.torrents[i].name;

        if(client.torrents[i].parsedTorrent)
            torrent.progress = (100 * client.torrents[i].downloaded / client.torrents[i].parsedTorrent.length).toFixed(1);
        else
            torrent.progress = 0;
        
        if(client.torrents[i].swarm && client.torrents[i].swarm.wires)
            torrent.peers = client.torrents[i].swarm.wires.length;
        else
            torrent.peers = 0;
            
        torrent.d_speed = prettyBytes(client.downloadSpeed());
        torrent.u_speed = prettyBytes(client.uploadSpeed());
        torrents.push(torrent);
        torrent = null
    }
    res.send({
        torrents: torrents,
        "success": true
    });
});

router.post('/add', function(req, res, next) {
    console.log(req.body);
    var magnet = req.body.magnet;
    client.add(magnet, function(torrent) {
        console.log(torrent.infoHash);
        res.send({
            torrent: JSON.stringify(torrent.infoHash),
            "success": true
        });
    });

});


module.exports = router;
