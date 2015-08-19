var app = angular.module('webtorrent', ['ui.bootstrap']);

app.controller('WebTorrent', [
    '$scope',
    '$http',
    function($scope, $http) {

        $scope.updateTorrents = function() {
            $http.get('/api/torrents').
                then(function(response) {
                    $scope.safeApply(function(){
                        $scope.torrents = response.data.torrents;
                    });
                }, function(response) {
    
                });
        };

        $scope.updateTorrents();
        
        setInterval($scope.updateTorrents, 10000);
        
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