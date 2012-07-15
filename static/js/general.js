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
            $hidden.attr('name', $select.attr('name')).show().focus();
            $select.attr('data-old-name', $select.attr('name')).removeAttr('name');
        } else {
            $select.attr('name', $select.data('old-name')).show().focus();
            $hidden.removeAttr('name').hide();
        }
    });

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
