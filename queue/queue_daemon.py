from marshal import dumps, loads
#from pickle import dumps, loads

import time
import types

from index import *


def queue_daemon(rv_ttl=500):
    # Priority queue.
    while True:
        _, msg  = redis.blpop(app.config['REDIS_QUEUE_KEY'])
        func, key, args, kwargs = loads(msg)
        func = types.FunctionType(func, globals())
        try:
            rv = func(*args, **kwargs)
        except Exception, e:
            rv = str(e)
        if rv is not None:
            redis.set(key, dumps(rv))
            redis.expire(key, rv_ttl)
        print 'Checking ...'
        #time.sleep(1)
