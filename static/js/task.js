self.onmessage = function(event) {
    var request = new XMLHttpRequest();
    request.open('GET', '/fetch?' + event.data, false);
    request.send();
    self.postMessage(request.responseText);
};
