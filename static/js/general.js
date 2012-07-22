(function() {
    function done(data) {
        var ts = new Date(),
            $form = $('form'),
            url = $form.find('input[name=url]').val(),
            expectedStatus = $form.find('[name=status]').val();
        $form.find('button').removeAttr('disabled');
        // TODO: use escape_.
        // TODO: live update the timestamps.
        // TOOD: use pyquery.

        // TODO: make everything a string.
        data.status = data.status.toString();

        var frequencyNum = parseInt($form.find('[name=frequency_number]').val(), 10),
            frequencyUnit = parseInt($form.find('[name=frequency_unit]').val(), 10),
            frequency = frequencyNum * frequencyUnit;

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
            'frequency': frequency,
            'form': $form.serializeArray()
        });
        storage.set('responses', JSON.stringify(oldResponses));
    }

    var storage = Storage(),
        inMem = localStorage.getItem('responses'),
        pool = WorkerPool(3);

    if (inMem) {
        var oldResponses = JSON.parse(inMem);
        $.each(oldResponses, function(index, value) {
            var ts = new Date(Date.parse(value.timestamp));
            $('#responses').append(
                '<tr class="' + (value.expected.status == value.actual.status ? 'good' : 'bad') + '">' +
                '<td>' + value.url + '</td>' +
                '<td>' + value.expected.status + '</td>' +
                '<td>' + value.actual.status + '</td>' +
                    '<td><time datetime="' + ts.toISOString() + '" title="' + ts.toString() + '">' +
                        humaneDate(ts) +
                    '</time></td>' +
                '<td>' + (value.expected.status == value.actual.status ? 'Good' : 'Bad') + '</td>' +
                '<td></td>' +
                '<td></td>' +
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
    }).trigger('change');

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
    }).trigger('change');

    if ($('input[name=url]').val()) {
        $('form').find('button').removeAttr('disabled');
    }

    $('form').on('submit', function(e) {
        e.preventDefault();
        var $this = $(this),
            formData = $this.serialize(),
            url = $this.find('input[name=url]').val(),
            expectedStatus = $this.find('[name=status]').val(),
            frequencyNum = parseInt($this.find('[name=frequency_number]').val(), 10),
            frequencyUnit = parseInt($this.find('[name=frequency_unit]').val(), 10),
            frequency = frequencyNum * frequencyUnit;
        $this.find('button').attr('disabled', true);
        if ($('input[name=url]').val()) {
            // TODO: First add row, then show status w/ throbber!
            //pool.queueJob('/static/js/task.js', {'frequency': frequency, 'data': formData}, function(msg) {
            //    done(JSON.parse(msg));
            //});
            var data = {'frequency': frequency, 'data': formData};
            // The XHR could take longer than the interval to complete so
            // `setInterval` is out of the question.
            var timeoutID, request;
            (function loop($) {
                timeoutID = setTimeout(function() {
                    if (!$('.paused').length) {
                        request = new XMLHttpRequest();
                        request.open('GET', '/fetch?' + data.data, false);
                        request.send();
                        done(JSON.parse(request.responseText));
                        if (request.status !== 200) {
                            clearInterval(intVal);
                            return;
                        }
                    }
                    // Recurse.
                    loop($);
                }, data.frequency);
            })($);
        }
        return;
    });

    var $btns = $('header .button');
    $btns.on('click', function(e) {
        e.preventDefault();
        var $this = $(this),
            cls = null;
        if ($this.hasClass('good')) {
            cls = 'good';
        } else if ($this.hasClass('bad')) {
            cls = 'bad';
        }
        $btns.removeClass('selected');
        $this.addClass('selected');
        $('#responses').attr('class', cls);
    });

    var $navBtns = $('nav a');
    $navBtns.on('click', function(e) {
        e.preventDefault();
        var $this = $(this),
            cls = null;
        if ($this.hasClass('paused')) {
            $this.removeClass('paused');
        } else if ($this.hasClass('pause')) {
            $this.addClass('paused');
        } else {
            $navBtns.removeClass('selected');
            $this.addClass('selected');
        }
    });


    // TODO: keep track of crap in a queue.
    // TODO: list when is next item.

    // TODO: Consider storing the entire contents of responses.
    // TODO: Change <title> when a failure!
    // TODO: Add ability to clear notifications, empty queue (or edit/delete one), empty logs (or delete one).
    // TODO: Add field for comments/name.
    // TODO: Add ability to stop after X number of failures.
    // TODO: Add timeouts!
    // TODO: Handle UnicodeDecodeErrors in requests responses.
    // TODO: Add ability to follow or not follow redirects.
    // TODO: Live update timestamps.

    // TODO: Add ability to export to JSON, CSV, or share with a friend.

    // TODO(important): Notify me when [SUCCEEDS] or [FAILS].
    // TODO: Check that URL is well formed.
})();
