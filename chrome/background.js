/* global signin_path, root_path, ajax */
var signed_in = false, installed = true, loginTabId = 0, isRetina = window.devicePixelRatio > 1;



if(!localStorage.fancyBadgeText) {
    // initial install
    installed = false;
}

function showLogin() {
    chrome.tabs.create({
        url: signin_path 
    },
    function(tab){
        loginTabId = tab.id;
        //chrome.tabs.connect(loginTabId, ).onDisconnect(function(){ loginTabId = 0; });
    });
}

function checkLogin() {
    var interval = 60; // seconds

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function(){
        if(xhr.readyState !== 4) return;
        if(xhr.status !== 200) return setTimeout(checkLogin, interval*2000); // server might be wrong, wait patiently.

        var data = JSON.parse(xhr.responseText);
        //console.log("data is ready")
        //console.log(data.response)
        if(!data || !data.response || !data.response.signed_in) return setTimeout(checkLogin, interval*2000); 

        if(data.response.signed_in){
            signed_in = true;
            return true;
        }

        if(!installed) {
            if(!loginTabId) showLogin();
            installed = true;
        }

        setTimeout(checkLogin, interval*1000);

    };
    xhr.open('GET', root_path + '/api/check_signin.json', true);
    xhr.send();
}
checkLogin();

var noti_popups = {}, noti_ids = [], noti_id = 0;

function getResizedURL(url, width, height){
    if(isRetina) {
        width *= 2;
        height *= 2;
    }

    return url.replace(/^(https?:\/\/cf\d+)\.(\w+)\.com/, '$1.thingd.com/resize/'+width+'x'+height+'/$2');
}

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if(changeInfo.status === 'loading') {
        if(/^https?:\/\/(?:www\.)?(fancy\.com|[\w-]+\.thin\.gd)/.test(tab.url)) {
            chrome.tabs.executeScript(tabId, {code:'document.body.classList.add("fancyChrome");'});

            if(/^https?:\/\/(www\.)?fancy\.com\/notifications/.test(tab.url)) {
                localStorage.fancyBadgeText = '0';
                chrome.browserAction.setBadgeText({text:''});
            }
        } else if(/^https?:\/\/www\.google\.co(?:m|\.[a-z]+)(\/webhp|\/search|\/#|\/?$)/.test(tab.url)) {
            if(localStorage.fancyEnhanceSearch !== 'N') {
                chrome.tabs.executeScript(tab.id, {file:'search_inject.js'});
            }
        }
    }
});

var fancyInjectXHR = null;
chrome.extension.onRequest.addListener(
    function(request, sender, sendResponse) {
    if(request.type === 'fancy.inject') {
        try { fancyInjectXHR.abort(); } catch(e) {}
        var fancyInjectXHR = ajax({
            url : 'http://fancy.com/jsonfeed/search?q='+encodeURIComponent(request.query)+'&via=chrome&_='+(new Date()).getTime(),
            dataType : 'json',
            success  : function(data, status, xhr) {
                sendResponse(data);
            }
        });
    }
}
);
