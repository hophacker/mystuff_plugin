var EXT_ID   = chrome.i18n.getMessage("@@extension_id");
var username = '';

function closeTab() {
	chrome.tabs.getCurrent(function(tab){
		chrome.tabs.remove(tab.id);
	});
}


function getOptionValue(name, def) {
	var val = localStorage[name];
	if(!val && def) val = localStorage[name] = def;

	return val;
}

jQuery(function($){
	var displayNoti   = getOptionValue('fancyDisplayNoti', 'Y');
	var enhanceSearch = getOptionValue('fancyEnhanceSearch', 'Y');

	$('input:radio[name="fancyDisplayNoti"][value="'+displayNoti+'"]').prop('checked', true);
	$('input:radio[name="fancyEnhanceSearch"][value="'+enhanceSearch+'"]').prop('checked', true);

	$('#submit').click(function(){
		localStorage['fancyDisplayNoti'] = $('input:radio[name="fancyDisplayNoti"]:checked').val();
		localStorage['fancyEnhanceSearch'] = $('input:radio[name="fancyEnhanceSearch"]:checked').val();

		if(localStorage['fancyDisplayNoti'] == 'N') {
			chrome.browserAction.setBadgeText({text:''});
		}
		
		closeTab();
	});
	$('#close').click(function(){
		closeTab();
	});

	$('form').submit(function(){ return false; });
});

$.ajax('http://fancy.com/notifications_count.json', { } )
	.success(function(data,status,c) {
		if(data && data.response) {
			username = data.response.username;
			$('#username').text(username).attr('href', 'http://fancy.com/'+username);
		}
	})
	.error(function(data,status,c) {
	})
	.complete(function(xhr, status){
		var optionsPageUrl = 'chrome-extension://'+EXT_ID+'/options.html';

		if(xhr.status == 404) {
			// needs login?
			window.location.href = signin_path; 
		}
	});
