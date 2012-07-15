import requests

from flask import Flask, jsonify, render_template, request

app = Flask(__name__)


@app.route('/')
def home():
    return render_template('home.html')


# TODO: Ratelimit.
@app.route('/fetch', methods=['GET', 'POST'])
def fetch():
    url = request.args.get('url', '')
    content, headers, status = '', {}, 0
    try:
        req = requests.get(url)
        content, headers, status = req.content, req.headers, req.status_code
    except Exception, e:
        content = e
    return jsonify({'content': content, 'headers': headers, 'status': status})


if __name__ == '__main__':
    app.run(debug=True)
