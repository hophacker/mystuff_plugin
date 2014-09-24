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
    if (!signed_in){
        console.log("not signed in!");
        showLogin();
    }
    return function(info, tab){
        console.log("hello");
        console.log(JSON.stringify(info));
        console.log(JSON.stringify(tab));
        var data = {
            'text[selection_text]'      : info.selectionText,
            'text[page_url]'            : info.pageUrl,
            'text[frame_url]'           : info.frameUrl
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
function eventHandler(){
    return function(info, tab){
        console.log(JSON.stringify(info));
        console.log(JSON.stringify(tab));
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
                        console.log(data);
                    }
                });
            }
        );
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
