module.exports = function (app) {
  app.controller('TrackerServer', ['$scope',
    'webSocket',
    'Notification',
    function ($scope, webSocket, Notification) {
      $scope.tab = 'details'

      /**
      * Ask for socket: Tracker options and tracker info 
      */
      webSocket.emit('tracker:getOptions')
      webSocket.emit('tracker:getTracker')

      /**
      * Called when tracker send details
      */
      webSocket.on('tracker:details', function (message) {
        $scope.tracker = message.details
      })

      /**
      * Called when tracker send options
      */
      webSocket.on('tracker:options', function (message) {
        $scope.tracker_opts = message.options
      })

      /**
      * Set active tab (settings or tracker info)
      */
      $scope.setTab = function ($event, tab) {
        $event.preventDefault()
        $event.stopPropagation()
        $event.stopImmediatePropagation()
        $scope.tab = tab
      }

      /**
      * Save tracker options
      */
      $scope.saveOptions = function ($event) {
        $event.preventDefault()
        $event.stopPropagation()
        $event.stopImmediatePropagation()
        webSocket.emit('tracker:saveOptions', $scope.tracker_opts)
        webSocket.emit('tracker:getTracker')

        var savedCallBack = function (result) {
          $scope.tracker_opts = result.options
          Notification.success('Options saved!')
          webSocket.removeListener('tracker:optionsSaved', savedCallBack)
        }
        webSocket.on('tracker:optionsSaved', savedCallBack)
      }
    }])
}
