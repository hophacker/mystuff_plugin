function onClickHandler(info, tab) {
    if (info.menuItemId === "radio1" || info.menuItemId === "radio2") {
        alert("radio item " + info.menuItemId +
                    " was clicked (previous checked state was "  +
                    info.wasChecked + ")");
    } else if (info.menuItemId === "checkbox1" || info.menuItemId === "checkbox2") {
        console.log(JSON.stringify(info));
        console.log("checkbox item " + info.menuItemId +
                    " was clicked, state is now: " + info.checked +
                    " (previous state was " + info.wasChecked + ")");

    } else {
        console.log("item " + info.menuItemId + " was clicked");
        console.log("info: " + JSON.stringify(info));
        console.log("tab: " + JSON.stringify(tab));
    }
}

function radioOnClick(info, tab) {
  console.log("radio item " + info.menuItemId +
              " was clicked (previous checked state was "  +
              info.wasChecked + ")");
}

function selectionHandler(){
    return function(info, tab){
//        if (getLoginState()){
//            console.log("signed in!");
//        }else{
//            console.log("not signed in!");
//            showLogin();
//            return;
//        }
//        console.log(JSON.stringify(info));
//        console.log(JSON.stringify(tab));
        var data = {
            'text[selection_text]'      : info.selectionText,
            'text[page_url]'            : info.pageUrl,
            'text[frame_url]'           : info.frameUrl,
            'client_type'               : 'plugin'
        };

        chrome.cookies.get(
            {url: root_path, name:'mystuff_token'},
            function(cookie){
                $.ajax({
                    url  : texts_path,
                    type : 'POST',
                    data : data,
                    dataType : 'json',
                    beforeSend : function(xhr, settings) {
                        if(cookie && cookie.value) {
                            xhr.setRequestHeader('X-CSRFToken', cookie.value);
                        }
                    },
                    success : function(data,status,xhr) {
                        console.log(data);
                        if( data.status_code === 0 ) {
                            if (notLogin(data)){
                                showLogin();
                                return;
                            }
                            var counter=0;
                            var fire=function() {
                                if (counter<=5) {
                                    if (counter%2===0)
                                        chrome.browserAction.setIcon({path:"Folder-Generic-icon1.png"});
                                    else
                                        chrome.browserAction.setIcon({path:"Folder-Generic-icon.png"});
                                    counter++;
                                } else {
                                    clearInterval(fire);
                                }
                            };
                            setInterval(fire,100);
                        } else {
                            alert("failed!");
                        }
                    }
                });
            }
        );
    };
}
function toEventFormat(datetime){
    return datetime.substr(0, 10) + ' ' + datetime.substr(11, 5)
}
function eventHandler(){
    return function(info, tab){
//        console.log(JSON.stringify(chrono.parse("An appointment on Sep 12-13")));

        var selected =  info.selectionText,
            datetimes = chrono.parse(selected),
            begin_datetime = "",
            end_datetime = "",
            now = moment();

        if(datetimes.length === 0){
            begin_datetime = end_datetime = now;
        }else {
            datetime = datetimes[0];

            if (typeof datetime.startDate != 'undefined') {
                begin_datetime = moment(datetime.startDate);
            }else begin_datetime = now;

            if (typeof datetime.endDate != 'undefined') {
                end_datetime = moment(datetime.endDate);
            }else end_datetime = now;

        }



        begin_datetime = begin_datetime.format("YYYY-MM-DD HH:mm");
        end_datetime = end_datetime.format("YYYY-MM-DD HH:mm");

        var script_var = {
            'description'   : info.selectionText,
            'begin_datetime'      : begin_datetime,
            'end_datetime'      : end_datetime
        }
        console.log(script_var);
        chrome.tabs.getSelected(null, function(tab){
            chrome.tabs.executeScript(
                tab.id,
                {code: 'var data = ' + JSON.stringify(script_var)},
                function(){
                    chrome.tabs.executeScript(tab.id, {file:'js/addEvent.js'});
                }
            );
        });
        /*alert(JSON.stringify(chrono.parse(info.selectionText)));
        var data = {
            'text'      : info.selectionText
        };
        chrome.cookies.get(
            {url: root_path, name:'mystuff_token'},
            function(cookie){
                $.ajax({
                    url  : api_path + "/extract_time.json",
                    type : 'POST',
                    data : data,
                    dataType : 'json',
                    beforeSend : function(xhr, settings) {
                        if(cookie && cookie.value) {
                            xhr.setRequestHeader('X-CSRFToken', cookie.value);
                        }
                    },
                    success : function(data,status,xhr) {
                        var script_var = {
                            'description'   : info.selectionText,
                            'datetime'      : data.response.datetime
                        }
                        chrome.tabs.getSelected(null, function(tab){
                            tab_url   = tab.url;
                            tab_title = tab.title;
                            chrome.tabs.executeScript(
                                tab.id,
                                {code: 'var data = ' + JSON.stringify(script_var)},
                                function(){
                                    chrome.tabs.executeScript(tab.id, {file:'js/addEvent.js'});
                                }
                            );
                        });
                    }
                });
            }
        );*/
    };
}

chrome.contextMenus.onClicked.addListener(onClickHandler);

chrome.runtime.onInstalled.addListener(function() {
    var contexts = ["page","link","editable","image","video", "audio"];

    chrome.contextMenus.create({
        "title": "[HOPPY]Collect Text",
        "contexts": ["selection"],
        "onclick": selectionHandler()
    });

    chrome.contextMenus.create({
        "title": "[HOPPY]Collect Event",
        "contexts": ["selection"],
        "onclick": eventHandler()
    });


    chrome.contextMenus.create({ "title": "Test parent item", "id": "parent" });
    chrome.contextMenus.create({"title": "Child", "parentId": "parent", "id": "child"});
    chrome.contextMenus.create({
        "title": "Radio 1",
        "type": "radio",
        "id": "radio1"
    });

    // Create some checkbox items.
    chrome.contextMenus.create({"title": "Checkbox", "type": "checkbox", "id": "checkbox"});
    // Intentionally create an invalid item, to show off error checking in the
    // create callback.
    console.log("About to try creating an invalid item - an error about " +
                "duplicate item child1 should show up");
    chrome.contextMenus.create({"title": "Oops", "id": "child1"}, function() {
        if (chrome.extension.lastError) {
            console.log("Got expected error: " + chrome.extension.lastError.message);
        }
    });
});
