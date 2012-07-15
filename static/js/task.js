self.onmessage = function(event) {
    var data = event.data;
    // The XHR could take longer than the interval to complete so
    // `setInterval` is out of the question.
    var timeoutID, request;
    (function loop() {
        timeoutID = setTimeout(function() {
            request = new XMLHttpRequest();
            request.open('GET', '/fetch?' + data.data, false);
            request.send();
            self.postMessage(request.responseText);
            if (request.status !== 200) {
                clearInterval(intVal);
                return;
            }

            // Recurse.
            loop();
        }, data.frequency);
    })();
};
