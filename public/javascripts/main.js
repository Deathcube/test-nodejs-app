
$('#add_comment').on('click', function () {
    $('#modal').modal('show');
});


$('#send_form_comment').on('click', function () {

    $.ajax({
        method: "POST",
        url: "/",
        data: $('#comment_form').serialize(),
        success : function (data) {
            $('#modal').modal('hide');
            console.log(data);
        }
    });
});