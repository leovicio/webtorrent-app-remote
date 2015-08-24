var app = angular.module('webtorrent', [
    'btford.socket-io',
    'ui.bootstrap',
    'dialogs.main',
    'pascalprecht.translate',
    'dialogs.default-translations',
    'angularFileInput',
    'ui-notification'
]);

app.run(['$templateCache', '$interpolate', function($templateCache, $interpolate) {

    // get interpolation symbol (possible that someone may have changed it in their application instead of using '{{}}')
    var startSym = $interpolate.startSymbol();
    var endSym = $interpolate.endSymbol();

}]); // end run / dialogs.main
app.factory('webSocket', function(socketFactory) {
    var myIoSocket = io.connect('wss://62.75.213.174:3001/', {
        'transports': ['websocket', 'polling']
    });
    var mySocket = socketFactory({
        ioSocket: myIoSocket
    });
    mySocket.forward('error');
    mySocket.forward('connect');
    return mySocket;
})
app.controller('WebTorrent', [
    '$scope',
    '$http',
    'webSocket',
    'dialogs',
    '$rootScope',
    '$window',
    'Notification',
    function($scope, $http, webSocket, $dialogs, $rootScope, $window, Notification) {
        $scope.filter = {};

        $scope.$on('socket:connect', function (ev, data) {
            Notification.clearAll();
        });
        
        $scope.$on('socket:error', function (ev, data) {
            Notification.error('Error while connecting to the server');   
        });
        
        $window.onbeforeunload = function(e) {
            webSocket.disconnect();
        };

        var $lock = false;

        /* Update torrent list */
        webSocket.on('torrents', function(message) {
            $scope.torrents = message.data.torrents;
            $scope.global = message.data.global;
        });


        /* Add new torrent to download*/
        $scope.add = function() {
            var dlg = $dialogs.create('/dialogs/add_torrent.html', 'AddTorrentCtrl', {}, {
                size: 'lg',
                keyboard: true,
                backdrop: false,
                windowClass: 'my-class'
            });
            //torrentInfo can be a magnet, .torrent file buffer and my other options that webtorrent accepts
            dlg.result.then(function(torrentInfo) {
                if (torrentInfo) {
                    $dialogs.wait('Adding torrent');
                    webSocket.emit('torrent:download', {
                        torrent: torrentInfo
                    }, function(result) {
                        console.log('Waiting torrent to Add');
                    });
                    webSocket.on('torrent:added', function(message) {
                        console.log('Torrent Added');
                        $rootScope.$broadcast('dialogs.wait.complete');
                    });
                }
            }, function() {

            });
            //var magnet = prompt("Magnet: ", "magnet:?xt=urn:btih:1619ecc9373c3639f4ee3e261638f29b33a6cbd6&dn=Ubuntu+14.10+i386+%28Desktop+ISO%29&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A80&tr=udp%3A%2F%2Fopen.demonii.com%3A1337&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Fexodus.desync.com%3A6969");

        };

        $scope.remove = function(torrentHash) {
            if (!torrentHash) {
                $dialogs.error('Please select a torrent from the list');
                return false;
            }
            var dlg = $dialogs.confirm('Remove torrent?');
            dlg.result.then(function(btn) {
                $dialogs.wait('Removing torrent');
                webSocket.emit('torrent:remove', {
                    infoHash: torrentHash
                }, function(result) {
                    $
                });
                webSocket.on('torrent:removed', function(message) {
                    $dialogs.notify('Torrent Removed');
                    $rootScope.$broadcast('dialogs.wait.complete');
                });
            }, function(btn) {


            });

        };

        $scope.removeAll = function() {
            if (confirm('Remove All Torrents?')) {
                $dialogs.wait('Removing torrent');
                webSocket.emit('torrent:remove_all', {}, function(result) {
                    console.log('Waiting torrent to remove');
                });
                webSocket.on('torrent:removed_all', function(message) {
                    $dialogs.notify('Torrents Removed');
                    $rootScope.$broadcast('dialogs.wait.complete');
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
        
        $scope.setFilterstatus = function(status){
            $scope.filter.status = status;
        };

    }
]);

app.controller('AddTorrentCtrl', ['$scope', '$modalInstance', 'dialogs', function($scope, $modalInstance, $dialogs) {

    $scope.callback = function(file) {

        var extname = file.name.split('.').pop();
        if (extname === 'torrent') {
            $scope.save(file.content);
        } else {
            $dialogs.error('Error', 'Not a valid torrent file');
        }

    };

    $scope.cancel = function() {
        $modalInstance.dismiss('Canceled');
    }; // end cancel

    $scope.save = function(file) {
        if ($scope.torrentMagnet){
            var data = $scope.torrentMagnet.split('magnet:?')[1]
            if (data && data.length > 0) {
                $modalInstance.close($scope.torrentMagnet);
            }else{
                $dialogs.error('Error', 'Not a valid magnet uri');
            }
        }else if (file) {
            $modalInstance.close(file);
        }
    }; // end save


    $scope.hitEnter = function(evt) {
        if (angular.equals(evt.keyCode, 13) && !(angular.equals($scope.torrentMagnet, null)))
            $scope.save();
    };
}]);
