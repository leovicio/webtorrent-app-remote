module.exports = function(io, torrent_util, tracker) {
    'use strict';
    io.on('connection', function(socket) {
        socket.emit('init', {
            welcome: 'welcome to the jungle nanananananana ai ai '
        });
        
        socket.on('torrent:getAll', function(data) {
            torrent_util.getTorrents(function(torrents) {
                socket.emit('torrents', {
                    data: torrents
                });
            });
        });

        socket.on('torrent:download', function(data) {
            torrent_util.addTorrent(data.torrent, function() {
                socket.emit('torrent:added', {
                    success: true,
                });
            });
        });

        socket.on('torrent:remove', function(data) {
            torrent_util.remove(data.infoHash, function() {
                socket.emit('torrent:removed', {
                    success: true
                });
            });
        });

        socket.on('torrent:remove_all', function(data) {
            torrent_util.removeAll(function() {
                var WebTorrent = require('webtorrent-hybrid');
                torrent_util.client = new WebTorrent();
                socket.emit('torrent:removed_all', {
                    success: true
                });
            });
        });

        socket.on('torrent:get_info', function(data) {
            torrent_util.getTorrent(data.infoHash, function(torrent) {
                socket.emit('torrent:info', {
                    torrent: torrent
                });
            });
        });

        socket.on('tracker:getOptions', function() {
            tracker.getOptions(function(options) {
                socket.emit('tracker:options', {
                    options: options
                });
            });
        });
        
        socket.on('tracker:saveOptions', function(options) {
            tracker.saveOptions(options, function(res) {
                socket.emit('tracker:optionsSaved', {
                    options: res
                });
            });
        });        
        
        socket.on('tracker:getTracker', function(data) {
            tracker.getTracker(function(details) {
                socket.emit('tracker:details', {
                    details: details
                });
            });
        });
        
        socket.on('server:getInfo', function() {
            torrent_util.serverInfo(function(details) {
                socket.emit('server:info', {
                    details: details
                });
            });
        });        
    });
};