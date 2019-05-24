// Client-side Triggers

$('#btnPlay').on('click', function() {
    let name = $("#inputChatName").val();
    $("#inputChatName").hide();
    moon.player = name;
    //moon.updateInfo();
    moon.state = moon.roomreq;
    console.log('Proceeding to roomreq state..');
    $('#btnPlay').hide();
    $('#gfx').show();
});
