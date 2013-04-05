define(['jquery'],function($) {

	function createPlayer(slug) {

		var flashvars = {
	        
	        configURL:'http://www.onf.ca/film/'+slug+'/player_config'
	        
	        , embedMode:true
	        , userip : '199.84.162.167'
	        , sessid : 'a08f639cbb6e42f6738968cab523d6b2'
	        , user   : 'AnonymousUser'
	        , referer: 'N/A'
	        , platform : 'external_embed'
	        , lang : 'fr'
	        , share_resource : 'true'
	         
	        , share_text_en : 'Share this film'
	        , share_text_fr : 'Partagez ce film'
	        
	    };

	    // To be removed !! this cause more problem than it solves. 
	    
	    

	    var params = {allowScriptAccess:"always", allowFullscreen:"true", wmode:"opaque"}; // wmode:"opaque"// wmode:"direct"
	    
	    function outputStatus(e) {
	        alert("e.success = "+e.success+"\ne.id = "+e.id+"\ne.ref = "+e.ref);
	    }
	    var flashInstalled = Boolean(swfobject.getFlashPlayerVersion().major);
	    if (flashInstalled) {
	        swfobject.embedSWF("http://media6.onf.ca/medias/flash/NFBVideoPlayer.swf", "flashContent", "100%", "100%", "10.3", "http://media5.onf.ca/medias/flash/expressInstall.swf", flashvars, params, attributes);
	    } else {
	        $('#noflash').show();
	    }
	    initAutoplay('', 'false');
	    var mediaSlug = slug;
	    mainPlayerPlugin.setMediaSlug(mediaSlug);
	    mainPlayerPlugin.setIsOnExternalSite("True");
	    var iFrameRedirectUrl = "";
	    toggleFilmHandlerPlugin.setRedirectUrl(iFrameRedirectUrl);
	}

	return createPlayer;

});