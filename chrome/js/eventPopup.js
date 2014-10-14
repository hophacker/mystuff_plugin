$(function(){

    var form =
            '<form id="hoppy_event_form" class="hoppy_event_from" action="' + events_path + '" method="post"> \
                <div class="hoppy_group"> \
                    <label>Begin Time:</label>\
                    <input class="input hoppy_datetime" type="text" name="event[begin_datetime]" id="hoppy_event_begin_datetime" width="1000">\
                </div> \
                <div class="hoppy_group" > \
                    <label>End Time:</label>\
                    <input class="input hoppy_datetime" type="text" name="event[end_datetime]" id="hoppy_event_end_datetime" width="1000">\
                </div> \
                <div class="hoppy_group">\
                    <label>Title:</label>\
                    <input class="input" type="text" name="event[title]" id="hoppy_event_title">\
                </div> \
                <div class="hoppy_group higher">\
                    <label>Description:</label> \
                    <textarea class="input" name="event[description]" id="hoppy_event_description"></textarea> \
                </div> \
                <div class="btn clearfix">\
                    <a class="close hoppy-btn-primary" href="#">Add Event</a>\
                    <a class="close cancel" href="#">Cancel</a>\
                </div>\
            </form>\
            <div class="row"></div>';
        modal =
            '<div id="hoppy_modal">\
                <div class="header">\
                    Add event to your calendar\
                </div>'
                    + form +
                '</div> \
            </div>\
            <div id="hoppy_modal_finished"> \
                <div class="header"> \
                    Event saved successfully \
                </div> \
                <div class="modal-body"> finished </div> \
            </div>';

    $("body").append(modal);
    var hoppy_modal = $('#hoppy_modal');
    var hoppy_modal_finished = $('#hoppy_modal_finished');

    hoppy_modal.easyModal({
        zIndex: function(){return 100},
        top: 100,
        overlay : 0.2
    }).click(function(){
        hoppy_modal.trigger("openModal");
    })

    hoppy_modal_finished.easyModal({
        top: 100,
        overlay : 0.2
    });

    $('.hoppy_datetime').datetimepicker({
        format:'Y-m-d H:i',
        onShow: function() {
        }
    });


    $('#hoppy_modal .hoppy-btn-primary').on('click', function(e){
        e.preventDefault();
        $.post(events_path,{
                "event[title]" : $("#hoppy_event_title").val(),
                "event[description]" : $("#hoppy_event_description").val(),
                "event[begin_datetime]" : $("#hoppy_event_begin_datetime").val(),
                "event[end_datetime]" : $("#hoppy_event_end_datetime").val(),
                "event[datetime]" : $("#hoppy_event_begin_datetime").val()
            }
            ,function(data){
                if (data.status_code === 0){
                    hoppy_modal.trigger("closeModal")
                    hoppy_modal_finished.find('.modal-body').html(
                            '<a target="_blank" href="' + data.response.created_url + '">Go to check saved event</a>'
                    );
                    hoppy_modal_finished.trigger("openModal");
                }else{
                    alert(JSON.stringify(data))
                }
                // do something after submitting
            }
        );
    });
});
