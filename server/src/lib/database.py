from peewee import FloatField, SqliteDatabase, Model, CharField, TextField, IntegerField

db = SqliteDatabase(None)

class BaseModel(Model):
    class Meta:
        database = db

class dbUser(BaseModel):
    id = CharField(primary_key=True)
    hash = CharField()

    class Meta :
        table_name = 'user'


class dbArtist(BaseModel):
    id = CharField(primary_key=True)
    name = CharField(index=True)
    sort_name = CharField()

    class Meta:
        table_name = 'artist'

class dbTrack(BaseModel):
    id = CharField(primary_key=True)
    name = CharField(index=True)
    sort_name = CharField()
    path = TextField()
    format = CharField()
    digest = CharField()
    duration = FloatField()

    class Meta:
        table_name = 'track'

class dbAlbum(BaseModel):
    id = CharField(primary_key=True)
    digest = CharField()
    name = CharField(index=True)
    sort_name = CharField()
    cover = CharField(null=True)

    class Meta:
        table_name = 'album'

class dbAlbumTrack(BaseModel):
    album = CharField(index=True)
    track = CharField()
    pos   = IntegerField()

    class Meta:
        table_name = 'album_track'

class dbArtistAssociation(BaseModel):
    artist = CharField(index=True)
    item   = CharField(index=True)
    kind   = CharField()

    class Meta:
        table_name = 'artist_association'

class dbCover(BaseModel):
    id  = CharField(primary_key=True)
    path = TextField()

    class Meta:
        table_name = 'cover'