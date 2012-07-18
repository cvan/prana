#!/usr/bin/env python
"""
lesswatch.py - recompile LESS (CSS) files on the fly.
(mad props: https://github.com/mozilla/zamboni/blob/master/scripts/lesswatch.py)
"""

import glob
import os
import re
import time


LESS_BIN = 'lessc'
MEDIA_PATH = 'static/**/*.less'
SLEEP_FOR = 0
NOISY = True

towatch = []
includes = {}
relative_dir = lambda f: os.path.dirname(os.path.dirname(os.path.abspath(f)))
touched_files = lambda: set((f, os.stat(f).st_mtime) for f in towatch)


def say(s):
    if NOISY:
        print '[%s] %s' % (time.strftime('%X'), s)


def recompile(files):
    for f in files:
        os.system('%s %s %s.css' % (LESS_BIN, f, f))
        deps = includes.get(f)
        if deps:
            say('re-compiling %d dependencies' % len(deps))
            recompile(deps)
    say('re-compiled %d files' % len(files))


def watch():
    say('watching %d files...' % len(towatch))
    before = touched_files()
    while 1:
        after = touched_files()
        changed = [f for (f, d) in before - after]
        if changed:
            recompile(changed)
        before = after
        time.sleep(SLEEP_FOR)


if __name__ == '__main__':
    # Determine the filenames of all the LESS files and their dependencies.
    for f in glob.glob(MEDIA_PATH):
        m = re.search('@import (.+);', open(f).read())
        if m:
            incl = relative_dir(f) + '/' + m.group(1).strip('"').strip("'").strip()
            includes.setdefault(incl, []).append(f)
        towatch.append(f)

    # Let's roll.
    watch()
