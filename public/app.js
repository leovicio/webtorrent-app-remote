var app = angular.module('webtorrent', ['ui.bootstrap']);

app.controller('WebTorrent', [
    '$scope',
    '$http',
    function($scope, $http) {
        var $lock = false;
        $scope.updateTorrents = function() {
            if(!$lock){
                $lock = true;
            }
            $http.get('/api/torrents', {timeout: 3000}).
                then(function(response) {
                    $lock = false;
                    $scope.safeApply(function(){
                        $scope.torrents = response.data.torrents;
                        $scope.global = response.data.global;
                    });
                }, function(response) {
                    $lock = false;
                });
        };

        $scope.updateTorrents();
        
        setInterval($scope.updateTorrents, 4000);
        
        $scope.add = function(){
            var magnet = prompt("Magnet: ");
            if(magnet){
                $http.post('/api/add', {magnet: magnet}).
                    then(function(response) {
                        $scope.torrent = response.torrent;
                        $scope.updateTorrents();
                    }, function(response) {
        
                    });
            }
        };
        
        $scope.safeApply = function(fn) {
          var phase = this.$root.$$phase;
          if(phase == '$apply' || phase == '$digest') {
            if(fn && (typeof(fn) === 'function')) {
              fn();
            }
          } else {
            this.$apply(fn);
          }
        };
    }
]);