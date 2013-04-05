require.config({
    paths: {
        jquery: '../components/jquery/jquery',
        'spin': '../components/spin.js/spin',
        'jquery.spin': '../components/spin.js/jquery.spin'
    },
    shim: {
        'jquery.spin': {
            'deps' : ['spin']
        }
    }
});

require(['jquery','remote'], function ($,Remote) {
    'use strict';

    /*document.addEventListener('touchmove', function(e) {
        e.preventDefault();
    }, false);*/

    

    var idMatch = window.location.search.match(/id\=(.*)/);

    var socket;
    $.getScript('http://'+SOCKET_HOST+'/socket.io/socket.io.js',function() {

        window.remoteSocket = socket = io.connect('http://'+SOCKET_HOST);
        
        if(idMatch) {
            var token = idMatch[1];
            Remote.init(token);
        } else {
            $('#ask').show();
        }
        

    });

    $('#ask').submit(function(e) {
        e.preventDefault();
        var token = $(this).find('input[name=id]').val();
        Remote.init(token);
    });

});