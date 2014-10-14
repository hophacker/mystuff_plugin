var tab_title, tab_url, bookmarklet_username;
var ready = 0, doc_len = 0;// token = '';
var isChrome  = (typeof(chrome) !== 'undefined');
var isFF      = (self && self.port);


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

            // we don't want to hide it since we want image collecting page be the same length
            //if(simgs.length == 1) $('#navigator').hide();

            // sort by extent (larger first)
            simgs.sort(function(a,b){ return (b.w*b.h) - (a.w*a.h); });

            Adder.init(simgs);
        }

        $('#wrap_waiting').hide();
    });
}

function doNote() {
	$note_wrap=$('#wrap_note');
	$('#note_btn').click(function(){
		$note_wrap.toggle();
	});
	$('#note-area').click(function(){
		$(this).focus();
	})

	$('#note-save').click(function(){
		var note=$('#note-area').val();
		 var data = {
            'text[selection_text]'      : note,
            'text[page_url]'            : 'na',
            'text[frame_url]'           : 'na'
        };
		uploadText(data);
		window.close();
	})
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
		doNote();
	});
}

function signup_now(){
    chrome.tabs.create({url:signin_path ,selected:true}, function(){ window.close() });
}
$.ajax(api_path + '/notifications_count.json', { } )
    .success(function(data,status,xhr) {
        if(data && data.response && data.response.signed_in) {
            bookmarklet_username = data.response.username;
            if(isChrome) {
                chrome.tabs.getSelected(null, function(tab){
                    tab_url   = tab.url;
                    tab_title = tab.title;
                    chrome.tabs.executeScript(tab.id, {file:'collect_images.js'}, function(){
                        console.log("collect_images.js executed")
                    });
                });
            }
        }else{
            signup_now()
        }

    })
    .complete(function(xhr, status){
        if(xhr.status == 404) {	// not signed in
            signup_now();
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
            html += '<button type="button" class="jbutton left blue follow" data-user2="'+(notis[i].user2.name||'')+'"><span>Follow</span></button>';
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
