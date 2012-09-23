import datetime

import redis
import requests

from flask import Flask, jsonify, render_template, request

try:
    from settings_local import *
except ImportError:
    from settings import *

from queue.decorators import *


@queuefunc
def fetch(**kw):
    # If not enough time has elapsed, add back to queue.
    # If page has not changed, add back to queue.
    # If could not successfully email or phone, add back to queue. (?)
    print 'Fetching ... %s > %s ' % (datetime.datetime.now(), datetime.datetime.fromtimestamp(kw['retry_after']))
    url = kw['url']
    to_email = kw.get('email', [])
    to_phone = kw.get('phone', [])
    interval = kw['interval']
    if datetime.datetime.now() >= datetime.datetime.fromtimestamp(kw['retry_after']):
        changed = False
        print ' - Enough time elapsed'
        if changed:
            for email in to_email:
                print '- emailing %s for %s' % (email, url)
            for phone in to_phone:
                print '- calling %s for %s' % (phone, url)
        else:
            retry = True
    else:
        retry = True
        print ' - Not enough time elapsed'

    if retry:
        retry_after = (datetime.datetime.now() +
                       datetime.timedelta(milliseconds=interval))
        retry_after = float(retry_after.strftime('%s.%f'))
        fetch.delay(url=url, email=to_email, phone=to_phone, interval=interval,
                    retry_after=retry_after)
    return True


@app.route('/')
def home():
    return render_template('home.html')


@app.route('/notify', methods=['GET', 'POST'])
def notify():
    # TODO: Key on URL and frequency, so we don't make duplicate requests.
    to_email = []
    to_phone = []

    url = request.form.get('url', '')
    # TODO: Set maximum number of recipients.
    recipients = request.form.get('to', '').split(',')
    try:
        interval_number = int(request.form.get('frequency_number', 0))
        interval_unit = int(request.form.get('frequency_unit', 0))
        interval = interval_number * interval_unit
    except ValueError:
        interval = 5 * 60  # 5 minutes

    for to in recipients:
        to = to.strip()
        if to:
            if '@' in to:
                to_email.append(to)
            else:
                to_phone.append(''.join(filter(lambda x: x.isdigit(), to)))

    retry_after = float(datetime.datetime.now().strftime('%s.%f'))

    fetch.delay(url=url, email=to_email, phone=to_phone, interval=interval,
                retry_after=retry_after)

    return jsonify({
        'success': True
    })


# TODO: Ratelimit.
# TODO: Limit to X pages per IP address.
# TODO: Limit to X pages per recipient.
# TODO: Limit to X pages per X time.
# @app.route('/fetch', methods=['GET', 'POST'])
# def fetch():
#     url = request.args.get('url', '')
#     content, headers, status = '', {}, 0
#     try:
#         req = requests.get(url)
#         content = req.content
#         headers = req.headers
#         status = req.status_code
#     except Exception, e:
#         content = e
#     return jsonify({
#         'content': content,
#         'headers': headers,
#         'status': status
#     })


if __name__ == '__main__':
    app.run(debug=True, port=3000)
