from flask import Flask


app = Flask(__name__)
app.config['REDIS_QUEUE_KEY'] = 'prana_queue'


class Settings(dict):
    __getattr__, __setattr__ = dict.get, dict.__setitem__


settings = Settings()
settings.REDIS_HOST = 'localhost'
settings.REDIS_PORT = 6379
settings.REDIS_DB = None
settings.REDIS_AUTH = None
