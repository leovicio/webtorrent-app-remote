module.exports = function (app) {
  app.controller('Login', [
    '$scope',
    '$rootScope',
    '$location',
    'webSocket',
    '$window',
    'Notification',
    function ($scope, $rootScope, $location, webSocket, $window, Notification) {

      $scope.loading = false
      $scope.login = {}
      $scope.form = {}

      function Login () { }

      /**
       * Called when server sent login response
       */
      Login.prototype._onServerResponse = function (data) {
        console.log(data)
        if (data.auth) {
          Notification.success('login successful')
          webSocket.emit('startCrons')
          $location.state('torrents')
        } else { 
          Notification.error('Invalid User / Password')
        }

        $scope.loading = false
      }

      /**
       * Send login informations to server
       */
      Login.prototype._sendLoginInformations = function (data) {
        console.log(data)
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