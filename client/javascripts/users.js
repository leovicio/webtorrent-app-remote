module.exports = function (app) {
  app.controller('Users', [
    '$scope',
    '$rootScope',
    '$location',
    '$timeout',
    'webSocket',
    '$window',
    'Notification',
    function ($scope, $rootScope, $location, $timeout, webSocket, $window, Notification) {
      $scope.tab = 'list'
      $scope.loading = false
      $scope.users = {}
      $scope.user = {}
      $scope.form = {}
      $scope.new_user = {}

      function Users () { }

      /**
       * Called when server sent user list
       */
      Users.prototype._onUserList = function (data) {
        console.log(data)
        $scope.users = data.users
      }

      /**
       * Called when user was addedd
       */
      Users.prototype._onUserCreated = function (data) {
        $scope.loading = false
        Notification.success('User saved!')
        webSocket.emit('users:list')
      }

      var users = new Users()

      // Call user lists
      webSocket.emit('users:list')

      // Read events
      webSocket.on('users:listed', users._onUserList)
      webSocket.on('users:saved', users._onUserCreated)

      /**
      * Set active tab (user list or add user)
      */
      $scope.setTab = function ($event, tab) {
        $event.preventDefault()
        $event.stopPropagation()
        $event.stopImmediatePropagation()
        $scope.tab = tab
      }

      /**
       * Save user
       */
      $scope.saveUser = function ($event) {
        $event.preventDefault()
        $event.stopPropagation()
        $event.stopImmediatePropagation()
        $scope.new_user.numTorrents = 0
        webSocket.emit('users:save', $scope.new_user)
        $scope.loading = true
      }
    }])
}
