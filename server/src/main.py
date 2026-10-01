from .lib.database import db, dbAlbum, dbAlbumTrack, dbArtist, dbArtistAssociation, dbTrack
from playhouse.pydantic_utils import to_pydantic
from peewee import JOIN
from fastapi import FastAPI, Response
import json

db.init('output/curate.db', pragmas={'foreign_keys': 1})

app = FastAPI()

respArtist = to_pydantic(dbArtist)


@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.get('/api/artist',response_model=list[respArtist])
def list_artists() -> list[dbArtist]:
    with db.atomic() :
        # Retrieve the list of artists from the database
        artists = list(dbArtist.select())

    # Return the list of artists as JSON
    return artists

