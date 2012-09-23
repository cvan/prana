from marshal import dumps
#from pickle import dumps
import uuid

import redis

from flask import current_app

try:
    from settings_local import *
except ImportError:
    from settings import *

redis = redis.Redis(
    host=settings.REDIS_HOST,
    port=settings.REDIS_PORT,
    db=settings.REDIS_DB,
    password=settings.REDIS_PASSWORD
)


class DelayedResult(object):

    def __init__(self, key):
        self.key = key
        self._rv = None

    @property
    def return_value(self):
        if self._rv is None:
            rv = redis.get(self.key)
            if rv is not None:
                self._rv = loads(rv)
        return self._rv


def queuefunc(f):
    def delay(*args, **kwargs):
        qkey = current_app.config['REDIS_QUEUE_KEY']
        #key = '%s:result:%s' % (qkey, str(uuid.uuid4()))
        key = '%s:result' % qkey
        #s = dumps((f, key, args, kwargs))
        s = dumps((f.func_code, key, args, kwargs))
        redis.rpush(current_app.config['REDIS_QUEUE_KEY'], s)
        print 'Queued ...'
        return DelayedResult(key)
    f.delay = delay
    return f
