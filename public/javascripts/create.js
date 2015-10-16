module.exports = function (app, WebTorrent, Torrent) {
  app.controller('CreateTorrent', [
    '$scope',
    'webSocket',
    '$dialogs',
    '$window',
    '$interval',
    function ($scope, webSocket, $dialogs, $window, $interval) {
      var client = new WebTorrent()

      Torrent = new Torrent()
      Torrent.client = client

      $interval(function () {
        Torrent.getTorrents(function (message) {
          $scope.self_torrents = message.torrents
        })
      }, 2000)
      
      var dlg = false
      $scope.create = function () {
        if (dlg) return

        dlg = $dialogs.create('/dialogs/create_torrent.html', 'CreateTorrentModal')
          .result.then(function (files) {
            if (!files) {
              dlg = false
              return false
            }
            $dialogs.wait('Creating Torrent')
            client.seed(files, function (torrent) {
              $dialogs.notify('Torrent Added', 'MagnetURI: <br />' + torrent.magnetURI)
              webSocket.emit('torrent:download', {
                torrent: torrent.magnetURI
              })
              $scope.$root.$broadcast('dialogs.wait.complete')
            })
            dlg = false
          }, function () {
            dlg = false
          })
      }

      $window.onbeforeunload = function (e) {
        window.confirm('You\'re still uploading the file, are you sure you\'re gonna leave?')
      }
    }])
  app.controller('CreateTorrentModal', [
    '$scope',
    '$modalInstance',
    '$dialogs',
    function ($scope, $modalInstance, $dialogs) {
      $scope.save = function () {
        $modalInstance.close($scope.files)
      }

      $scope.close = function () {
        $modalInstance.close(false)
      }

      $scope.remove = function (index) {
        $scope.files.splice(index, 1)
      }
    }])
}
