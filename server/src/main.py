import os
import subprocess
from typing import Annotated
from pathlib import Path

from .lib.database import db, dbAlbum, dbAlbumTrack, dbArtist, dbArtistAssociation, dbTrack
from playhouse.pydantic_utils import to_pydantic
from fastapi import FastAPI, HTTPException, Header
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

TOP_LEVEL = Path("/mnt/music/Bandcamp/")
FFMPEG = "/usr/bin/ffmpeg"
CACHE = Path("./cache/")

os.makedirs(CACHE, exist_ok=True)

db.init('output/curate.db', pragmas={'foreign_keys': 1})

app = FastAPI()


class pyAlbum(to_pydantic(dbAlbum)):
    pass

class pyArtist(to_pydantic(dbArtist)):
    pass

class pyTrack(to_pydantic(dbTrack)):
    pass

class respAlbumTrack(BaseModel) :
    id : str
    name : str
    sort_name : str
    format : str
    position : int

#
# Response rturned when getting a list artists.
# This is one artist in the list.
#
respArtistItem = to_pydantic(dbArtist)


#
# Response returned when getting a list of albums.
# This is one album in that list.
#

class respAlbumItem(pyAlbum) :
    artist_id : str
    artist_name : str


#
# Response returned when asking for a single album.
# Contains the artist and tracks as well as the album info.
#
class respAlbumTracks(BaseModel) :
    album : pyAlbum
    artist : pyArtist
    tracks : list[respAlbumTrack]


@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.get('/api/artist',response_model=list[respArtistItem])
def list_artists() -> list[dbArtist]:
    with db.atomic() :
        # Retrieve the list of artists from the database
        artists = list(dbArtist.select())

    # Return the list of artists as JSON
    return artists


@app.get('/api/album', response_model=list[respAlbumItem])
def list_albums():
    with db.atomic() :
        # Retrieve the list of albums from the database

        albums_list = list(dbAlbum.select(
            dbAlbum,
            dbArtist.id.alias('artist_id'),
            dbArtist.name.alias('artist_name')).join(
            dbArtistAssociation, on=(dbArtistAssociation.item == dbAlbum.id)
        ).join(
            dbArtist, on=(dbArtist.id == dbArtistAssociation.artist)
        ).dicts())

    # Return the list of albums as JSON
    return albums_list


@app.get('/api/album/{album_id}', )
def get_album_tracks(album_id : str) -> respAlbumTracks :
    try :
        with db.atomic() :
            # Try to get the album first
            # so we get an error if it is an invalid id
            #
            album = dbAlbum.select().where(dbAlbum.id == album_id).get()

            artist = dbArtist.select(
            ).join(dbArtistAssociation, on=((dbArtist.id == dbArtistAssociation.artist) &
                                            (dbArtistAssociation.item == album_id))
                    ).get()

            tracks = dbTrack.select(dbTrack, dbAlbumTrack.pos.alias('position')
                        ).join(
                            dbAlbumTrack,
                            on=((dbAlbumTrack.track == dbTrack.id) &
                                (dbAlbumTrack.album == album_id))
                        ).order_by(dbAlbumTrack.pos.asc()).dicts()
    except dbAlbum.DoesNotExist : # type: ignore
        raise HTTPException(status_code=404, detail="Item not found")


    return respAlbumTracks(album=album, artist=artist, tracks=list(tracks)) # type: ignore

def stream_track(path : Path | str, start_byte : int = 0) :
    with open(file=path, mode='br') as f :
        if start_byte > 0 :
            f.seek(start_byte)
        yield from f

# ffmpeg -i sound1.wav -dash 1 sound1.webm

@app.get('/api/play/{track_id}')
def play_track(track_id : str, range : Annotated[str | None, Header()] = None) :
    try :
        with db.atomic() :
            track = dbTrack.select().where(dbTrack.id == track_id).get()
    except dbTrack.DoesNotExist : # type: ignore
        raise HTTPException(status_code=404, detail="Track not found")

    content_type = f"audio/{track.format}"
    full_path = TOP_LEVEL / track.path

    cache_path = CACHE / f"{track_id}.webm"
    if not cache_path.exists() :
        subprocess.run([FFMPEG, "-i", str(full_path), '-dash', '1', str(cache_path)] )


    file_size = os.path.getsize(cache_path)

    print(f"--- range = {range}")
    if range :
        # Range will look like `bytes=<start>-<stop?>`
        start_byte = int(range[6:].split('-', 2)[0])

    print(f"--- content_type = {content_type}, file_size = {file_size}, path = {str(cache_path)}")
    return StreamingResponse(stream_track(cache_path), media_type="audio/webm",
                             headers={'Content-Length' : str(file_size), 'Accept-Ranges' : 'bytes'})