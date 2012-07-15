// Web Worker Pool.
// size: the max number of arguments.
function WorkerPool(size) {
    var workers = 0,
        jobs = [];

    // url: the URL of the worker script.
    // msg: the initial message to pass to the worker.
    // cb:  the callback to recieve messages from postMessage.
    //      return true from cb to dismiss the worker and advance the queue.
    // ctx: the context for cb.apply.
    this.queueJob = function(url, msg, cb, ctx) {
        var job = {
            'url': url,
            'msg': msg,
            'cb': cb,
            'ctx': ctx
        };
        jobs.push(job);
        if (workers < size) {
            nextJob();
        }
    };

    function nextJob() {
        if (jobs.length) {
            (function() {
                var job = jobs.shift(),
                    worker = new Worker(job.url);
                workers++;
                worker.addEventListener('message', function(e) {
                    if (job.cb.call(job.ctx, e.data, worker)) {
                        worker.terminate();
                        delete worker;
                        workers--;
                        nextJob();
                    };
                }, false);
                worker.postMessage(job.msg);
            })();
        }
    }

    return this;
}
