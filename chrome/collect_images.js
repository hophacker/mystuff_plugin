(function(){
    function getImages(doc) {
        if(!doc || !doc.images || !doc.images.length) return [];

        console.log(doc.images)
        var arr=[], sources=[], img, w, h;

        for(var i=0, l=doc.images.length; i < l; i++) {
            img = doc.images[i];
            w   = img.offsetWidth;
            h   = img.offsetHeight;

            if(w > 140 && h > 140 && sources.indexOf(img.src) < 0) {
                sources.push(img.src);
                arr.push({'src':img.src, 'w':w, 'h':h});
            }
        }
        return arr;
    }

    var images = getImages(document);

    if(typeof(chrome) !=='undefined' && chrome.extension) {
        chrome.extension.sendRequest({type:'fancy.images', images:images});
    } else if(self.port && self.port.emit) {
        self.port.emit('fancy.images', images);
    }
})();
