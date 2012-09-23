import datetime

import requests
from redis import Redis
from rq import Queue, use_connection

from flask import Flask, jsonify, render_template, request

try:
    from settings_local import *
except ImportError:
    from settings import *

from utils import fetch

redis = Redis(
    host=settings.REDIS_HOST,
    port=settings.REDIS_PORT,
    db=settings.REDIS_DB,
    password=settings.REDIS_PASSWORD
)
use_connection(redis)
q = Queue(connection=redis)


@app.route('/')
def home():
    return render_template('home.html')


# TODO: Ratelimit.
# TODO: Limit to X pages per IP address.
# TODO: Limit to X pages per recipient.
# TODO: Limit to X pages per X time.
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
    except (KeyError, ValueError):
        interval = 5 * 60  # 5 minutes

    for to in recipients:
        to = to.strip()
        if to:
            if '@' in to:
                to_email.append(to)
            else:
                to_phone.append(''.join(filter(lambda x: x.isdigit(), to)))

    retry_after = float(datetime.datetime.now().strftime('%s.%f'))

    if url:
        q.enqueue(fetch, url=url, email=to_email, phone=to_phone, interval=interval,
                                retry_after=retry_after)

    return jsonify({
        'success': True
    })


if __name__ == '__main__':
    app.run(debug=True, port=3000)
