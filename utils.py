import datetime
import hashlib
import time

import requests
from redis import Redis
from rq import Queue, use_connection

try:
    from settings_local import *
except ImportError:
    from settings import *

redis = Redis(
    host=settings.REDIS_HOST,
    port=settings.REDIS_PORT,
    db=settings.REDIS_DB,
    password=settings.REDIS_PASSWORD
)
use_connection(redis)
q = Queue(connection=redis)


def _get_content_hash(content):
    return 'sha256:%s' % hashlib.sha256(content).hexdigest()


def fetch(**kw):
    # If not enough time has elapsed or page is unchanged, add back to queue.
    # If could not successfully email or phone, add back to queue.
    print '[%s:%s] Fetching ...' % (datetime.datetime.now(),
        datetime.datetime.fromtimestamp(kw['retry_after']))
    url = kw['url']
    to_email = kw.get('email', [])
    to_phone = kw.get('phone', [])
    interval = kw['interval']
    initial_response = kw.get('initial_response')
    retry_after = kw['retry_after']

    retry = True
    ready = datetime.datetime.now() >= datetime.datetime.fromtimestamp(kw['retry_after'])

    if ready:
        response = None
        try:
            response = _get_content_hash(requests.get(url).content)
        except Exception as e:
            raise
            retry = False

        if response is not None:
            if initial_response is None:
                kw['initial_response'] = initial_response = response

            if response != initial_response:
                for email in to_email:
                    # TODO: Implement emailing.
                    print '- Emailing %s for %s' % (email, url)
                for phone in to_phone:
                    # TODO: Implement texting.
                    print '- Calling %s for %s' % (phone, url)

                retry = False
            else:
                print '- Content is still the same'

        if retry:
            retry_after = (datetime.datetime.now() +
                           datetime.timedelta(milliseconds=interval))
            retry_after = float(retry_after.strftime('%s.%f'))
            kw['retry_after'] = retry_after

    if retry:
        q.enqueue(fetch, **kw)
