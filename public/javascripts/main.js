
$('#fields').on('click', '.add_comment', function () {
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

    $.ajax({
        method: "POST",
        url: "/",
        data: fields,
        success : function (data) {
            $('#modal').modal('hide');
            $('#comments_field').html(data);
        }
    });
});

$('#modal').on('hidden.bs.modal', function(){
    $('#comment_form').find('input[name="parent"]').remove();
});

