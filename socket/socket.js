module.exports = function(io, torrent_util) {
    'use strict';
    io.on('connection', function(socket) {

        socket.emit('init', {
            welcome: 'welcome to the jangle nanananananana ai ai '
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
            torrent_util.addTorrent(data.magnet, function() {
                socket.emit('torrent:added', {
                    success: true
                });
            })
        });

    });
};