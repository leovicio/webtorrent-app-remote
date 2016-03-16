/* global WebTorrent */
module.exports = function (app, Torrent) {
  app.controller('CreateTorrent', [
    '$scope',
    'webSocket',
    'dialogs',
    '$window',
    '$interval',
    function ($scope, webSocket, dialogs, $window, $interval) {
      global.WEBTORRENT_ANNOUNCE = []
      webSocket.emit('tracker:getOptions')

      webSocket.on('tracker:options', function (message) {
        if (message.options.tracker_ws && message.options.host_name !== '0.0.0.0') {
          global.WEBTORRENT_ANNOUNCE.push('ws://' + message.options.host_name + ':' + message.options.port)
        }
        if (message.options.tracker_http && message.options.host_name !== '0.0.0.0') {
          global.WEBTORRENT_ANNOUNCE.push('http://' + message.options.host_name + ':' + message.options.port + '/anounce')
        }
        if (message.options.tracker_udp && message.options.host_name !== '0.0.0.0') {
          global.WEBTORRENT_ANNOUNCE.push('udp://' + message.options.host_name + ':' + message.options.port)
        }
      })

      var client = new WebTorrent()

      Torrent = new Torrent()
      Torrent.client = client

      $interval(function () {
        Torrent.getTorrents(function (message) {
          $scope.self_torrents = message.torrents
        }, window.localStorage.getItem('user_id'))
      }, 2500)

      var dlg = false
      $scope.create = function () {
        if (dlg) return

        dlg = dialogs.create('/dialogs/create_torrent.html', 'CreateTorrentModal')
          .result.then(function ($result) {
            var files = $result.files
            var trackers = $result.trackers
            if (!files) {
              dlg = false
              return false
            }
            global.WEBTORRENT_ANNOUNCE = trackers.split('\n')
            dialogs.wait('Creating Torrent')
            client.seed(files, function (torrent) {
              dialogs.notify('Torrent Added', 'MagnetURI: <br />' + torrent.magnetURI)
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

      /* Drag and drop functions */
      $scope.files = []
      $scope.$watch('files', function () {
        if ($scope.files.length) {
          $scope.create($scope.files)
          $scope.$root.files = $scope.files
        }
      })

      $window.onbeforeunload = function (e) {
        window.confirm('You\'re still uploading the file, are you sure you\'re gonna leave?')
      }
    }])
  app.controller('CreateTorrentModal', [
    '$scope',
    '$modalInstance',
    'dialogs',
    'data',
    function ($scope, $modalInstance, dialogs, data) {
      if ($scope.$root.files) {
        $scope.files = $scope.$root.files
      }
      $scope.save = function () {
        var $result = {'files': $scope.files, 'trackers': $scope.trackers}
        $modalInstance.close($result)
      }

      $scope.trackers = global.WEBTORRENT_ANNOUNCE.join('\n')

      $scope.close = function () {
        $modalInstance.close(false)
      }

      $scope.remove = function (index) {
        $scope.files.splice(index, 1)
      }
    }])
}
