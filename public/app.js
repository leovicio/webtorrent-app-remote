var app = angular.module('webtorrent', ['btford.socket-io', 'ui.bootstrap']);

app.factory('webSocket', function(socketFactory) {
    var myIoSocket = io.connect('wss://62.75.213.174:3001/', {
        'transports': ['websocket', 'polling']
    });
    var mySocket = socketFactory({
        ioSocket: myIoSocket
    });
    return mySocket;
})
app.controller('WebTorrent', [
    '$scope',
    '$http',
    'webSocket',
    function($scope, $http, webSocket) {
        $scope.filter = {};

        var $lock = false;

        /* Update torrent list */
        webSocket.on('torrents', function(message) {
            $scope.torrents = message.data.torrents;
            $scope.global = message.data.global;
        });


        /* Add new torrent to download*/
        $scope.add = function() {
            var magnet = prompt("Magnet: ", "magnet:?xt=urn:btih:1619ecc9373c3639f4ee3e261638f29b33a6cbd6&dn=Ubuntu+14.10+i386+%28Desktop+ISO%29&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A80&tr=udp%3A%2F%2Fopen.demonii.com%3A1337&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Fexodus.desync.com%3A6969");
            if (magnet) {
                webSocket.emit('torrent:download', {
                    magnet: magnet
                }, function(result) {
                    console.log('Waiting torrent to Add');
                });
                webSocket.on('torrent:added', function(message) {
                    console.log('Torrent Added');
                });
            }
        };

        $scope.remove = function(torrentHash){
            if(!torrentHash){
                alert('Please select a torrent from the list');
                return false;
            }
            if(confirm('Remove torrent?')){
                webSocket.emit('torrent:download', {
                    infoHash: torrentHash
                }, function(result) {
                    console.log('Waiting torrent to remove');
                });
                webSocket.on('torrent:removed', function(message) {
                    console.log('Torrent Removed');
                });
            }
        };
        
        $scope.removeAll = function(){
            if(confirm('Remove All Torrents?')){
                webSocket.emit('torrent:remove_all', {}, function(result) {
                    console.log('Waiting torrent to remove');
                });
                webSocket.on('torrent:removed_all', function(message) {
                    console.log('Torrents Removed');
                });
            }
        };
        
        $scope.safeApply = function(fn) {
            var phase = this.$root.$$phase;
            if (phase == '$apply' || phase == '$digest') {
                if (fn && (typeof(fn) === 'function')) {
                    fn();
                }
            }
            else {
                this.$apply(fn);
            }
        };

        $scope.selectTorrent = function(torrent) {
            if ($scope.active !== torrent.infoHash)
                $scope.active = torrent.infoHash;
            else
                $scope.active = false;
        };
        
    }
]);