var angular = require('angular')
require('angular-route/angular-route.min.js')
require('angular-bootstrap/ui-bootstrap-tpls.min.js')
require('angular-dialog-service/dialogs.min.js')
require('angularFileInput/dist/angular-file-input.js')
require('angular-sanitize/angular-sanitize.min.js')
require('angular-socket-io/socket.min.js')
require('ng-ui-notification/dist/angular-ui-notification.min.js')

var io = require('socket.io-client')

var app = angular.module('webtorrent', [
  'btford.socket-io',
  'ui.bootstrap',
  'dialogs',
  'angularFileInput',
  'ui-notification',
  'ngRoute'
])

app.run(['$rootScope', '$location', function ($rootScope, $location) {
  $rootScope.$on('$routeChangeSuccess', function (e, current, pre) {
    $rootScope.current_tab = $location.path()
    // Get all URL parameter
  })
}]) // end run / dialogs.main

app.factory('webSocket', function (socketFactory) {
  var myIoSocket = io.connect('http://62.75.213.174:3001/', {
    'force new connection': true
  })
  var mySocket = socketFactory({
    ioSocket: myIoSocket
  })
  mySocket.forward('error')
  mySocket.forward('connect')
  return mySocket
})

app.filter('status', function () {
  return function (item) {
    switch (item) {
      case 1:
        return 'Downloading'
      case 2:
        return 'Seeding'
    }
  }
})

module.exports = app
