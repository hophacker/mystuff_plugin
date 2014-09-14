(function(){
	
if(typeof(require)!='undefined') {
	eval('var {XMLHttpRequest} = require("request");');
};

function isFunction(fn) {
	return (typeof(fn) == 'function');
};

function ajax(options) {
	var opts = {
		type : 'GET',
		dataType : 'xml',
		headers  : {},
		context  : null
	};

	for(var name in options) opts[name] = options[name];

	var xhr = new XMLHttpRequest();

	xhr.onreadystatechange = function(){
		if(this.readyState != 4) return;

		if(this.status == 200) {
			try {
				var data;

				if(opts.dataType == 'xml') data = this.responseXML;
				else if(opts.dataType == 'json') data = JSON.parse(this.responseText);

				if(isFunction(opts.success)) {
					opts.success.call(opts.context||this, data, this.status, this);
				}
			} catch(e) {
				if(isFunction(opts.error)) {
					opts.error.call(opts.context||this, this, this.status, 'error', e);
				}
			}
		}

		if(isFunction(opts.complete)) {
			opts.complete.call(opts.context||this, this, this.status);
		}
	};
	
	xhr.open(opts.type, opts.url, true);

	// set headers
	xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
	for(var name in opts.headers) xhr.setRequestHeader(name, opts.headers[name]);

	xhr.send();

	return xhr;
};

if(typeof(exports)!='undefined') {
	exports.ajax = ajax;
} else {
	this.ajax = ajax;
}

})();