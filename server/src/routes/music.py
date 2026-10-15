from pathlib import Path
import subprocess
from typing import Annotated

from ..lib.file_stream import stream_file

from ..lib.config import get_config, get_required_config

from ..lib.login import login_manager

from fastapi import APIRouter, Depends, HTTPException, Header, Response

from ..lib.database import (db, dbAlbum, dbAlbumTrack,
                           dbArtist, dbArtistAssociation, dbTrack,
                           dbCover)

from pydantic import BaseModel
from playhouse.pydantic_utils import to_pydantic

MUSIC_DIRECTORY = Path(get_required_config('MUSIC_DIRECTORY'))
FFMPEG = get_config('FFMPEG_PATH', "/usr/bin/ffmpeg")
CACHE_PATH = Path(get_config('CACHE_PATH', "./cache/"))
DB_FILE = get_required_config("DB_FILE")

print(f"""--- CONFIG ---
MUSIC_DIRECTORY = {MUSIC_DIRECTORY}
FFMPEG = {FFMPEG}
CACHE_PATH = {CACHE_PATH}
DB_FILE = {DB_FILE}
""")



music_router = APIRouter(dependencies=[Depends(login_manager)])


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
# Response returned when getting a list of artists.
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
    artist_sort_name : str


#
# Response returned when asking for a single album.
# Contains the artist and tracks as well as the album info.
#
class respAlbumTracks(BaseModel) :
    album : pyAlbum
    artist : pyArtist
    tracks : list[respAlbumTrack]

#########################################
# ROUTES
#########################################

@music_router.get('/artist', response_model=list[respArtistItem])
def list_artists() -> list[dbArtist]:
    with db.atomic() :
        # Retrieve the list of artists from the database
        artists = list(dbArtist.select().order_by(dbArtist.sort_name))

    # Return the list of artists as JSON
    return artists

@music_router.get('/album', response_model=list[respAlbumItem])
def list_albums():
    with db.atomic() :
        # Retrieve the list of albums from the database

        albums_list = list(dbAlbum.select(
            dbAlbum,
            dbArtist.id.alias('artist_id'),
            dbArtist.name.alias('artist_name'),
            dbArtist.sort_name.alias('artist_sort_name')).join(
            dbArtistAssociation, on=(dbArtistAssociation.item == dbAlbum.id)
        ).join(
            dbArtist, on=(dbArtist.id == dbArtistAssociation.artist)
        ).order_by(dbAlbum.sort_name).dicts())

    # Return the list of albums as JSON
    return albums_list

@music_router.get('/album/{album_id}', )
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

# ffmpeg -i sound1.wav -dash 1 -v fatal sound1.webm

CONVERTABLE_TYPES = ['wav']

@music_router.get('/play/{track_id}', dependencies=[Depends(login_manager)], )
def play_track(track_id : str, range : Annotated[str | None, Header()] = None) :
    try :
        with db.atomic() :
            track = dbTrack.select().where(dbTrack.id == track_id).get()
    except dbTrack.DoesNotExist : # type: ignore
        raise HTTPException(status_code=404, detail="Track not found")

    content_type = f"audio/{track.format}"
    full_path = MUSIC_DIRECTORY / track.path

    stream_path = full_path

    if track.format in CONVERTABLE_TYPES :
        # be sure to put the extension on it.
        cache_path = CACHE_PATH / f"{track_id}.webm"
        if not cache_path.exists() :
            subprocess.run([FFMPEG, "-i", str(full_path), '-dash', '1', '-v', 'fatal', str(cache_path)] )

        stream_path = cache_path

    return stream_file(stream_path, range_header=range, headers={'Accept-Ranges' : 'bytes'})

@music_router.get('/cover/{ctype}/{cover_id}', dependencies=[Depends(login_manager)], )
def get_cover(ctype : str, cover_id : str) :
    ctype = ctype.lower()

    if ctype not in ('full', 'thumb') :
        raise HTTPException(status_code=404, detail="invalid type")
    try :
        with db.atomic() :
            cover = dbCover.select().where(dbCover.id == cover_id).get()
    except dbCover.DoesNotExist : # type: ignore
        raise HTTPException(status_code=404, detail="image not found")

    src_path = MUSIC_DIRECTORY / cover.path
    cache_path = CACHE_PATH / ctype / f"{cover_id}.webp"

    if not cache_path.exists() :
        from PIL import Image
        img = Image.open(src_path)
        size = (30, 30) if ctype == 'thumb' else (300, 300)
        img.thumbnail(size)
        img.save(str(cache_path))

    print(f"--cover cache path = {cache_path}")

    return stream_file(cache_path)

