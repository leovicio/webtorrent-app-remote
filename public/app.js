var app = angular.module('webtorrent', [
    'btford.socket-io',
    'ui.bootstrap',
    'dialogs',
    'pascalprecht.translate',
    'angularFileUpload',
    'ui-notification',
    'ngRoute'
]);

app.run(['$rootScope', '$location', function($rootScope, $location) {
    
    $rootScope.$on('$routeChangeSuccess', function(e, current, pre) {
      $rootScope.current_tab = $location.path();
      // Get all URL parameter
    });

}]); // end run / dialogs.main


app.factory('webSocket', function(socketFactory) {

    var myIoSocket = io.connect('http://62.75.213.174:3001/', {
        reconnect: true
    });
    var mySocket = socketFactory({
        ioSocket: myIoSocket
    });
    mySocket.forward('error');
    mySocket.forward('connect');
    return mySocket;
});

app.filter('status', function() {
    return function(item) {
        switch (item) {
            case 1:
                return 'Downloading';
            case 2:
                return 'Seeding';
        }
    };
});


