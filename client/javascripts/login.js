module.exports = function (app) {
  app.controller('Login', [
    '$scope',
    '$rootScope',
    '$location',
    '$timeout',
    'webSocket',
    '$window',
    'Notification',
    function ($scope, $rootScope, $location, $timeout, webSocket, $window, Notification) {
      $scope.loading = false
      $scope.login = {}
      $scope.form = {}

      function Login () { }

      /**
       * Called when server sent login response
       */
      Login.prototype._onServerResponse = function (data) {
        if (data.auth) {
          Notification.success('login successful')
          webSocket.emit('startCrons')
          $rootScope.user_name = data.user[0].name
          $scope.loading = false
          $location.path('torrents')
          $rootScope.loggedInUser = true
        } else {
          Notification.error('Invalid User / Password')
          $scope.loading = false
        }
      }

      /**
       * Send login informations to server
       */
      Login.prototype._sendLoginInformations = function (data) {
        webSocket.emit('authenticate', data)
      }

      var login = new Login()

      webSocket.on('auth:reply', login._onServerResponse)

      $scope.doLogin = function () {
        webSocket.connect()
        $scope.validate = true
        if ($scope.form.login.$valid) {
          $scope.loading = true
          login._sendLoginInformations($scope.login)
        }
      }
    }])
}
