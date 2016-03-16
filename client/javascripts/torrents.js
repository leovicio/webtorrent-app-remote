var _ = require('underscore')
module.exports = function (app) {
  app.controller('WebTorrent', [
    '$scope',
    '$rootScope',
    'webSocket',
    'dialogs',
    '$window',
    'Notification',
    function ($scope, $rootScope, webSocket, dialogs, $window, Notification) {
      $scope.filter = {}

      // @TODO: Should I move this to a specific service / factory?
      function Torrent () {}

      Torrent.prototype._dialogDefaults = {
        size: 'lg',
        keyboard: true,
        backdrop: true,
        windowClass: 'my-class'
      }

      /**
      * Called when socket send torrent array list
      *
      * @message: message from socket
      */
      Torrent.prototype._onTorrent = function (message) {
        if (!message.data || !message.data.torrents) {
          return
        }
        $scope.safeApply(function () {
          $scope.$root.$broadcast('dialogs.wait.complete')
          $scope.torrents = message.data.torrents
          $scope.global = message.data.global
        })
        message = null
      }

      /**
      * Called after torrent is added
      */
      Torrent.prototype._onTorrentAdded = function () {
        if ($scope.torrent_added) {
          $scope.$root.$broadcast('dialogs.wait.complete')
          delete $scope.torrent_added
        }
      }

      /**
      * Called when socket sends server info (memory usage )
      *
      * @message: Message from Socket
      */
      Torrent.prototype._onServerInfo = function (message) {
        $scope.os_info = message.details.os_info
      }

      /**
      * Called after torrent is removed
      */
      Torrent.prototype._onTorretRemoved = function () {
        dialogs.notify('Torrent Removed')
        $scope.$root.$broadcast('dialogs.wait.complete')
      }

      /**
      * Called after All torrents are removed
      */
      Torrent.prototype._onTorretAllRemoved = function () {
        dialogs.notify('Torrents Removed')
        $scope.$root.$broadcast('dialogs.wait.complete')
      }

      /**
      * Shows Add Torrent Dialog
      */
      Torrent.prototype._addTorrentDialog = function (type) {
        if (torrent.dlg) return
        torrent.dlg = dialogs.create('/dialogs/add_torrent.html',
          'AddTorrentCtrl',
          {
            new_torrent_type: type
          },
          torrent._dialogDefaults)
        .result.then(torrent._addTorrentCallbackSuccess, torrent._addTorrentCallbackError)
      }

      /**
      * Called when user closes add torrent callback with success
      *
      * @torrentInfo: Can be multple or one magnet uri, or a file buffer
      */
      Torrent.prototype._addTorrentCallbackSuccess = function (torrents) {
        if (torrents) {
          dialogs.wait('Adding torrent')
          //  Check if is magnets or a single file
          _(torrents).forEach(function (v, k) {
            webSocket.emit('torrent:download', {
              torrent: v
            })
          })
          $scope.torrent_added = true
        }
        torrent.dlg = false
      }

      /**
      * Called when user closes add torrent callback with error
      */
      Torrent.prototype._addTorrentCallbackError = function () {
        dialogs.error('Not a valid torrent')
        torrent.dlg = false
      }

      /**
      * Called when user closes clicks on remove button in torrent
      *
      * @torrentHash: torrent info hash to remove
      */
      Torrent.prototype._RemoveTorrentDialog = function (torrentHash) {
        if (!torrentHash) {
          dialogs.error('Please select a torrent from the list')
          return false
        }
        var dlg = dialogs.confirm('Remove torrent?')
        dlg.result.then(function (btn) {
          dialogs.wait('Removing torrent')
          webSocket.emit('torrent:remove', {
            infoHash: torrentHash
          })
        })
      }

      /**
      * Called when user closes clicks on remove All torrents button
      */
      Torrent.prototype._RemoveAllTorrentDialog = function () {
        // @Todo: Fancy UI confirm dialog
        if (window.confirm('Remove All Torrents?')) {
          dialogs.wait('Removing torrent')
          webSocket.emit('torrent:remove_all', {})
        }
      }

      /**
      * Calls torrent Info dialog
      */
      Torrent.prototype._TorrentInfoDialog = function (torrentInfoHash) {
        dialogs.create('/dialogs/torrent_info.html', 'TorrentInfoCtrl', {
          hash: torrentInfoHash
        }, torrent._dialogDefaults)
      }

      var torrent = new Torrent()

      webSocket.on('torrents', torrent._onTorrent)

      webSocket.on('torrent:added', torrent._onTorrentAdded)

      webSocket.on('server:info', torrent._onServerInfo)

      webSocket.on('torrent:removed', torrent._onTorretRemoved)

      webSocket.on('torrent:removed_all', torrent._onTorretAllRemoved)

      /* Add new torrent to download*/
      $scope.add = function ($event, type) {
        $event.preventDefault()
        $event.stopPropagation()
        $event.stopImmediatePropagation()

        torrent._addTorrentDialog(type)
      }

      $scope.remove = torrent._RemoveTorrentDialog

      $scope.removeAll = torrent._RemoveAllTorrentDialog

      $scope.torrentInfo = torrent._TorrentInfoDialog

      $scope.safeApply = function (fn) {
        var phase = this.$root.$$phase
        if (phase === '$apply' || phase === '$digest') {
          if (fn && (typeof (fn) === 'function')) {
            fn()
          }
        } else {
          this.$apply(fn)
        }
      }

      $scope.selectTorrent = function (torrent) {
        if ($scope.active !== torrent.infoHash) {
          $scope.active = torrent.infoHash
        } else {
          $scope.active = false
        }
      }

      $scope.setFilterstatus = function ($event, status) {
        $event.preventDefault()
        $event.stopPropagation()
        $event.stopImmediatePropagation()
        $scope.filter.status = status
      }

      $scope.$on('socket:error', function (ev, data) {
        Notification.error('Error while connecting to the server')
      })

      $window.onbeforeunload = function (e) {
        webSocket.removeAllListeners()
        webSocket.disconnect()
      }

      /* Drag and drop functions */
      $scope.files = []
      $scope.$watch('files', function () {
        if ($scope.files.length) {
          torrent._addTorrentCallbackSuccess($scope.files)
        }
      })

      /*  Remove listeners when destroying controller */
      $scope.$on('$destroy', function () {
        webSocket.removeAllListeners()
      })
    }
  ])

  /**
  * Controller for torrent info
  */
  app.controller('TorrentInfoCtrl', ['$scope',
    '$modalInstance',
    'data',
    'webSocket',
    function ($scope, $modalInstance, data, webSocket) {
      $scope.loading = true
      $scope.tab = 'info'
      $scope.setTab = function (tab) {
        $scope.tab = tab
      }

      $scope.refresh = function () {
        $scope.loading = true
        webSocket.emit('torrent:get_info', {
          'infoHash': data.hash
        })
      }

      /**
      * Ask socket for torrent info
      */
      $scope.refresh()

      /**
      * Called when socket send torrent info
      */
      webSocket.on('torrent:info', function (message) {
        $scope.torrent = message.torrent
        $scope.loading = false
      })

      /**
      * Close torrent info
      */
      $scope.cancel = function () {
        $modalInstance.dismiss('Canceled')
      }
    }
  ])

  /**
  * Controller for add torrent modal
  */
  app.controller('AddTorrentCtrl', ['$scope', '$modalInstance', 'dialogs', 'data',
    function ($scope, $modalInstance, dialogs, data) {
      $scope.torrent = []
      $scope.files = []
      $scope.new_torrent_type = data.new_torrent_type

      /**
      * Called when user hits cancel button in modal
      */
      $scope.cancel = function () {
        $modalInstance.dismiss('Canceled')
      } // end cancel

      /**
      * Called when use hits save button or after uploads a valid file
      */
      $scope.save = function (file) {
        var $valid = false
        if ($scope.torrent.torrentMagnet) {
          var magnets = $scope.torrent.torrentMagnet.split('\n')
          _(magnets).forEach(function (v, k) {
            if (v.match('magnet:?')) {
              $valid = true
            }
            if (v.match('.torrent') && v.match(/http(s)?/i)) {
              $valid = true
            }
          })
          if ($valid) {
            $modalInstance.close(magnets)
          } else {
            dialogs.error('Error', 'Not a valid magnet uri / or url file')
          }
        } else if ($scope.files) {
          _($scope.files).forEach(function (v, k) {
            if (v.name.match('.torrent')) {
              $valid = true
            }
          })
          if ($valid) {
            $modalInstance.close($scope.files)
          }
        }
      }
    }
  ])
}
