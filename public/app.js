var app = angular.module('webtorrent', [
    'btford.socket-io',
    'ui.bootstrap',
    'dialogs',
    'pascalprecht.translate',
    'angularFileUpload',
    'ui-notification',
    'ngRoute'
]);

app.run(['$templateCache', '$interpolate', function($templateCache, $interpolate) {

    // get interpolation symbol (possible that someone may have changed it in their application instead of using '{{}}')
    var startSym = $interpolate.startSymbol();
    var endSym = $interpolate.endSymbol();

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


