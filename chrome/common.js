/**
 * Created by john on 9/25/14.
 */


function showLogin() {
    chrome.tabs.create({
            url: signin_path
        },
        function(tab){
            loginTabId = tab.id;
            //chrome.tabs.connect(loginTabId, ).onDisconnect(function(){ loginTabId = 0; });
        });
}

function notLogin(data){
    console.log(JSON.stringify(data));
    if (data.response && data.response.signed_in === false)
        return true;
    else return false;
}
