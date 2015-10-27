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
      $scope.loading_users = true

      function Users () { }

      /**
       * Called when server sent user list
       */
      Users.prototype._onUserList = function (data) {
        $scope.users = data.users
        $timeout(function () {
          $scope.loading_users = false
        })
      }

      /**
       * Called when user was addedd
       */
      Users.prototype._onUserCreated = function (data) {
        $scope.loading = false
        Notification.success('User saved!')
        webSocket.emit('users:list')
        $scope.loading_users = true
      }

      /**
       * Called when server sent user info
       */
      Users.prototype._onUserInfo = function (data) {
        $scope.$apply(function () {
          data.user.pass = ''
          $scope.user_form = data.user
        })
        $scope.loading_users = false
      }

      Users.prototype._onUserRemoved = function () {
        webSocket.emit('users:list')
        Notification.success('User removed!')
      }

      var users = new Users()

      // Call user lists
      webSocket.emit('users:list')

      // Read events
      webSocket.on('users:listed', users._onUserList)
      webSocket.on('users:saved', users._onUserCreated)
      webSocket.on('users:removed', users._onUserRemoved)
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
        $location.path('users')
      }

      $scope.removeUser = function ($event, $user, $user_name) {
        if (window.confirm('Are you sure you want remove the user ' + $user_name + '?')) {
          webSocket.emit('users:remove', $user)
          $scope.loading_users = true
        }
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
