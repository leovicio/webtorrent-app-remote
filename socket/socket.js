module.exports = function(io, torrent_util) {
    'use strict';
    io.on('connection', function(socket) {

        console.log('Client connected');
        var lock_update = false;
        socket.emit('init', {
            welcome: 'welcome to the jungle nanananananana ai ai '
        });

        socket.emit('torrents', {
            data: torrent_util.getTorrents()
        });
        
        socket.on('torrent:getAll', function(data) {
            console.log('Client asked for torrents');
            socket.emit('torrents', {
                data: torrent_util.getTorrents()
            });
        });

        socket.on('torrent:download', function(data) {
            console.log('New torrent:', data);
            torrent_util.addTorrent(data.torrent, function() {
                socket.emit('torrent:added', {
                    success: true,
                });
            });
        });
        
        socket.on('torrent:remove', function(data){
            torrent_util.remove(data.infoHash, function(){
                socket.emit('torrent:removed', {
                    success: true
                });
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
        
        socket.on('torrent:get_info', function(data){
            torrent_util.getTorrent(data.infoHash, function(torrent){
                socket.emit('torrent:info', {
                    torrent: torrent
                });
            });
        });

    });
};