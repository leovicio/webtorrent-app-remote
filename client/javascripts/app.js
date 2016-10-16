var angular = require('angular')
var ip = require('ip');
require('angular-route/angular-route.min.js')
require('angular-bootstrap-npm')
require('angular-dialog-service/dist/dialogs.min.js')
require('angular-sanitize/angular-sanitize.min.js')
require('angular-socket-io/socket.min.js')
require('ng-ui-notification/dist/angular-ui-notification.min.js')
require('ng-file-upload/dist/ng-file-upload-all.min.js')
// var loki = require('lokijs/src/lokijs.js')
// require('lokijs/src/loki-angular.js')(angular, loki)

var io = require('socket.io-client')

var app = angular.module('webtorrent', [
  'btford.socket-io',
  'ui.bootstrap',
  'dialogs.main',
  'ui-notification',
  'ngRoute',
  'ngFileUpload'
// 'lokijs'
])

app.factory('webSocket', function ($rootScope, $location) {
  var socket = io.connect('http://'+ip.address()+':3001/')
  socket.on('loggedout', function () {
    $location.path('/login')
  })
  return socket
})

app.run(['$rootScope', '$location', function ($rootScope, $location, webSocket) {
  $rootScope.$on('$routeChangeSuccess', function (e, current, pre) {
    $rootScope.current_tab = $location.path()
    $rootScope.loaded = true
  })
  $rootScope.$on('$routeChangeStart', function (event, next, current) {
    if ($rootScope.loggedInUser == null) {
      // no logged user, redirect to /login
      if (next.templateUrl !== '/template/login.html') {
        $location.path('/login')
      }
    }
  })
}])

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

app.controller('HeaderController', ['$scope', '$location', 'webSocket', 'Notification', function ($scope, $location, webSocket, Notification) {
  $scope.loggout = function ($event) {
    $event.preventDefault()
    $event.stopPropagation()
    $event.stopImmediatePropagation()
    webSocket.emit('users:loggout')
    $location.path('/login')
  }
  webSocket.on('permission:denied', function () {
    Notification.error('Permission denied')
  })
}])
module.exports = app
