module.exports = function (app) {
  app.config(['$routeProvider',
    function ($routeProvider) {
      $routeProvider.when('/torrents', {
        templateUrl: '/template/torrents.html',
        controller: 'WebTorrent'
      }).when('/tracker', {
        templateUrl: '/template/tracker.html',
        controller: 'TrackerServer'
      }).otherwise({
        redirectTo: '/torrents'
      })
    }])
}
