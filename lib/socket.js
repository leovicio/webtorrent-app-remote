module.exports = function(io, torrent_util, tracker) {
    'use strict';
    var clients = [];
    var crons = [];
    
    io.sockets.on('connection', function(socket) {
        var roomid=socket.id;
        clients.push(socket.id);
        console.log('Room id' + roomid);
        crons[socket.id] = [];
        
        socket.emit('init', {
            welcome: 'welcome to the jungle nanananananana ai ai '
        });
        
        var sendTorrents = function(){
            torrent_util.getTorrents(function(torrents) {
                io.to(socket.id).emit('torrents', {
                    data: torrents
                });
            });
        };
        socket.on('startCrons', function(data) {
            if(!crons[socket.id]['torrents']){
                crons[socket.id]['torrents'] = setInterval(sendTorrents, 2500);
                sendTorrents();
            }
            
            if(!crons[socket.id]['server']){
                crons[socket.id]['server'] = setInterval(sendServerInfo, 10000);
                sendServerInfo();
            }
        });

        var sendServerInfo = function(){
            torrent_util.serverInfo(function(details) {
                io.to(socket.id).emit('server:info', {
                    details: details
                });
            });
        };
        
        socket.on('torrent:download', function(data) {
            torrent_util.addTorrent(data.torrent, function() {
                io.to(socket.id).emit('torrent:added', {
                    success: true,
                });
            });
        });

        socket.on('torrent:remove', function(data) {
            torrent_util.remove(data.infoHash, function() {
                io.to(socket.id).emit('torrent:removed', {
                    success: true
                });
            });
        });

        socket.on('torrent:remove_all', function(data) {
            torrent_util.removeAll(function() {
                var WebTorrent = require('webtorrent-hybrid');
                torrent_util.client = new WebTorrent();
                io.to(socket.id).emit('torrent:removed_all', {
                    success: true
                });
            });
        });

        socket.on('torrent:get_info', function(data) {
            console.log('get torrent');
            torrent_util.getTorrent(data.infoHash, function(torrent) {
                io.to(socket.id).emit('torrent:info', {
                    torrent: torrent
                });
            });
        });

        socket.on('tracker:getOptions', function() {
            tracker.getOptions(function(options) {
                io.to(socket.id).emit('tracker:options', {
                    options: options
                });
            });
        });
        
        socket.on('tracker:saveOptions', function(options) {
            tracker.saveOptions(options, function(res) {
                io.to(socket.id).emit('tracker:optionsSaved', {
                    options: res
                });
            });
        });        
        
        socket.on('tracker:getTracker', function(data) {
            tracker.getTracker(function(details) {
                io.to(socket.id).emit('tracker:details', {
                    details: details
                });
            });
        });
        
        socket.on('disconnect', function() {
            clearInterval(crons[socket.id]['server']);
            clearInterval(crons[socket.id]['torrent']);
            delete clients[socket.id];
            console.info('Client gone (id=' + socket.id + ').');
        });
    });
};