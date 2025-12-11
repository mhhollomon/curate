from peewee import SqliteDatabase, Model, CharField

db = SqliteDatabase(None)

class BaseModel(Model):
    class Meta:
        database = db


class dbArtist(BaseModel):
    id = CharField(primary_key=True)
    name = CharField()
    sort_name = CharField()

    class Meta:
        table_name = 'artist'

class dbTrack(BaseModel):
    id = CharField(primary_key=True)
    name = CharField()
    sort_name = CharField()
    path = CharField()
    digest = CharField()
    format = CharField()

    class Meta:
        table_name = 'track'

class dbAlbum(BaseModel):
    id = CharField(primary_key=True)
    name = CharField()
    sort_name = CharField()
    cover = CharField()

    class Meta:
        table_name = 'album'

class dbAlbumTrack(BaseModel):
    album = CharField()
    track = CharField()
    pos = CharField()

    class Meta:
        table_name = 'album_track'

class dbArtistAssociation(BaseModel):
    artist = CharField()
    item = CharField()
    type = CharField()

    class Meta:
        table_name = 'artist_association'