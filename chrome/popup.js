var tab_title, tab_url, bookmarklet_username;
var ready = 0, doc_len = 0;// token = '';
var isChrome  = (typeof(chrome) !== 'undefined');
var isFF      = (self && self.port);
var clicky_site_ids = [66502369];

var Adder = (function(){
	var imgs = [];
	var $imglist, $selectable, $selected, $left_nav, $right_nav; // jquery selections have a prefix '$'
	var pos_start = 0, pos_selected = 0, move_w = 0;
	var COUNT = 3;

	return {
		init : function(images) {
			var _this = this, len = images.length, $items;

			imgs = images;
			$imglist = $('#image_list');

			if(!$left_nav)   $left_nav   = $('#left_nav').click(function(){ _this.moveSelectable(-COUNT); });
			if(!$right_nav)  $right_nav  = $('#right_nav').click(function(){ _this.moveSelectable(+COUNT); });
			if(!$selected)   $selected   = $('#selected_image');
			if(!$selectable) {

				for(var i=0,l=(len>COUNT)?COUNT*3:len; i < l; i++) {
					$imglist.find('> ul').append('<li></li>');
				}

				$selectable = $imglist.find('li');
				$selectable.click(function() {
					var $this = $(this);

					$selectable.removeClass('selected');
					$this.addClass('selected');

					$selected.attr('src', $this.data('src'));
					pos_selected = imgs.indexOf($this.data('src'));
				});
			}

			if(imgs.length <= COUNT) {
				$left_nav.css('visibility', 'hidden');
				$right_nav.css('visibility', 'hidden');
				if(imgs.length == 2) $('#image_list ul').css('width', '156px');
			} else {
				$imglist.find('ul').addClass('carousel');
				$items = $imglist.find('li');
				move_w = $items.eq(COUNT).prop('offsetLeft') - $items.eq(0).prop('offsetLeft');
			}

			this.setSelectables(pos_start);
		},
		moveSelectable : function(w) {
			var _this = this, len = imgs.length, mleft, $items;

			if(len <= COUNT) return;

			pos_start += w;
			if(pos_start > len-1) pos_start -= len;
			if(pos_start < 0) pos_start += len;

			// animate and set selectable
			mleft = parseInt($imglist.find('>ul').css('margin-left'));

			$imglist.find('>ul:not(:animated)')
				.animate(
					{'margin-left':(mleft+move_w*(w>0?-1:1))+'px'},
					function(){
						var $this = $(this), $slices;
						
						if(w < 0) {
							$slices = $this.find('>li').slice(w);
							$this.append($slices);
						} else {
							$slices = $this.find('>li').slice(0,w);
							$this.prepend($slices);
						}

						$this.css('margin-left', mleft);
						_this.setSelectables(pos_start);
					}
				);
		},
		setSelectables : function(start) {
			var idx, len = imgs.length, i_start, i_end, i_img;

			$selectable.removeClass('selected');

			i_start = (len > COUNT)?-COUNT:0;
			i_end   = (len > COUNT)?COUNT*2:len;

			for(var i=i_start; i < i_end; i++)
			{
				idx = start + i;
				i_img = (len > COUNT)?i+COUNT:i;
				
				while(idx > len -1) idx -= len;
				while(idx < 0) idx += len;

				if(imgs[idx].src != $selectable.eq(i_img).data('src')) {
					$selectable.eq(i_img).data('src', imgs[idx].src).css('background-image', 'url('+imgs[idx].src+')');
				}
				if(pos_selected == idx) {
					$selectable.eq(i_img).addClass('selected');
					$selected.attr('src', imgs[idx].src);
				}
			}
		},
		fancyit : function() {
			var data = {
				//'category'  : $("#category-for-thing").val(),
				'image[title]'      : $("#image_title").val(),
				'image[description]'      : $("#image_description").val(),
				'image[image_url]' : $selected.attr('src'),
				'image[source_url]'   : tab_url
				//'user_key'  : bookmarklet_username,
				//'via'       : 'chrome',
				//'list_ids'  : $('#user-list').val()
			};

			if(!data.category){
				delete data.category;
			}
			
			if(!data.list_ids){
				delete data.list_ids;
			}

			chrome.cookies.get(
				{url:config_root, name:'mystuff_token'},
				function(cookie){
                    console.log(JSON.stringify(cookie));
					$.ajax({
                        url  : config_image_url,
						type : 'POST',
						data : data,
						dataType : 'json',
						beforeSend : function(xhr, settings) {
							if(cookie && cookie.value) {
								xhr.setRequestHeader('X-CSRFToken', cookie.value);
							}
						},
						success : function(data,status,xhr) {
                            console.log(data)
							if( data.status_code == 1 ) {
								$("#gosee").data('image_url', data.image_url);
								$("#wrap_add,#fancyit").hide();
								$("#wrap_success").show();

								$('body').trigger('mouseup.scroll');
							} else {
								var msg = data.message || 'An error occured while requesting the server.\nPlease try again later.';
								window.close();
							}
						}
					});
				}
			);
		}
	};
})();

function doFancy( simgs )
{
	$(function(){
		if(!simgs || $('#wrap_disable:visible').length) return;

		if(simgs.length == 0) { // no images
			$('#wrap_fail').show();
			$('#fancyit').hide();
			$('#notiList > button.back').addClass('noimgs');
		} else { // add
			$('#wrap_fail').hide();
			$("#wrap_add,#fancyit").show();
			$("#image_title").val(tab_title);
			$('#notiList > button.back').removeClass('noimgs');

			if(simgs.length == 1) $('#navigator').hide();

			// sort by extent (larger first)
			simgs.sort(function(a,b){ return (b.w*b.h) - (a.w*a.h); });

			Adder.init(simgs);
		}

		$('#wrap_waiting').hide();
	});
}

function setNotiCount() {
	var count = parseInt(localStorage['fancyBadgeText']) || 0;

	$('button.notice.view > span.count').text(count);

	if(count > 1) $('button.notice.view > span.s').show();
	else $('button.notice.view > span.s').hide();

	if(count) {
		$('#content > .notice:hidden').slideDown('fast');
	} else {
		$('#content > .notice:visible').slideUp('fast');
	}

	setTimeout(setNotiCount, 500);
}

if(isChrome) {
	chrome.extension.onRequest.addListener(function(request, sender){
		if(request.type != 'fancy.images') return;
		doFancy(request.images);
	});
}

$.ajax('http://fancy.com/notifications_count.json', { } )
	.success(function(data,status,xhr) { 
		if(data && data.response) {
			bookmarklet_username = data.response.username;
		}
		
		if(isChrome) {
			chrome.tabs.getSelected(null, function(tab){
				tab_url   = tab.url;
				tab_title = tab.title;
				chrome.tabs.executeScript(tab.id, {file:'collect_images.js'});
			});
		}
	})
	.complete(function(xhr, status){
		if(xhr.status == 404) {	// not signed in
			chrome.tabs.create({url:'https://fancy.com/fancyit/login',selected:true}, function(){ window.close() });
		}
	});
	
// load user's list
$.ajax({
	type : 'GET',
	url  : 'http://fancy.com/get_fancy_lists.json',
	dataType : 'json',
	success : function(json){
		var $list = $('#user-list'), $opts = $list.find('>option'), old_ids=[], cur_ids=[], i, c;
		
		// this json data should be an array
		if(!json || !json.length) return;

		for(i=2,c=$opts.length; i < c; i++) old_ids.push($opts[i].value);
		for(i=0,c=json.length; i < c; i++) cur_ids.push(json[i].id);
		
		if(old_ids.join(' ') === cur_ids.join(' ')) return;

		$opts.slice(2).remove();
		for (i=0,c=json.length; i < c; i++) {
			$list.append('<option value="'+json[i].id+'">'+json[i].title+'</option>');
		}
	},
	error : function(){
	}
});

var wasOpen = 0;
var needClose = 0;
function startCheckOpen () {
	setInterval(function(){
		if (document.getElementById('thefancy_bookmarklet_tagger_iframe') != null) {
			if ( window.wasOpen == 0 ){
				window.wasOpen = 1;
			}
		}
		else if (window.wasOpen == 1){
			//closeit!
			window.close();
		}
	}, 100);
}
startCheckOpen();

function resizePanel()
{
	var wrapper = document.getElementById('wrapper');
	var height  = wrapper.offsetTop + wrapper.offsetHeight;

	document.body.style.height = height+'px';
}

jQuery(function($){
	$('#close').click(function () {
		window.close();
	});
	$('#fancyit').click( function(){
		this.disabled = true;
		Adder.fancyit();
	});
	$('#gosee').click(function(){
		var url = $(this).data('image_url');
		chrome.tabs.create({ url : url });
		window.close();
	});

	$('#content > button.notice.view').click(function(){
		showNoticePage('fast');
	});
	
	$('#notiList > button.notice.back').click(function(){
		showContentPage('fast');
	});
	
	$('#showmore > a').click(function(){
		chrome.tabs.create({ url : this.href });
		window.close();
		return false;
	});

	(function(){
		if(document.body && document.body.scrollLeft) {
			document.body.scrollLeft = 0;
		}
		setTimeout(arguments.callee, 100);
	})();

	// prevent scrolling
	$('body')
		.on('mousedown.scroll', function(e){
			var nn = e.target.nodeName;

			resizePanel();
			document.getElementById('wrapper').style.position = 'fixed';

			if(nn) nn = nn.toLowerCase();
			if(nn == 'input' || nn == 'select') return true;

			return false;
		})
		.on('mouseup.scroll', function(e){
			document.body.style.height = '';
			document.getElementById('wrapper').style.position = '';
		});
});

$(window)
	.load(function(){
		setNotiCount();
	})
	.on('scroll', function(){
		document.body.scrollLeft = 0;
		return false;
	});

if(isChrome) {
	chrome.tabs.getSelected(null, function(tab){
		var parts = (tab.url||'').match(/^([^:]+):(?:\/\/)?([^\/]+)/i);
		var disable_protocol = ['chrome', 'chrome-extension', 'about'];
		var disable_url = ['www.fancy.com','fancy.com','chrome.google.com'];
		
		if(tab.url && disable_protocol.indexOf(parts[1]) < 0 && disable_url.indexOf(parts[2]) < 0 ) {
			$(function(){ $('#wrap_disable').hide() });
			return;
		}

		var notice = parseInt(localStorage['fancyBadgeText']||'0');

		$('#wrap_disable').show();
		$('#wrap_waiting,#fancyit').hide();

		if(notice) {
			$('#notiList > button.notice').hide();
			(function(){
				var fn = arguments.callee;
				if($(window).height() > 200) {
					showNoticePage();
				} else {
					setTimeout(fn, 100);
				}
			})();
		}
	});
}

function showContentPage(speed, callback)
{
	var $list = $('#notiList').find('#notiList > .list');

	function _callback(){
		$('#notiList').css('visibility', 'hidden');
		if(typeof(callback) == 'function') callback();
	}
	
	$('#content').css('visibility', '');

	if(speed) {
		$('#wrapper').animate({'margin-left':'0'}, speed, _callback);
		$list.animate({'height':'-=50px'}, speed);
	} else {
		$('#wrapper').css('margin-left', '0');
		$list.height('height', $list.height() - 50);
		_callback();
	}
}

function showNoticePage(speed, callback)
{
	var $list = $('#notiList > .list'), notis = localStorage['fancyNotifications']||'[]', html = '', url, cls;
	
	function _callback(){
		$('#content').css('visibility', 'hidden');
		if(typeof(callback) == 'function') callback();
	}

	notis = JSON.parse(notis);

	for(var i = 0, len = notis.length; i < len; i++) {
		url   = '';
		cls   = '';
		html += '<li><img src="'+notis[i].user.img+'" class="user" />';
		if(notis[i].thing) {
			url = notis[i].thing.url;
			html += '<img src="'+notis[i].thing.thumb_img+'" data-url="'+url+'" class="thing" />';
		} else if(notis[i].user2) {
			url = 'http://fancy.com/'+notis[i].user2.name;
			html += '<button type="button" class="fbutton left blue follow" data-user2="'+(notis[i].user2.name||'')+'"><span>Follow</span></button>';
		} else {
			cls = ' class="nomargin"';
		}

		html += '<p'+cls+'><a href="'+url+'">'+notis[i].text+'</a></p>';
		html += '</li>';
	}

	$list
		.css('height', $(window).height() - $('body > header')[0].offsetHeight - $('.list')[0].offsetTop)
		.find('>ul')
			.html(html)
			.find('button.follow').click(function(){
					var user2 = $(this).data('user2');

					if(user2) {
						chrome.tabs.create({url:'http://fancy.com/'+user2});
						window.close();
					}
				})
			.end()
			.find('img.thing').click(function(){
				chrome.tabs.create({url:$(this).data('url')});
				window.close();
			});

	// clear badge text
	localStorage['fancyBadgeText'] = '0';
	chrome.browserAction.setBadgeText({text:''});
	
	$('#notiList').css('visibility', '');

	if(speed) {
		$('#wrapper').animate({'margin-left':'-320px'}, speed, _callback);
	} else {
		$('#wrapper').css('margin-left', '-320px');
		_callback();
	}
}
