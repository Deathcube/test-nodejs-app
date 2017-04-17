
$('#fields').on('click', '.add_comment', function (e) {
    e.preventDefault();
    $('#comment_form').append('<input type="hidden" name="parent" value="'+$(this).attr('id')+'" />');
    $('#modal').modal('show');
});

$('.create_new_comment').on('click', function () {
    $('#comment_form').append('<input type="hidden" name="parent" value="" />');
    $('#modal').modal('show');
});

$('#fields').on('click', '.modal_send', function (e) {
    e.preventDefault();
    var fields = {};

    $.each($('#comment_form').serializeArray(), function( key, field ) {
        fields[field.name] = field.value;
    });

    console.log(1);

    $.ajax({
        method: "POST",
        url: "/",
        data: fields,
        success : function (data) {
            if(data.errors !== '') {
                $("span[id=err_hint]").remove();

                for (var i = 0; i < data.errors.length; i++) {
                    var _err = data.errors[i];
                    $('#comment_form')
                        .find('[name^="'+ _err.property +'"]')
                        .parent()
                        .append('<span id="err_hint" class="help-block" style="color:red">' + _err.message + '</span>');
                }
            } else {
                $('#modal').modal('hide');
                $('#comments_field').html(data.html);
            }
        }
    });
});

$('#modal').on('hidden.bs.modal', function(){
    $('#comment_form').find('input[name="parent"]').remove();
    $("span[id=err_hint]").remove();
});

