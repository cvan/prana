(function() {
    var storage = Storage(),
        inMem = localStorage.getItem('responses');
    if (inMem) {
        var oldResponses = JSON.parse(inMem);
        $.each(oldResponses, function(index, value) {
            console.log(value.url, value.expected.status, value.actual.status);
            $('#responses').append(
                '<tr class="' + (value.expected.status == value.actual.status ? 'good' : 'bad') + '">' +
                '<td>' + value.url + '</td>' +
                '<td>status:' + value.expected.status + '</td>' +
                '<td>status:' + value.actual.status + '</td>' +
                '</tr>'
            );
        })
    }
    $('form').on('submit', function(e) {
        var $this = $(this),
            formData = $this.serializeArray(),
            url = $this.find('input[name=url]').val(),
            expectedStatus = $this.find('input[name=status]').val();
        console.log(formData);
        $this.find('button').attr('disabled', true);
        $.getJSON('/fetch', formData, function(data) {
            $this.find('button').removeAttr('disabled');
            // TODO: use escape_.
            // TODO: add timestamps.
            // TOOD: use pyquery.

            // TODO: make everything a string.
            data.status = data.status.toString();

            $('#responses').append(
                // TODO: check if everything is satisfied.
                '<tr class="' + (data.status == expectedStatus ? 'good' : 'bad') + '">' +
                '<td>' + url + '</td>' +
                '<td>' + expectedStatus + '</td>' +
                '<td>' + data.status + '</td>' +
                '</tr>'
            );
            var inMem = localStorage.getItem('responses'),
                oldResponses = inMem ? JSON.parse(inMem) : [];
            oldResponses.push({'url': url, 'expected': {'status': expectedStatus}, 'actual': {'status': data.status}});
            storage.set('responses', JSON.stringify(oldResponses));
        });
        e.preventDefault();
    });
})();

// todo: store in localstorage
