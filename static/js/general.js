(function() {
    var storage = Storage(),
        inMem = localStorage.getItem('responses');
    if (inMem) {
        var oldResponses = JSON.parse(inMem);
        $.each(oldResponses, function(index, value) {
            var ts = new Date(Date.parse(value.timestamp));
            $('#responses').append(
                '<tr class="' + (value.expected.status == value.actual.status ? 'good' : 'bad') + '">' +
                '<td>' + value.url + '</td>' +
                '<td>status:' + value.expected.status + '</td>' +
                '<td>status:' + value.actual.status + '</td>' +
                    '<td><time datetime="' + ts.toISOString() + '" title="' + ts.toString() + '">' +
                        humaneDate(ts) +
                    '</time></td>' +
                '</tr>'
            );
        })
    }

    // Because grammar matters.
    $('input[name=frequency_number]').on('change keyup paste', function() {
        var $this = $(this),
            val = parseInt($this.val(), 10),
            cls = val == 1 ? 'singular' : 'plural',
            $units = $('select[name=frequency_unit]');
        if (!$units.hasClass(cls)) {
            $units.find('option').each(function(index, value) {
                var $option = $(value);
                $option.text($option.data(cls));
            });
            $units.attr('class', cls);
        }
    });

    // Expose input fields for custom values.
    $('select').on('change keyup', function() {
        var $select = $(this),
            $hidden = $select.siblings('input.custom');
        if ($select.val() == '[custom]') {
            $select.attr('data-old-name', $select.attr('name')).removeAttr('name');
            $hidden.attr('name', $select.attr('name')).show().focus();
            $hidden.siblings('.custom').show();
        } else {
            $select.attr('name', $select.data('old-name')).show();
            $select.siblings('input.matches').focus();
            $hidden.removeAttr('name').hide();
            $hidden.siblings('.custom').hide();
        }
    });

    // TODO: keep track of crap in a queue.
    // TODO: list when is next item.

    $('form').on('submit', function(e) {
        var $this = $(this),
            formData = $this.serializeArray(),
            url = $this.find('input[name=url]').val(),
            expectedStatus = $this.find('[name=status]').val();
        $this.find('button').attr('disabled', true);
        if (!$('input[name=url]').val()) {
            return;
        }
        console.log(formData);

        // TODO: First add row, then show status w/ throbber!

        $.getJSON('/fetch', formData, function(data) {
            var ts = new Date();
            $this.find('button').removeAttr('disabled');
            // TODO: use escape_.
            // TODO: live update the timestamps.
            // TOOD: use pyquery.

            // TODO: make everything a string.
            data.status = data.status.toString();

            $('#responses').prepend(
                // TODO: check if everything is satisfied.
                '<tr class="' + (data.status == expectedStatus ? 'good' : 'bad') + '">' +
                    '<td>' + url + '</td>' +
                    '<td>' + expectedStatus + '</td>' +
                    '<td>' + data.status + '</td>' +
                    '<td><time datetime="' + ts.toISOString() + '" title="' + ts.toString() + '">' +
                        humaneDate(ts) +
                    '</time></td>' +
                '</tr>'
            );

            // TODO: support indexedDB.
            var inMem = localStorage.getItem('responses'),
                oldResponses = inMem ? JSON.parse(inMem) : [];
            // Prepend so items are in descending order by timestamp.
            oldResponses.unshift({
                'url': url,
                'timestamp': ts,
                'expected': {'status': expectedStatus},
                'actual': {'status': data.status},
            });
            storage.set('responses', JSON.stringify(oldResponses));
        });
        e.preventDefault();
    });

    // TODO: Change <title> when a failure!
    // TODO: Add ability to clear notifications, empty queue, empty logs.
    // TODO: Add field for comments/name.
    // TODO: Add ability to stop after X number of failures.
    // TODO: Add timeouts!
    // TODO: Handle UnicodeDecodeErrors in requests responses.
    // TODO: Add ability to follow or not follow redirects.
})();
