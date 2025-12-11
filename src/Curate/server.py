from flask import Flask, Response, send_file
import json

from .lib.database import db, dbAlbum, dbAlbumTrack, dbArtist, dbArtistAssociation, dbTrack

from peewee import JOIN

app = Flask(__name__)


@app.route('/api/artist', methods=['GET'])
def list_artists():
    with db.atomic() :
        # Retrieve the list of artists from the database
        artists = list(dbArtist.select().dicts())

    # Return the list of artists as JSON
    return Response(json.dumps(artists), mimetype='application/json')

@app.route('/api/artist/<artist_id>', methods=['GET'])
def get_artist_music(artist_id):

    music = []
    with db.atomic() :
        # Retrieve the artist's music from the database
        albums = list(dbArtistAssociation.select(dbArtistAssociation, dbAlbum).where(
            (dbArtistAssociation.kind == 'Album') & (dbArtistAssociation.artist == artist_id)
        ).join(dbAlbum, JOIN.LEFT_OUTER, on=(dbAlbum.id == dbArtistAssociation.item)
        ).dicts())

        if albums :
            music.extend(albums)

        singles = list(dbArtistAssociation.select(dbArtistAssociation, dbTrack.name, dbTrack.sort_name).where(
            (dbArtistAssociation.kind == 'Track') & (dbArtistAssociation.artist == artist_id)
        ).join(dbTrack, JOIN.LEFT_OUTER, on=(dbTrack.id == dbArtistAssociation.item)
        ).dicts())

        if singles :
            music.extend(singles)

    # Return the artist as JSON
    return Response(json.dumps(music), mimetype='application/json')

@app.route('/api/album', methods=['GET'])
def list_albums():
    with db.atomic() :
        # Retrieve the list of albums from the database
        albums = list(dbAlbum.select().dicts())

    # Return the list of albums as JSON
    return Response(json.dumps(albums), mimetype='application/json')

@app.route('/api/album/<album_id>', methods=['GET'])
def get_album_tracks(album_id):
    with db.atomic() :
        # Retrieve the album's tracks from the database
        tracks = list(dbAlbumTrack.select(dbAlbumTrack, dbTrack.name, dbTrack.sort_name).where(
            dbAlbumTrack.album == album_id
        ).join(dbTrack, JOIN.LEFT_OUTER, on=(dbTrack.id == dbAlbumTrack.track)
        ).order_by(dbAlbumTrack.pos).dicts())

    # Return the album as JSON
    return Response(json.dumps(tracks), mimetype='application/json')

if __name__ == '__main__':
    db.init('output/curate.db', pragmas={'foreign_keys': 1})
    app.run(port=9999, debug=True)