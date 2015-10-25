module.exports = function (app) {
  app.controller('Users', [
    '$scope',
    '$rootScope',
    '$location',
    '$timeout',
    '$route',
    '$routeParams',
    'webSocket',
    '$window',
    'Notification',
    function ($scope, $rootScope, $location, $timeout, $route, $routeParams, webSocket, $window, Notification) {
      $scope.tab = 'list'
      $scope.loading = false
      $scope.users = {}
      $scope.user = {}
      $scope.form = {}
      $scope.user_form = {}

      function Users () { }

      /**
       * Called when server sent user list
       */
      Users.prototype._onUserList = function (data) {
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

      /**
       * Called when server sent user info
       */
      Users.prototype._onUserInfo = function (data) {
        $scope.user_form = data.user
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
        if (!$scope.user_form.numTorrents) {
          $scope.user_form.numTorrents = 0
        }

        if ($routeParams.id) {
          webSocket.emit('users:update', $scope.user_form)
        } else {
          webSocket.emit('users:save', $scope.user_form)
        }
        $scope.loading = true
        $scope.user_form = 0
        $scope.tab = 'list'
        $scope.action = 'create'
      }

      /**
      * If user id param, editing user
      */
      if ($routeParams.id) {
        webSocket.emit('users:getInfo', $routeParams.id)
        webSocket.on('users:info', users._onUserInfo)
        $scope.tab = 'create'
        $scope.action = 'edit'
      }
    }])
}
