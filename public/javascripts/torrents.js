app.controller('WebTorrent', [
    '$scope',
    '$http',
    'webSocket',
    '$dialogs',
    '$interval',
    '$rootScope',
    '$window',
    'Notification',
    function($scope, $http, webSocket, $dialogs, $timeout, $rootScope, $window, Notification) {
        $scope.filter = {};

        $rootScope.registerEvents = false;

        $scope.initEvents = function() {
            if ($rootScope.registerEvents) return;
            $rootScope.registerEvents = true;
            //@TODO: Create something to enable debug
            //console.log('Register Events');
            
            /* Update torrent list */
            webSocket.on('torrents', function(message) {
                //@TODO: Create something to enable debug
                //console.log('Got torrent');
                //Remove torrent add progress. this is VERY Ugly, I guess.
                if ($scope.torrent_added) {
                    $rootScope.$broadcast('dialogs.wait.complete');
                    delete $scope.torrent_added;
                }
                if (message.data && message.data.torrents) {
                    $scope.torrents = message.data.torrents;
                    $scope.global = message.data.global;
                    $scope.os_info = message.data.os_info;
                }
                message = null;
                $rootScope.torrentInterval = $timeout(function() {
                    webSocket.emit('torrent:getAll');
                }, 2500);                
            });
        };

        $scope.$on('socket:connect', function(ev, data) {
            Notification.clearAll();
        });

        $scope.$on('socket:error', function(ev, data) {
            Notification.error('Error while connecting to the server');
        });

        $window.onbeforeunload = function(e) {
            webSocket.disconnect();
        };

        $scope.$on('$destroy', function() {
            $timeout.cancel($rootScope.torrentInterval);
            $rootScope.torrentInterval = false;
            $rootScope.registerEvents = false;
            webSocket.removeAllListeners();
        });

        /* Add new torrent to download*/
        var dlg;
        $scope.add = function($event, type) {
            if (dlg) return;
            $rootScope.new_torrent_type = type;
            dlg = $dialogs.create('/dialogs/add_torrent.html', 'AddTorrentCtrl', {}, {
                size: 'lg',
                keyboard: true,
                backdrop: true,
                windowClass: 'my-class'
            });
            //torrentInfo can be a magnet, .torrent file buffer and my other options that webtorrent accepts
            dlg.result.then(function(torrentInfo) {
                if (torrentInfo) {
                    $dialogs.wait('Adding torrent');
                    //Check if is magnets or a single file
                    if (torrentInfo instanceof Array) {
                        _(torrentInfo).forEach(function(v, k) {
                            webSocket.emit('torrent:download', {
                                torrent: v
                            });
                        });
                    }
                    else {
                        webSocket.emit('torrent:download', {
                            torrent: torrentInfo
                        });
                    }
                    $scope.torrent_added = true;
                    dlg = false;
                }
            }, function() {});
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
                    //@TODO: Create something to enable debug
                    //console.log('Waiting torrent to remove');
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

        $scope.setFilterstatus = function($event, status) {
            $event.preventDefault();
            $event.stopPropagation();
            $event.stopImmediatePropagation();
            $scope.filter.status = status;
        };

        $scope.torrentInfo = function(torrentInfoHash) {
            var dlg = $dialogs.create('/dialogs/torrent_info.html', 'TorrentInfoCtrl', {
                hash: torrentInfoHash
            }, {
                size: 'lg',
                keyboard: true,
                backdrop: false,
                windowClass: 'my-class'
            });
        };

    }
]);

app.controller('TorrentInfoCtrl', ['$scope', '$modalInstance', 'dialogs', 'data', 'webSocket', '$rootScope', function($scope, $modalInstance, $dialogs, data, webSocket, $rootScope) {

    webSocket.emit('torrent:get_info', {
        'infoHash': data.hash
    }, function(result) {
        //@TODO: Create something to enable debug
        //console.log('Getting Torrent Info');
    });
    webSocket.on('torrent:info', function(message) {
        $scope.torrent = message.torrent;
    });

    $scope.cancel = function() {
        $modalInstance.dismiss('Canceled');
    }; // end cancel

}]);

app.controller('AddTorrentCtrl', ['$scope', '$modalInstance', '$dialogs', '$rootScope',
    function($scope, $modalInstance, $dialogs, $rootScope) {

        $scope.torrent = [];

        $scope.callback = function(file) {

            var extname = file.name.split('.').pop();
            if (extname === 'torrent') {
                $scope.save(file.content);
            }
            else {
                $dialogs.error('Error', 'Not a valid torrent file');
            }

        };

        $scope.cancel = function() {
            $modalInstance.dismiss('Canceled');
        }; // end cancel

        $scope.save = function(file) {
            if ($scope.torrent.torrentMagnet) {
                var $valid = false;
                var magnets = $scope.torrent.torrentMagnet.split('\n');
                _(magnets).forEach(function(v, k) {
                    if (v.match('magnet:?')) {
                        $valid = true;
                    }
                });
                if ($valid) {
                    $modalInstance.close(magnets);
                }
                else {
                    $dialogs.error('Error', 'Not a valid magnet uri');
                }
            }
            else if (file) {
                $modalInstance.close(file);
            }
        }; // end save
    }
]);