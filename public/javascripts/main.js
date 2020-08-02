var socket = io();

// Hide the address bar on iphone safari
window.addEventListener("load", function() {
    setTimeout(function() {
	window.scrollTo(0,0);
    }, 0);
});

let width = $(window).width();
let height = $(window).height();
$('#maintop').width(width);
$('#maintop').height(height);
$('#inputChatName').css("left", width/2 - 200);
$('#inputChatName').css("top", height/2 - 50);
for (let i=0; i<3; i++) {
    $('#btnRoom' + i).css("left", width/2 - 45 - 210 + 210*i);
    //$('#btnRoom' + i).css("top", height/2 - 50 + 70);
    $('#btnRoom' + i).css("top", 70);
}
//let moonClass = import('javascripts/moon')
let moon = new moonClass()
console.log('Welcome to MOON')
moon.init(
    socket,
)
moon.start()
