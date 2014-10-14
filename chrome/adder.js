var Adder = (function(){
    var imgs = [];
    var $imglist, $selectable, $selected, $left_nav, $right_nav; // jquery selections have a prefix '$'
    var pos_start = 0, pos_selected = 0, move_w = 0;
    var COUNT = 3;

    return {
        init : function(images) {
            var _this = this, len = images.length, $items;

            imgs = images;
            $imglist = $('#image_list');

            if(!$left_nav)   $left_nav   = $('#left_nav').click(function(){ _this.moveSelectable(-COUNT); });
            if(!$right_nav)  $right_nav  = $('#right_nav').click(function(){ _this.moveSelectable(+COUNT); });
            if(!$selected)   $selected   = $('#selected_image');
            if(!$selectable) {

                for(var i=0,l=(len>COUNT)?COUNT*3:len; i < l; i++) {
                    $imglist.find('> ul').append('<li></li>');
                }

                $selectable = $imglist.find('li');
                $selectable.click(function() {
                    var $this = $(this);

                    $selectable.removeClass('selected');
                    $this.addClass('selected');

                    $selected.attr('src', $this.data('src'));
                    pos_selected = imgs.indexOf($this.data('src'));
                });
            }

            if(imgs.length <= COUNT) {
                $left_nav.css('visibility', 'hidden');
                $right_nav.css('visibility', 'hidden');
                if(imgs.length === 2) $('#image_list ul').css('width', '156px');
            } else {
                $imglist.find('ul').addClass('carousel');
                $items = $imglist.find('li');
                move_w = $items.eq(COUNT).prop('offsetLeft') - $items.eq(0).prop('offsetLeft');
            }

            this.setSelectables(pos_start);
        },
        moveSelectable : function(w) {
            var _this = this, len = imgs.length, mleft, $items;

            if(len <= COUNT) return;

            pos_start += w;
            if(pos_start > len-1) pos_start -= len;
            if(pos_start < 0) pos_start += len;

            // animate and set selectable
            mleft = parseInt($imglist.find('>ul').css('margin-left'));

            $imglist.find('>ul:not(:animated)')
                .animate(
                {'margin-left':(mleft+move_w*(w>0?-1:1))+'px'},
                function(){
                    var $this = $(this), $slices;

                    if(w < 0) {
                        $slices = $this.find('>li').slice(w);
                        $this.append($slices);
                    } else {
                        $slices = $this.find('>li').slice(0,w);
                        $this.prepend($slices);
                    }

                    $this.css('margin-left', mleft);
                    _this.setSelectables(pos_start);
                }
            );
        },
        setSelectables : function(start) {
            var idx, len = imgs.length, i_start, i_end, i_img;

            $selectable.removeClass('selected');

            i_start = (len > COUNT)?-COUNT:0;
            i_end   = (len > COUNT)?COUNT*2:len;

            for(var i=i_start; i < i_end; i++)
            {
                idx = start + i;
                i_img = (len > COUNT)?i+COUNT:i;

                while(idx > len -1) idx -= len;
                while(idx < 0) idx += len;

                if(imgs[idx].src !== $selectable.eq(i_img).data('src')) {
                    $selectable.eq(i_img).data('src', imgs[idx].src).css('background-image', 'url('+imgs[idx].src+')');
                }
                if(pos_selected == idx) {
                    $selectable.eq(i_img).addClass('selected');
                    $selected.attr('src', imgs[idx].src);
                }
            }
        },
        fancyit : function() {
            var data = {
                //'category'  : $("#category-for-thing").val(),
                'image[title]'      : $("#image_title").val(),
                'image[description]'      : $("#image_description").val(),
                'image[image_url]' : $selected.attr('src'),
                'image[source_url]'   : tab_url
                //'user_key'  : bookmarklet_username,
                //'via'       : 'chrome',
                //'list_ids'  : $('#user-list').val()
            };

            if(!data.category){
                delete data.category;
            }

            if(!data.list_ids){
                delete data.list_ids;
            }

            chrome.cookies.get(
                {url: root_path, name:'mystuff_token'},
                function(cookie){
                    console.log(JSON.stringify(cookie));
                    $.ajax({
                        url  : images_path,
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
                            if (notLogin(data)){
                                showLogin();
                                return;
                            }
                            if( data.status_code == 0 ) {
                                $("#gosee").data('image_url', data.response.image_url);
                                $("#wrap_add,#fancyit").hide();
                                $("#wrap_success").show();
                                $('body').trigger('mouseup.scroll');
                            } else {
                                var msg = data.message || 'An error occured while requesting the server.\nPlease try again later.';
                                window.close();
                            }
                        }
                    });
                }
            );
        }
    };
})();
