import requests

from flask import Flask, jsonify, render_template, request

app = Flask(__name__)


@app.route('/')
def home():
    return render_template('home.html')


@app.route('/notify', methods=['GET', 'POST'])
def notify():
    to_email = []
    to_sms = []
    recipients = request.args.get('to', '').split(',')
    for to in recipients:
        to = to.strip()
        if to:
            if '@' in to:
                to_email.append(to)
            else:
                to_sms.append(''.join(filter(lambda x: x.isdigit(), to)))
    for email in to_email:
        print 'emailed %s' % email
    for sms in to_sms:
        print 'texted %s' % sms
    return jsonify({
        'success': True
    })


# TODO: Ratelimit.
# TODO: Limit to X pages per IP address.
# TODO: Limit to X pages per recipient.
# TODO: Limit to X pages per X time.
@app.route('/fetch', methods=['GET', 'POST'])
def fetch():
    url = request.args.get('url', '')
    content, headers, status = '', {}, 0
    try:
        req = requests.get(url)
        content = req.content
        headers = req.headers
        status = req.status_code
    except Exception, e:
        content = e
    return jsonify({
        'content': content,
        'headers': headers,
        'status': status
    })


if __name__ == '__main__':
    app.run(debug=True, port=3000)
