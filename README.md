prana
=====

Monitor your vital services with automated heartbeat checks.

Requirements:

* Python (tested with 2.6)
* redis server (tested with 2.2.8) -- `brew install redis`

Run these processes:

* `python index.py` (for flask server)
* `python lesswatch.py` (for LESS CSS minification)
* `rqworker` (for worker daemon)

To watch what's going into redis:

* `redis-cli monitor`
