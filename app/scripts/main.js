require.config({
    paths: {
        jquery: '../components/jquery/jquery',
        qrcode: './vendor/jquery.qrcode'
    },
    shim: {
        'qrcode': {
            deps: ['jquery']
        }
    }
});

require(['jquery','player','qrcode'], function ($,createPlayer) {
    'use strict';

    var computerToken;

    var socket;
    function initSocket() {

        $.getScript('http://'+SOCKET_HOST+'/socket.io/socket.io.js',function() {

            socket = window.remoteSocket = io.connect('http://'+SOCKET_HOST);

            //Set current computer
            socket.emit('setComputer', window.currentData, function(token) {
                computerToken = token;
                var url = 'http://'+window.location.host+'/remote.html?id='+token;
                $('#remote .qr .image').qrcode(url);
                $('#remote .id').text(token);
                $('#remote').fadeIn('fast');
            });

            socket.on('hasRemote',function() {
                if($('#remote').is(':visible')) {
                    $('#remote').fadeOut('fast');
                    $('a.remote').fadeIn('fast');
                }
                if(remotePlayerPlugin.currentState) {
                    remotePlayerPlugin.stateUpdated(remotePlayerPlugin.currentState);
                }
            });


            socket.on('command',function(method,data) {
                switch(method) {
                    case 'play':
                        remotePlayerPlugin.playMedia();
                    break;
                    case 'pause':
                        remotePlayerPlugin.pauseMedia();
                    break;
                    case 'volume':
                        remotePlayerPlugin.setVolume(data);
                    break;
                    case 'seekTo':
                        remotePlayerPlugin.seekTo(data);
                    break;
                    case 'loadMovie':
                        $('#player').html('<div id="flashContent"></div>');
                        getInfo(data,function(data) {
                            window.currentData = data;
                            socket.emit('updateData',data);
                            createPlayer(data.film.slug);
                        });
                    break;
                }
            });

        });
    }

    function getInfo(id,cb) {
        $.getJSON('http://hackathon.onf.ca.dev1.atelierfolklore.ca/getinfo.php?id='+escape(id)+'&callback=?',function(data) {
            cb(data.data);
        });
    }

    getInfo('francoise_durocher_waitress',function(data) {
        window.currentData = data;
        createPlayer(data.film.slug);
        initSocket();
    });

    $('#remote .close').click(function(e) {
        e.preventDefault();
        $('#remote').fadeOut('fast');
        $('a.remote').fadeIn('fast');
    });

    $('a.remote').click(function(e) {
        e.preventDefault();
        $('#remote').fadeIn('fast');
        $(this).fadeOut('fast');
    });

});