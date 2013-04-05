define(['jquery','jquery.spin'],function($) {

	var Remote = {

		'currentData' : null,

		'init' : function(token) {

			var socket = window.remoteSocket;

			$('#ask').css('opacity',0.5).spin('large', '#000');

		    socket.emit('setRemote', token, function(success) {
		    	$('#ask').css('opacity',1).spin(false);
		    	if(!success) {
		    		alert('Erreur');
		    	} else {
        			$('#remote').show();
        			$('#ask').hide();
        			window.scrollTo(0, 0);
        			$('#ask input').val('');
		    	}
		    });

		    socket.on('computerDisconnect',function() {
		    	$('#remote').slideUp('fast');
        		$('#ask').slideDown('fast');
		    });

	        socket.on('event',function(type,data) {
	            switch(type) {
	            	case 'data':
	            		$('#remote').css('opacity',1).spin(false);
	            		Remote.updateData(data);
	            	break;
	            	case 'time':
	            		$('#remote .timeline .progress .bar').css('width',(data.progress*100)+'%');
	            		$('#remote .timeline .time .current').text(data.timeFormatted);
	            	break;
	            	case 'state':
	            		$('#remote .timeline .progress .bar').css('width',(data.progress*100)+'%');
	            		$('#remote .volume .progress .bar').css('width',(data.volume*100)+'%');
	            		switch(data.state) {
	            			case 'playing':
	            				$('#remote a.play').hide();
	            				$('#remote a.pause').show();
	            			break;
	            			case 'paused':
	            				$('#remote a.play').show();
	            				$('#remote a.pause').hide();
	            			break;
	            		}
	            	break;
	            }
	        });

        	Remote.initEvents();

		},

		'initEvents' : function() {

			var socket = window.remoteSocket;

			$('#remote a.play').click(function(e) {
		        e.preventDefault();
		        socket.emit('sendCommand','play');
		    });

		    $('#remote a.pause').click(function(e) {
		        e.preventDefault();
		        socket.emit('sendCommand','pause');
		    });

		    $('#remote a.info').click(function(e) {
		        e.preventDefault();
		        $('#info').show();
		        $('#remote').hide();
		    });

		    $('#info a.close').click(function(e) {
		        e.preventDefault();
		        $('#info').hide();
		        $('#remote').show();
		    });

		    $('#remote .mute').click(function(e) {
		    	e.preventDefault();
		    	$('#remote .volume .progress .bar').css('width','0%');
		    	socket.emit('sendCommand','volume',0);
		    });

		    $('#remote .unmute').click(function(e) {
		    	e.preventDefault();
		    	$('#remote .volume .progress .bar').css('width','100%');
		    	socket.emit('sendCommand','volume',1);
		    });

		    $('#remote .related').on('click','a',function(e) {
		    	e.preventDefault();
		    	$('#remote').css('opacity',0.5).spin('large', '#000');
	            $('#remote .timeline .progress .bar').css('width','0%');
	            $('#remote .timeline .time .current').text('00:00');
				$('#remote a.play').show();
				$('#remote a.pause').hide();
		    	socket.emit('sendCommand','loadMovie',$(this).attr('href'));
		    });

		    /*
		     *
		     * Progress click
		     *
		     */
		    function changeVolume(x) {
		    	var $progress = $('#remote .volume .progress');
		    	x = x-$progress.offset().left;
		    	if(x <= 0 || !x) x = 0;
		    	var percent = x/$progress.width();
		    	if(percent > 1) percent = 1;
		    	$progress.find('.bar').css('width',(percent*100)+'%');
		    	socket.emit('sendCommand','volume',percent);
		    }

		    function changeTime(x) {
		    	var $progress = $('#remote .timeline .progress');
		    	x = x-$progress.offset().left;
		    	if(x <= 0 || !x) x = 0;
		    	var percent = x/$progress.width();
		    	if(percent > 1) percent = 1;
		    	$progress.find('.bar').css('width',(percent*100)+'%');
		    	var secs = percent * Remote.currentData.film.duration;
		    	socket.emit('sendCommand','seekTo',secs);
		    }

		    var touchFlag = false;

		    //Change Volume
		    $('#remote .volume .progress').mousedown(function(e) {
		    	e.preventDefault();
		    	if(touchFlag) return;
		    	touchFlag = true;
		    	changeVolume(e.pageX);
		    	setTimeout(function(){ touchFlag = false; }, 100);
		    });
		    $('#remote .volume .progress').bind('touchstart',function(e) {
		    	e.preventDefault();
		    	if(touchFlag) return;
		    	touchFlag = true;
		    	changeVolume(e.originalEvent.touches[0].pageX);
		    	setTimeout(function(){ touchFlag = false; }, 100);
		    });
		    $('#remote .volume .progress').bind('touchmove',function(e) {
		    	e.preventDefault();
		    	changeVolume(e.originalEvent.touches[0].pageX);
		    });

		    //Seek in time
		    $('#remote .timeline .progress').mousedown(function(e) {
		    	e.preventDefault();
		    	if(touchFlag) return;
		    	touchFlag = true;
		    	changeTime(e.pageX);
		    	setTimeout(function(){ touchFlag = false; }, 100);
		    });
		    $('#remote .timeline .progress').bind('touchstart',function(e) {
		    	e.preventDefault();
		    	if(touchFlag) return;
		    	touchFlag = true;
		    	changeTime(e.originalEvent.touches[0].pageX);
		    	setTimeout(function(){ touchFlag = false; }, 100);
		    });
		    $('#remote .timeline .progress').bind('touchmove',function(e) {
		    	e.preventDefault();
		    	changeTime(e.originalEvent.touches[0].pageX);
		    });

		},

		'updateData' : function(data) {

			Remote.currentData = data;

			$('#remote .title h1').html(data.film.title);
			$('#info .title h1').html(data.film.title);
			$('#info .director').html(data.film.director);
			$('#info .year').html(data.film.year);
			$('#info .duration').html(data.film.time);
			$('#info .description').html(data.film.description);
			$('#info .image').html('<img src="'+data.film.big_thumbnail+'" />');
            $('#remote .timeline .progress .bar').css('width','0%');
            $('#remote .timeline .time .current').text('00:00');

			var durationMatch = data.film.time.match(/([0-9]+) min ([0-9]+) s/);
			var minuts = parseInt(durationMatch[1]);
			var seconds = parseInt(durationMatch[2]);
			data.film.duration = (minuts*60) + seconds;
			$('#remote .timeline .time .duration').html((minuts < 10 ? '0'+minuts:minuts)+':'+(seconds < 10 ? '0'+seconds:seconds));

			$('#remote .related ul').html('');
			$('#remote .related ul').css('width',(data.related_content.length*120)+'px');
			for(var i = 0; i < data.related_content.length; i++) {
				var film = data.related_content[i];
				var $li = $('<li></li>');
				$li.html('<a href="'+film.slug+'"><img src="'+film.thumbnail+'" /></a>');
				$('#remote .related ul').append($li);
			}
		}

	};


	return Remote;


});