var express = require('express');
var router = express.Router();
var WebTorrent = require('webtorrent-hybrid');
var prettyBytes = require('pretty-bytes')
var client = new WebTorrent();

router.get('/torrents', function(req, res, next) {
    var torrents = [];
    var torrent = {};
    var fs = require('fs');

    var cache = [];
    var d = JSON.stringify(client.torrents, function(key, value) {
        if (typeof value === 'object' && value !== null) {
            if (cache.indexOf(value) !== -1) {
                // Circular reference found, discard key
                return;
            }
            // Store value in our collection
            cache.push(value);
        }
        return value;
    });
    cache = null; // Enable garbage collection

    var file = fs.createWriteStream('array.txt');
    file.on('error', function(err) { /* error handling */ });
    file.write(JSON.stringify(d));
    file.end();

    for(var i in client.torrents){
        torrent.name = client.torrents[i].name;
        console.log(torrent.swarm);
        if(torrent.parsedTorrent)
            torrent.progress = (100 * torrent.downloaded / torrent.parsedTorrent.length).toFixed(1);
        else
            torrent.progress = 0;
        
        if(torrent.swarm && torrent.swarm.wires)
            torrent.peers = torrent.swarm.wires.length;
        else
            torrent.peers = 0;
            
        torrent.d_speed = prettyBytes(client.downloadSpeed());
        torrent.u_speed = prettyBytes(client.uploadSpeed());
        torrents.push(torrent);
        console.log(torrent);
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
