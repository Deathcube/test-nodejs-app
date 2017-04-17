
$('#add_comment').on('click', function () {
    $.ajax({
        method: "GET",
        url: "/add_comment",
        success : function (data) {
            $('#modal_field').html(data);
            $('#modal').modal('show');
        }
    });
});

$('#send_form_comment').on('click', function () {

    $.ajax({
        method: "POST",
        url: "/add_comment",
        data: $('#comment_form').serialize(),
        success : function (data) {
            $('#comments_field').html(data);
            $('#modal').modal('hide');
        }
    });
});

$('.reply_comment').on('click', function () {
    $.ajax({
        method: "GET",
        url: "/reply_comment",
        data: {'parent':$(this).attr('id')},
        success : function (data) {
            $('#modal_field').html(data);
            $('#modal').modal('show');
        }
    });
});

$('#send_reply_comment').on('click', function () {
    $.ajax({
        method: "POST",
        url: "/reply_comment",
        data: $('#comment_form').serialize(),
        success : function (data) {
            $('#comments_field').html(data);
            $('#modal').modal('hide');
        }
    });
});