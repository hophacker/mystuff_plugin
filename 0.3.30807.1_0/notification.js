jQuery(function($){

var parts = location.search.substr(1).split('&');
var args  = {};

for(var idx in parts) {
	if(/^(\w+)=(.*)$/.test(parts[idx])) {
		args[RegExp.$1] = decodeURIComponent(RegExp.$2);
	}
}

$('#wrapper').css('background-image','url('+args.image+')');
$('#user').attr('src', args.user_image);
$('#text').text(args.text);

});