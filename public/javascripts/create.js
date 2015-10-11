module.exports = function (app, WebTorrent) {
  app.controller('CreateTorrent', [
    '$scope',
    'webSocket',
    '$dialogs',
    '$window',
    function ($scope, webSocket, $dialogs, $window) {
      var client = new WebTorrent()

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
