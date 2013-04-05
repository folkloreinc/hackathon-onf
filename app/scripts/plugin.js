remotePlayerPlugin = function () {
    this.timeInterval = null;
    this.currentState = null;
};
remotePlayerPlugin.prototype = new NFBPlayerPlugin();

remotePlayerPlugin.prototype.mediaStarted = function () {
    if(window.remoteSocket) {
    	window.remoteSocket.emit('sendEvent','mediaStarted');
    }
};

remotePlayerPlugin.prototype.stateUpdated = function (currentState)
{
    if(window.remoteSocket) {
    	window.remoteSocket.emit('sendEvent','state',{
    		'state' : currentState,
            'progress' : this.getProgressRatio(),
            'volume' : this.getVolume()
    	});
    }

    this.currentState = currentState;

    var self = this;

    switch(currentState) {
        case 'playing':
            this.timeInterval = window.setInterval(function() {
                self.sendTime();
            },500);
        break;
        case 'paused':
            window.clearInterval(this.timeInterval);
            this.sendTime();
        break;
    }
};

remotePlayerPlugin.prototype.sendTime = function() {
    if(window.remoteSocket) {
        window.remoteSocket.emit('sendEvent','time',{
            'time' : this.getTime(),
            'timeFormatted' : this.getFormattedTime(),
            'progress' : this.getProgressRatio(),
            'duration' : this.getVideoDuration()
        });
    }
};

remotePlayerPlugin.prototype.streamCompleted = function(){
   
};

remotePlayerPlugin.prototype.customEventDispatched = function(eventType, eventData){
    
};

remotePlayerPlugin.prototype.sendDurationViewed = function(){
    
};

var remotePlayerPlugin = new remotePlayerPlugin();

var oldPlayerReady = playerReady;
playerReady = function() {

    remotePlayerPlugin.plug(
        'remotePlayerPlugin',
        'testremotePlayerPlugin',
        'flashContent',
        'displayClicked,mediaStarted,mediaChanged,mediaAssetQualityChanged,prerollStarted,streamCompleted,stateUpdated,customEventDispatched'
    );

    oldPlayerReady();

};