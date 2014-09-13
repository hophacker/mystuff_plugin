(function(){

if(window.FANCY_INJECTION) return;
window.FANCY_INJECTION = true;

function _(selector) {
	return document.querySelector(selector);
}

var _last_keyword = '', ol, fancyBlock = null;
var icecream_icon = 'iVBORw0KGgoAAAANSUhEUgAAAAsAAAAUCAYAAABbLMdoAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2ZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDowMjgwMTE3NDA3MjA2ODExODA4MzlFM0Q5MDE0NEI1MyIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDoxNjA3NUVEMjBFMDYxMUUxQTM5QUZGQkU0MTlDMzgwQiIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDoxNjA3NUVEMTBFMDYxMUUxQTM5QUZGQkU0MTlDMzgwQiIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M1IE1hY2ludG9zaCI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjA0ODAxMTc0MDcyMDY4MTE4MDgzOUUzRDkwMTQ0QjUzIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjAyODAxMTc0MDcyMDY4MTE4MDgzOUUzRDkwMTQ0QjUzIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+L/QU4gAAAIZJREFUeNpiNC/cwQAFgUCcBsSWQMwPxB+B+DgQTwHirSAFTFCFE4B4HRB7QBUyQGkQfwsQd4EEWIDYD4jzGfCDUiDexwS1mhiQwwR1IzHAEqRYiEjFQkwMJIBRxeiKvxOp9jtIcQEQfyGgEJQCi0EJaRYUw8B/JDbjEAm6uVAPTUeXAAgwAMG7FR2gCFF4AAAAAElFTkSuQmCC';
var image_background = 'iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAMAAAC6sdbXAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2ZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDowMjgwMTE3NDA3MjA2ODExODA4MzlFM0Q5MDE0NEI1MyIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpCNzYxODA1OTE1RTQxMUUxOEU3NENGQzEyRDU5NDVGQiIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpCNzYxODA1ODE1RTQxMUUxOEU3NENGQzEyRDU5NDVGQiIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M1IE1hY2ludG9zaCI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjA0ODAxMTc0MDcyMDY4MTE4MDgzOUUzRDkwMTQ0QjUzIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjAyODAxMTc0MDcyMDY4MTE4MDgzOUUzRDkwMTQ0QjUzIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+lDb2cQAAAAZQTFRF+vr66OjoZbavOQAAABFJREFUeNpiYGQAA+wUQIABAABpAAa6ij2yAAAAAElFTkSuQmCC';

function inject(keyword){
	if(keyword == _last_keyword) return;
	if(fancyBlock) fancyBlock.style.display = 'none';
	
	_last_keyword = keyword;

	if(typeof(chrome)!='undefined' && chrome.extension) {
		chrome.extension.sendRequest(
			{type:'fancy.inject', query:_last_keyword},
			function(response) { draw(response.response, _last_keyword); }
		);
	} else if(self.port && self.port.emit) {
		self.port.emit('fancy.inject', _last_keyword);
	}
};

function draw(resp, query) {
	if(!fancyBlock) {
		fancyBlock = document.createElement('div');
		fancyBlock.id = 'fancyBlock';
		
		style = document.createElement('style');
		style.innerHTML = ''
			+'#fancyBlock{padding:12px;background:#fafafa;font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;}'
			+'#fancyBlock>h2{margin:0;padding:0 0 10px 0;font-weight:normal;font-size:medium;background-image:url("data:image/png;base64,'+icecream_icon+'");background-repeat:no-repeat;background-position:right top;}'
			+'#fancyBlock>h2>a{font-weight:bolder;color:#3a73b6;text-decoration:none;}'
			+'#fancyBlock>ul{list-style:none;margin:0;padding:0}'
			+'#fancyBlock>ul>li{float:left;margin:0 5px 0 0}'
			+'#fancyBlock>ul>li>div{display:table-cell;vertical-align:middle;text-align:center;width:140px;height:140px;background:#fff none repeat 0 0;background-image:url("data:image/png;base64,'+image_background+'");}'
			+'#fancyBlock img{max-width:140px;max-height:140px}';

		document.getElementsByTagName('head')[0].appendChild(style);
	}
	
	fancyBlock.style.display = resp.total_thing_count?'block':'none';

	var total_count = resp.total_thing_count;
	while(/^(\d+)(\d{3})(,.+)?$/.test(total_count)) {
		total_count = RegExp.$1+','+RegExp.$2+RegExp.$3;
	}

	// make result html
	var html = '';
	html += '<h2>Found <a href="http://fancy.com/search?q='+encodeURIComponent(query)+'">'+total_count+' thing'+(total_count>1?'s':'')+' on Fancy</a></h2>';
	html += '<ul>';
	for(var i=0, l=resp.things.length; i < l; i++) {
		html += '<li><div><a href="'+resp.things[i].url+'" style=""><img src="'+(resp.things[i].thumb_image_url||resp.things[i].image_url)+'" /></a></div></li>';
	}
	html += '</ul><div style="clear:both;"></div>';
	
	fancyBlock.innerHTML = html;

	if(!res.parentNode) res = _('#res');
	res.parentNode.insertBefore(fancyBlock, res);
};

(function(e){
	var keyword='';
	// keyword from query
	if(/[&\?]q=([^&#]+)/.test(location.search)) keyword = decodeURIComponent(RegExp.$1.replace('+',' '));
	// keyword from hash
	if(/[#&]q=([^&#]+)/.test(location.hash)) keyword = decodeURIComponent(RegExp.$1.replace('+',' '));
	
	inject(keyword);
	
	if(!e) {
		window.addEventListener('hashchange', arguments.callee, false);
	}
})();

})();