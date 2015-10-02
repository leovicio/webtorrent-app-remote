app.controller('TrackerServer', ['$scope',
    'webSocket',
    '$dialogs',
    'Notification',
    function($scope, webSocket, $dialogs, Notification) {
	
	    $scope.tab = 'details';
	    
	    $scope.host_name = window.location.hostname;
	    webSocket.emit('tracker:getOptions');
	    webSocket.emit('tracker:getTracker');
	    
	    webSocket.on('tracker:details', function(message) {
	        $scope.tracker = message.details;
	    });
	    
	    webSocket.on('tracker:options', function(message) {
	        $scope.tracker_opts = message.options;
	    });
	    
	    $scope.setTab = function($event, tab){
            $event.preventDefault();
            $event.stopPropagation();
            $event.stopImmediatePropagation();	        
            $scope.tab = tab;
	    };
	    
	    $scope.saveOptions = function($event){
	        $event.preventDefault();
            $event.stopPropagation();
            $event.stopImmediatePropagation();
            webSocket.emit('tracker:saveOptions', $scope.tracker_opts);
            webSocket.emit('tracker:getTracker');
            
            var savedCallBack = function(result){
                $scope.tracker_opts = result.options;
                Notification.success('Options saved!');
                webSocket.removeListener('tracker:optionsSaved', savedCallBack);
            };
            webSocket.on('tracker:optionsSaved', savedCallBack);
	    }
	
}]);