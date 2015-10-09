var _ = require('underscore')
module.exports = function (app) {
  app.controller('CreateTorrent', [
    '$scope',
    'webSocket',
    '$dialogs',
    '$window',
    'Notification',
    function ($scope, webSocket, $dialogs, $window, Notification) {
      var client = new WebTorrent()
      
      $scope.files = []
      
      $scope.callback = function (file) {
        $scope.files.push(file)
      }

      var dlg = false      
      $scope.create = function () {
        if (dlg) return
        dlg = $dialogs.create('/dialogs/create_torrent.html', 'CreateTorrent')
          .result.then(function (files) {
            $dialogs.wait('Creating Torrent')
            var buffers = []
            _.each(files, function(v, k) {
              buffers.push(v.content)
            })
            
            client.seed(buffers, function() {
              $scope.$root.$broadcast('dialogs.wait.complete')
            })
            dlg = false
          }, function () {
            dlg = false
          })
      }
      
      $scope.remove = function (file) {
        var index = $scope.files.indexOf(file);
        $scope.files.splice(index, 1);
      }

      $window.onbeforeunload = function (e) {
        window.confirm('You\'re still uploading the file, are you sure you\'re gonna leave?')
      }
      
    }])
}