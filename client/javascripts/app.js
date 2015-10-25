var angular = require('angular')
require('angular-route/angular-route.min.js')
require('angular-bootstrap/ui-bootstrap-tpls.min.js')
require('angular-dialog-service/dialogs.min.js')
require('angular-sanitize/angular-sanitize.min.js')
require('angular-socket-io/socket.min.js')
require('ng-ui-notification/dist/angular-ui-notification.min.js')
require('ng-file-upload/dist/ng-file-upload-all.min.js')
var io = require('socket.io-client')

var app = angular.module('webtorrent', [
  'btford.socket-io',
  'ui.bootstrap',
  'dialogs',
  'ui-notification',
  'ngRoute',
  'ngFileUpload'
])

app.run(['$rootScope', '$location', function ($rootScope, $location) {
  $rootScope.$on('$routeChangeSuccess', function (e, current, pre) {
    $rootScope.current_tab = $location.path()
    $rootScope.loaded = true
  })
  $rootScope.$on( "$routeChangeStart", function(event, next, current) {
    if ($rootScope.loggedInUser == null) {
      // no logged user, redirect to /login
      if ( next.templateUrl !== "/template/login.html") {
        $location.path("/login");
      }
    }
  })
}])

app.factory('webSocket', function ($rootScope, $location) {
  var socket = io.connect('http://62.75.213.174:3001/')
  socket.on('loggedout', function () {
    $location.path('/login')
  })
  return socket
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

app.config(['$routeProvider', function ($routeProvider) {
  $routeProvider.when('/torrents', {
    templateUrl: '/template/torrents.html',
    controller: 'WebTorrent'
  }).when('/tracker', {
    templateUrl: '/template/tracker.html',
    controller: 'TrackerServer'
  }).when('/create', {
    templateUrl: '/template/create.html',
    controller: 'CreateTorrent'
  }).when('/login', {
    templateUrl: '/template/login.html',
    controller: 'Login'
  }).when('/users/:id', {
    templateUrl: '/template/users.html',
    controller: 'Users'
  }).when('/users', {
    templateUrl: '/template/users.html',
    controller: 'Users'
  }).otherwise({
    redirectTo: '/login'
  })
}])

app.directive('filelistBind', function () {
  return function (scope, elm, attrs) {
    elm.bind('change', function (evt) {
      scope.$apply(function () {
        var arr = scope [ attrs.name ] ? scope [ attrs.name ] : [ ]
        for (var i = 0; i < evt.target.files.length; i++) {
          arr.push(evt.target.files.item(i))
        }
        scope[ attrs.name ] = arr
      })
    })
  }
})

module.exports = app
