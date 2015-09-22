app.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/torrents', {
        templateUrl: 'template/torrents.html',
        controller: 'TrackerServer'
      }).
      when('/tracker', {
        templateUrl: 'template/tracker.html',
        controller: 'WebTorrent'
      }).
      otherwise({
        redirectTo: '/torrents'
      });
  }]);
  