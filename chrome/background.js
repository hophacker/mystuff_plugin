var logged_in = false, installed = true, loginTabId = 0, isRetina = window.devicePixelRatio > 1;



if(!localStorage['fancyBadgeText']) {
    // initial install
    installed = false;
}

function showLogin() {
    var EXT_ID  = chrome.i18n.getMessage("@@extension_id");
    var optionsPage = 'chrome-extension://'+EXT_ID+'/options.html';

    chrome.tabs.create(
        {url:'https://fancy.com/fancyit/login?next='+optionsPage},
        function(tab){
            loginTabId = tab.id;
            chrome.tabs.connect().onDisconnect(function(){ loginTabId = 0; });
        }
    );
}

function checkLogin() {
    var api = 'http://fancy.com/jsonfeed/check_login_status';
    var interval = 60; // seconds

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function(){
        if(xhr.readyState != 4) return;
        if(xhr.status != 200) return setTimeout(checkLogin, interval*2000); // something is wrong on fancy server. wait more.

        var data = JSON.parse(xhr.responseText);
        if(!data || !data.response || !data.response.logged_in) return setTimeout(checkLogin, interval*2000); // something is wrong on fancy server. wait more.
        if(data.response.logged_in){
            logged_in = true;
            return checkNotification();
        }

        if(!installed) {
            if(!loginTabId) showLogin();
            installed = true;
        }

        setTimeout(checkLogin, interval*1000);

    }
    xhr.open('GET', api, true);
    xhr.send();
}
checkLogin();

function checkNotification() {
    var api = 'http://fancy.com/jsonfeed/notifications';
    var interval = 60; // seconds
    var displayNoti = localStorage['fancyDisplayNoti'] || 'Y';

    if(displayNoti == 'N') {
        return setTimeout(checkNotification, 1000);
    }

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function(){
        if(xhr.readyState != 4) return;

        var timer = setTimeout(checkNotification, interval * 1000);

        if(xhr.status == 404) {
            logged_in = false;
            clearTimeout(timer);
            return setTimeout(checkLogin, 0);
        }

        if(xhr.status != 200) return;

        var data = JSON.parse(xhr.responseText), valid_count = 0;
        var notis = data.response.notifications, list = [], oldList, entity, popup, count, i, len, n;

        for(i=0, len=notis.length; i < len; i++) {
            n = notis[i];
            if(n.type == 'followed_add_person' || n.type == 'follow') continue;

            valid_count++;
            entity = {type:n.type, user:{name:n.entities.user.username, img:n.entities.user.image_url}};

            if(n.entities.comment) {
                entity.comment = n.entities.comment.comment;
            }

            if(n.entities.thing) {
                entity.thing = {
                    thumb_img:n.entities.thing.thumb_image_url,
                    name : n.entities.thing.name,
                    url  : n.entities.thing.url
                };
            }

            if(n.entities.user2) {
                entity.user2 = {
                    name : n.entities.user2.username,
                    img  : n.entities.user2.image_url
                };
            }

            entity.text = n.text;

            list.push(entity);
        }

        count  = parseInt(localStorage['fancyBadgeText']) || 0;
        count += valid_count;

        localStorage['fancyBadgeText'] = count;

        if(count) chrome.browserAction.setBadgeText({text:count+''});

        list = list.concat(JSON.parse(localStorage['fancyNotifications'] || '[]'));
        list = list.slice(0, 20);
        localStorage['fancyNotifications'] = JSON.stringify(list);

        if(!displayNoti || displayNoti == 'N') return;

        for(i=0, len=notis.length; i < len; i++) {
            if(notis[i].type == 'followed_add_person' || notis[i].type == 'follow') continue;
            popup = processNotification( notis[i] );
            //if(!popup) break;
        }
    };
    xhr.open('GET', api, true);
    xhr.send();
};

var noti_popups = {}, noti_ids = [], noti_id = 0;
function processNotification( noti ) {
    if(window.webkitNotifications.checkPermission() != 0) {
        window.webkitNotifications.requestPermission();
        return false;
    }

    var popup = null, query = '', userImage, opt, id = 'noti-'+noti_id++;
    var isBigType = (['fancyd','shown_to_me','comments_on_fancyd','featured','followed_commented'].indexOf(noti.type) > -1);

    if(noti_id > 1000) noti_id = 0;

    userImage = getResizedURL(noti.entities.user.original_image_url || noti.entities.user.image_url, 80, 80);

    if(isBigType) {
        opt = {
            type  : 'image',
            title : 'Fancy',
            message  : noti.text,
            iconUrl  : userImage,
            imageUrl : getResizedURL(noti.entities.thing.image_url, 360, 120)
        };
        url = noti.entities.thing.url;
    } else {
        opt = {
            type  : 'basic',
            title : 'Fancy',
            message : noti.text,
            iconUrl : userImage,
        };

        if(noti.type == 'followed_add_person') {
            url = 'http://fancy.com/'+noti.entities.user2.username;
        }
    }

    chrome.notifications.create(id, opt, function(){ /* error checking */ });

    if(id) {
        noti_popups[id] = url;
        noti_ids.push(id);
    }

    if(!arguments.callee.initEvent){
        arguments.callee.initEvent = true;

        chrome.notifications.onClicked.addListener(function(id){
            if(!noti_popups[id]) return;
            chrome.tabs.create( {url : noti_popups[id]}, function(tab) { } );
        });

        chrome.notifications.onClosed.addListener(function(id){
            var idx = noti_ids.indexOf(id);
            if(idx > -1) {
                noti_ids.splice(idx, 1);
                delete noti_popups[id];
            }
        });
    }
}

function getResizedURL(url, width, height){
    if(isRetina) {
        width *= 2;
        height *= 2;
    }

    return url.replace(/^(https?:\/\/cf\d+)\.(\w+)\.com/, '$1.thingd.com/resize/'+width+'x'+height+'/$2');
}

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if(changeInfo.status == 'loading') {
        if(/^https?:\/\/(?:www\.)?(fancy\.com|[\w-]+\.thin\.gd)/.test(tab.url)) {
            chrome.tabs.executeScript(tabId, {code:'document.body.classList.add("fancyChrome");'});

            if(/^https?:\/\/(www\.)?fancy\.com\/notifications/.test(tab.url)) {
                localStorage['fancyBadgeText'] = '0';
                chrome.browserAction.setBadgeText({text:''});
            }
        } else if(/^https?:\/\/www\.google\.co(?:m|\.[a-z]+)(\/webhp|\/search|\/#|\/?$)/.test(tab.url)) {
            if(localStorage['fancyEnhanceSearch'] != 'N') {
                chrome.tabs.executeScript(tab.id, {file:'search_inject.js'});
            }
        }
    }
});

var fancyInjectXHR = null;
chrome.extension.onRequest.addListener(
    function(request, sender, sendResponse) {
    if(request.type == 'fancy.inject') {
        try { fancyInjectXHR.abort() } catch(e) {};
        var fancyInjectXHR = ajax({
            url : 'http://fancy.com/jsonfeed/search?q='+encodeURIComponent(request.query)+'&via=chrome&_='+(new Date).getTime(),
            dataType : 'json',
            success  : function(data, status, xhr) {
                sendResponse(data);
            }
        });
    }
}
);
