from flask import Flask, Response, send_file
from peewee import Database

app = Flask(__name__)
db = Database('your_database_uri')

@app.route('/stream')
def stream():
    # Retrieve the music file from the database
    music_file = db.get('SELECT * FROM music WHERE id = 1').music_file

    # Stream the music file
    return Response(music_file, mimetype='audio/mpeg')

@app.route('/')
def index():
    return send_file('index.html')

if __name__ == '__main__':
    app.run()