var app = angular.module('webtorrent', ['ui.bootstrap']);

app.controller('WebTorrent', [
    '$scope',
    '$http',
    function($scope, $http) {
        $scope.filter = {};

        var $lock = false;
        $scope.updateTorrents = function() {
            if (!$lock) {
                $lock = true;
            }
            $http.get('/api/torrents', {
                timeout: 3000
            }).
            then(function(response) {
                $lock = false;
                $scope.safeApply(function() {
                    $scope.torrents = response.data.torrents;
                    $scope.global = response.data.global;
                });
            }, function(response) {
                $lock = false;
            });
        };

        $scope.updateTorrents();

        setInterval($scope.updateTorrents, 10000);

        $scope.add = function() {
            var magnet = prompt("Magnet: ", "magnet:?xt=urn:btih:1619ecc9373c3639f4ee3e261638f29b33a6cbd6&dn=Ubuntu+14.10+i386+%28Desktop+ISO%29&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A80&tr=udp%3A%2F%2Fopen.demonii.com%3A1337&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Fexodus.desync.com%3A6969");
            if (magnet) {
                $http.post('/api/add', {
                    magnet: magnet
                }).
                then(function(response) {
                    $scope.torrent = response.torrent;
                    $scope.updateTorrents();
                }, function(response) {

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
            if($scope.active !== torrent.infoHash)
                $scope.active = torrent.infoHash;
            else
                $scope.active = false;
        };
    }
]);