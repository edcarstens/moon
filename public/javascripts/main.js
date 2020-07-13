var socket = io();

// Hide the address bar on iphone safari
window.addEventListener("load", function() {
    setTimeout(function() {
	window.scrollTo(0,0);
    }, 0);
});
