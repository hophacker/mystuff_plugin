$(function(){
    var form =
            '<form id="hoppy_event_form" class="col-md-10 col-md-offset-1" action="' + events_path + '" method="post"> \
                <div class="hoppy_group"> \
                    <label>Begin Time:</label>\
                    <input class="input" type="text" name="event[begin_datetime]" id="hoppy_event_begin_datetime" width="1000">\
                </div> \
                <div class="hoppy_group"> \
                    <label>End Time:</label>\
                    <input class="input" type="text" name="event[end_datetime]" id="hoppy_event_end_datetime" width="1000">\
                </div> \
                <div class="hoppy_group">\
                    <label>Title:</label>\
                    <input class="input" type="text" name="event[title]" id="hoppy_event_title">\
                </div> \
                <div class="hoppy_group">\
                    <label>Description:</label> \
                    <textarea class="input" name="event[description]" id="hoppy_event_description"></textarea> \
                </div> \
            </div><div class="row"></form>',
        modal =
            '<div aria-hidden="true" aria-labelledby="myModalLabel" class="modal fade" id="hoppy_modal" item-id="-1" role="dialog" tabindex="-1"> \
                <div class="modal-dialog"> \
                    <div class="modal-content"> \
                        <div class="modal-header"> \
                            <h4 class="modal-title" id="myModalLabel">Add event to your calendar</h4> \
                        </div> \
                        <div class="modal-body">'
                            + form +
                        '</div> \
                        <div class="modal-footer"> \
                            <button class="btn btn-primary" type="button">Add Event</button> \
                        </div> \
                    </div> \
                </div> \
            </div> \
            <div aria-hidden="true" aria-labelledby="myModalLabel" class="modal fade" id="hoppy_modal_finished" item-id="-1" role="dialog" tabindex="-1"> \
                <div class="modal-dialog"> \
                    <div class="modal-content"> \
                        <div class="modal-header"> \
                            <h4 class="modal-title" id="myModalLabel">Event saved successfully</h4> \
                        </div> \
                        <div class="modal-body"> finished </div> \
                    </div> \
                </div>\
            </div>';

//    <button class="close" data-dismiss="modal" type="button"> \
//        <span class="sr-only">Close</span> \
//    </button> \
//        <span aria-hidden="true">×</span> \
//    <button class="btn btn-default" data-dismiss="modal" type="button">Cancel</button> \

    $("body").append(modal);
    $('#hoppy_modal .modal-footer').css("text-align", "center");
    var hoppy_modal = $('#hoppy_modal');
    var hoppy_modal_finished = $('#hoppy_modal_finished');
    hoppy_modal.on('click', function(){
        $(this).modal({
            backdrop: "static"
        })
    }).on('hidden.bs.modal', function(){
//        var d = document.getElementsByTagName("body")[0];
//        d.className = d.className.replace("modal-open","modal-close");
//        $('.modal-backdrop').remove();
    });
    $('#hoppy_event_begin_datetime').datetimepicker({
        format:'Y-m-d H:i'
    });
    $('#hoppy_event_end_datetime').datetimepicker({
        format:'Y-m-d H:i'
    });
    $('#hoppy_modal .btn-primary').on('click', function(e){
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
                    hoppy_modal.modal('hide');
                    hoppy_modal_finished.find('.modal-body').html(
                            '<a target="_blank" href="' + data.response.created_url + '">Go to check saved event</a>'
                    );
                    hoppy_modal_finished.modal();
                }else{
                    alert(JSON.stringify(data))
                }
                // do something after submitting
            }
        );
    });
});
