var config_url = "localhost",
    config_port = "3000";
var root_path = 'http://' + config_url + ':' + config_port,
    texts_path = root_path + '/texts.json',
    images_path = root_path + '/images.json',
    signin_path = root_path + '/signin',
    api_path = root_path + "/api";
var uploadText=function (data) {
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
                        console.log(data)
                        if( data.status_code == 0 ) {
                            var counter=0;
                            var fire=function() {
                                if (counter<=5) {
                                    if (counter%2==0)
                                        chrome.browserAction.setIcon({path:"Folder-Generic-icon1.png"});
                                    else
                                        chrome.browserAction.setIcon({path:"Folder-Generic-icon.png"});
                                    counter++;
                                } else {
                                    clearInterval(fire);
                                }
                            }
                            setInterval(fire,100);
                        } else {
                            alert("failed!");
                        }
                    }
                });
            }
        );
}