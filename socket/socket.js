module.exports = function(io, torrent_util) {
    'use strict';
    io.on('connection', function(socket) {

        var lock_update = false;
        socket.emit('init', {
            welcome: 'welcome to the jungle nanananananana ai ai '
        });

        socket.emit('torrents', {
            data: torrent_util.getTorrents()
        });
        
        setInterval(function() {
            socket.emit('torrents', {
                data: torrent_util.getTorrents()
            });
        }, 5000);

        socket.on('torrent:download', function(data) {
            if(!lock_update){
                torrent_util.addTorrent(data.magnet, function() {
                    socket.emit('torrent:added', {
                        success: true
                    });
                });
            }
        });
        
        socket.on('torrent:remove', function(data){
            lock_update = true;
            torrent_util.remove(data.infoHash, function(){
                socket.emit('torrent:removed', {
                    success: true
                });
                lock_update = false;
            });
            
        });
        
        socket.on('torrent:remove_all', function(data){
            lock_update = true;
            torrent_util.removeAll(function(){
                var WebTorrent = require('webtorrent-hybrid');
                torrent_util.client = new WebTorrent();
                socket.emit('torrent:removed_all', {
                    success: true
                });
                lock_update = false;
            });
            
        });

    });
};