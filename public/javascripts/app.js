var angular = require('angular')
require('angular-route/angular-route.min.js')
require('angular-bootstrap/ui-bootstrap-tpls.min.js')
require('angular-dialog-service/dialogs.min.js')
require('angular-sanitize/angular-sanitize.min.js')
require('angular-socket-io/socket.min.js')
require('ng-ui-notification/dist/angular-ui-notification.min.js')
var io = require('socket.io-client')

var app = angular.module('webtorrent', [
  'btford.socket-io',
  'ui.bootstrap',
  'dialogs',
  'ui-notification',
  'ngRoute'
])

app.run(['$rootScope', '$location', function ($rootScope, $location) {
  $rootScope.$on('$routeChangeSuccess', function (e, current, pre) {
    $rootScope.current_tab = $location.path()
    $rootScope.loaded = true
  })
}])

app.factory('webSocket', function (socketFactory) {
  var myIoSocket = io.connect('http://62.75.213.174:3001/', {
    'force new connection': true
  })
  var mySocket = socketFactory({
    ioSocket: myIoSocket
  })
  mySocket.forward('error')
  mySocket.forward('connect')
  mySocket.emit('startCrons')

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
  }).otherwise({
    redirectTo: '/torrents'
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

app.directive("dropzone", function() {
  return function (scope, elem) {

    var handleover = function (event) {
      if (event !== null) {
				event.preventDefault()
			}
      return false 
    }
    elem.bind('dragover', handleover)
    elem.bind('dragend', handleover)
    
    elem.bind('drop', function (event) {
      if (event !== null) {
			  event.preventDefault();
      }
      console.log('dropped')
      event.stopPropagation()
      event.preventDefault()

      var files = event.originalEvent.dataTransfer.files
      var validFiles = []
      for (var i = 0, f; f = files[i]; i++) {
        if (f.name.match('.torrent')) {
          validFiles.push(f)
        }
      }
      scope.OnDragFiles(validFiles)
    })
  }
})

module.exports = app
