from dataclasses import dataclass, field
from nanoid import generate
from pathlib import Path
from typing import Any, Dict, List, TypeVar
from .database import *

from enum import StrEnum, auto
from abc import ABC, abstractmethod

import hashlib


def get_id() -> str :
    """Generate a random ID string
    """
    return generate("23456789abcdefghijkmnpqrstuvwxyzABCDEFGHIJKMNPQRSTUVWXYZ",20)

def path_digest(path : Path | str) -> str:
    hash = hashlib.sha256()
    hash.update(str(path).encode())

    return hash.hexdigest()[0:16]


class RECSTAT(StrEnum) :
    # 'NEW'  - Picked up by the scan and didn't exist before.
    NEW = auto()

    # 'SEEN' - Picked up by the scan, but was already there.
    SEEN = auto()

    # 'OLD'  - There when we started, but didn't see it in the scan.
    OLD = auto()

    # 'MOD'  - There when we started but info has changed (but not id)
    MOD = auto()

class BaseClass(ABC) :
    def __init__(self, id : str | None = None, status : RECSTAT | None = None) -> None:
        self.id = id or get_id()
        self.status = status or RECSTAT.NEW


    @abstractmethod
    def to_db_dict(self) -> dict :
        ...

#################################################################
# Generic method to update records on the database
# That use the full NEW/OLD/MOD cycle.
#
INPUT_TYPE = TypeVar("INPUT_TYPE", bound=BaseClass)
def update_db(records : dict[str, INPUT_TYPE], type_name : str, db_clz : type) -> None :
    new_records = [{'id' : r.id, **r.to_db_dict()} for r in records.values() if r.status == RECSTAT.NEW]
    print(f"$$$$$ writing {len(new_records)} {type_name}")
    if new_records :
        with db.atomic() :
            db_clz.insert_many(new_records).execute()

    drop_records = [a.id for a in records.values() if a.status == RECSTAT.OLD ]
    print(f"$$$$$ dropping {len(drop_records)} {type_name}")
    if drop_records :
        with db.atomic() :
            db_clz.delete().where(db_clz.id.in_(drop_records)).execute()

    mod_records = [t for t in records.values() if t.status == RECSTAT.MOD ]
    print(f"$$$$$ updating {len(mod_records)} {type_name}")
    if mod_records :
        with db.atomic() :
            for r in mod_records :
                db_clz.update(r.to_db_dict()).where(db_clz.id == r.id).execute()

#################################################################

@dataclass
class MusicFile :
    path   : Path
    format : str # currently one of 'wav' or 'mp3'
    digest : str
    tags   : Dict[str, Any] | None = None

    def __eq__(self, value: object) -> bool:

        return (
            isinstance(value, MusicFile) and
            str(self.path) == str(value.path) and
            self.format == value.format and
            self.digest == value.digest
        )

class Track(BaseClass) :
    def __init__(self, file : MusicFile, name : str,
                 sort_name : str | None = None, id: str | None = None,
                 status: RECSTAT | None = None) -> None:

        super().__init__(id, status)

        self.file = file
        self.name = name
        self.sort_name = sort_name or name.lower()

    def same(self, other : Track) -> bool :
        if self.file != other.file :
            print(f"@@@ files are not the same")
        return (self.file == other.file and
            self.name == other.name and
            self.sort_name == other.sort_name
            )

    def to_db_dict(self) -> Dict:
        return {'name' : self.name,
                'sort_name' : self.sort_name,
                'path' : str(self.file.path),
                'format' : self.file.format,
                'digest' : self.file.digest}

    def __str__(self) -> str:
        return f"<track name={self.name} sort_name={self.sort_name}, path={self.file.path} format={self.file.format}, digest={self.file.digest}>"

class Cover(BaseClass):
    def __init__(self, path : Path, id: str | None = None, status: RECSTAT | None = None) -> None:
        super().__init__(id, status)
        self.path = path

    def same(self, other : Cover) -> bool :
        return str(self.path) == str(other.path)

    def to_db_dict(self) -> Dict:
        return { 'path' : str(self.path)}


@dataclass
class AlbumTrack :
    album : str # id
    track : str # id
    pos  : int

class Album(BaseClass) :
    def __init__(self, name : str,
                 digest : str,
                 sort_name : str | None = None,
                 cover : str | None = None,
                 id: str | None = None, status: RECSTAT | None = None) -> None:
        super().__init__(id, status)

        self.name = name
        self.sort_name = sort_name or name.lower()
        self.cover = cover
        self.digest = digest


    def add_track(self, track : Track, pos : int) :
        track = trackManager.add_track(track)
        albumTrackManager.add(AlbumTrack(self.id, track.id, pos))

    def same(self, other : Album) -> bool :
        return (
            self.name == other.name and
            self.sort_name == other.sort_name and
            self.cover == other.cover and
            self.digest == other.digest
        )

    def to_db_dict(self) -> Dict:
        return {'name' : self.name,
                'sort_name' : self.sort_name,
                'cover' : self.cover,
                'digest' : self.digest
                }
    def __str__(self) -> str :
        return f"<album id={self.id} name={self.name} sort_name={self.sort_name} digest={self.digest} cover={self.cover}>"


class Artist(BaseClass) :
    def __init__(self, name : str,
                 sort_name : str | None = None,
                 id: str | None = None, status: RECSTAT | None = None) -> None:
        super().__init__(id, status)

        self.name = name
        self.sort_name = sort_name or name.lower()

    def add_track(self, track : Track) :
        track = trackManager.add_track(track)
        artistAssocManager.add_association(self.id, track.id, 'Track')

    def add_album(self, album : Album) -> Album :
        album = albumManager.add_album(album)
        artistAssocManager.add_association(self.id, album.id, 'Album')
        return album

    def to_db_dict(self) -> dict :
        return {
            'name' : self.name,
            'sort_name' : self.sort_name
        }

@dataclass
class ArtistAssociation :
    artist : str # id
    music  : str # id ( could be album or track )
    kind   : str

class ArtistManager :
    def __init__(self) :
        self.byid : Dict[str, Artist]  = {} # by id
        self.names : Dict[str, Artist] = {} # by name

        # This id will not be generated by get_id()
        # If the alphabet changes, may need to tweak this.
        self._unknown_id =  '--unknown--'

    def load_existing(self) -> None :
        with db :
            existing = dbArtist.select()

        print(f"$$$$$ loading {len(existing)} artists")
        for e in existing :
            a = Artist(name=e.name, sort_name=e.sort_name, id=e.id, status=RECSTAT.OLD)
            self.byid[a.id] = a
            self.names[a.name] = a

        if self._unknown_id not in self.byid :
            self._unknown = Artist(self._unknown_id, self._unknown_id, id=self._unknown_id)
            self.byid[self._unknown_id] = self._unknown
            self.names[self._unknown_id] = self._unknown
        else :
            self._unknown = self.byid[self._unknown_id]
            self._unknown.status = RECSTAT.SEEN


    def update_db(self) -> None :
        update_db(self.byid, 'artists', dbArtist)

    def unknown(self) -> Artist :
        """Return the record of the `unknown` entity"""
        return self._unknown

    def add_artist(self, name : str, sort_name : str | None = None) -> Artist :
        """Add an artist of the given name and sort_name.
        If the artist name already exists, simply return the record
        params :
            name : artist's name (required)
            sort_name : string to use to sort. If not given, use the @name

        returns :
            Record of the artist.
        """
        sort_name = sort_name if sort_name else name.lower()
        if name in self.names :
            retval = self.names[name]
            if retval.status == RECSTAT.OLD :
                retval.status = RECSTAT.SEEN
            return retval


        artist = Artist(name, sort_name)
        self.byid[artist.id] = artist
        self.names[name] = artist
        print(f"$$$$$ Adding artist {name} ({artist.id} {artist.status})")

        return artist


    def __iter__(self) :
        return iter(sorted(self.byid.values(), key=lambda v: v.sort_name)) # type: ignore

class TrackManager :
    def __init__(self) -> None:
        self.byid   : Dict[str, Track] = {} # by id
        self.paths  : Dict[Path, Track] = {} # by name
        self.digest : Dict[str, Track] = {} # by name

    def load_existing(self) :
        with db :
            existing = dbTrack.select()

        print(f"$$$$$ loading {len(existing)} tracks")
        for e in existing :
            f = MusicFile(Path(e.path), e.format, e.digest)
            t = Track(id=e.id, file=f, name=e.name, sort_name=e.sort_name, status=RECSTAT.OLD)
            self.byid[t.id] = t
            self.paths[f.path] = t
            self.digest[e.digest] = t

    def update_db(self) -> None :
        update_db(self.byid, 'tracks', dbTrack)

    def _update_record(self, old : Track, new_track : Track) -> Track :
        new_status = RECSTAT.NEW if old.status == RECSTAT.NEW else RECSTAT.MOD

        if old.same(new_track) :
            if old.status == RECSTAT.OLD :
                old.status = RECSTAT.SEEN
            return old

        if new_status == RECSTAT.MOD :
            print(f"%%% Marking track as modified old={str(old)} -- new={str(new_track)}")

        new_track.id = old.id
        new_track.status = new_status

        self.byid[new_track.id] = new_track
        self.paths[new_track.file.path] = new_track
        self.digest[new_track.file.digest] = new_track

        return new_track

    def add_track(self, track : Track) -> Track :
        if track.file.path in self.paths :
            t = self.paths[track.file.path]
            t = self._update_record(t, track)
        elif track.file.digest in self.digest :
            t = self.digest[track.file.digest]
            t = self._update_record(t, track)
        else :
            t = track
            self.byid[t.id] = t
            self.paths[t.file.path] = t
            self.digest[t.file.digest] = t
            print(f"$$$$$ adding track {t.name} ({t.id})")

        return t



    def __iter__(self) :
        return iter(self.byid.values()) # type: ignore

class ArtistAssocManager :
    def __init__(self) -> None:
        self.data : List[ArtistAssociation] = []

    def load_existing(self) -> None :
        '''Do nothing. We replace everything later'''
        pass

    def add_association(self, artist_id : str, music_id : str, kind : str) -> None :
        self.data.append(ArtistAssociation(artist_id, music_id, kind))

    def update_db(self) -> None :

        new_records = [{'artist' : r.artist, 'item' : r.music, 'kind' : r.kind} for r in self.data]
        print(f"$$$$$ reloading {len(new_records)} artist associations")

        with db.atomic() :
            dbArtistAssociation.truncate_table()

            dbArtistAssociation.insert_many(new_records).execute()

class CoverManager :
    def __init__(self) -> None:
        self.byid : dict[str, Cover] = {}
        self.bypath : dict[Path, Cover] = {}

    def load_existing(self) -> None :
        with db :
            existing = dbCover.select()

        print(f"$$$$$ loading {len(existing)} tracks")
        for e in existing :
            r = Cover(path = Path(e.path), id=e.id, status=RECSTAT.OLD)
            self.byid[r.id] = r
            self.bypath[r.path] = r

    def add_cover(self, cover : Cover) -> Cover :
        if cover.path in self.bypath :
            r = self.bypath[cover.path]
            if r.status == RECSTAT.OLD :
                r.status = RECSTAT.SEEN
            return r

        self.byid[cover.id] = cover
        self.bypath[cover.path] = cover

        return cover


    def update_db(self) -> None :
        update_db(self.byid, 'covers', dbCover)

class AlbumManager :
    def __init__(self) -> None:
        self.byid : dict[str, Album] = {}
        self.bydigest : dict[str, Album] = {}

    def load_existing(self) -> None :
        try :
            with db :
                records = dbAlbum.select()
        except dbAlbum.DoesNotExist : # type: ignore
            records  = []

        print(f"$$$$$ loading {len(records)} albums");

        self.byid = {r.id : Album(name=r.name, digest=r.digest, sort_name=r.sort_name, id=r.id, cover=r.cover, status=RECSTAT.OLD) for r in records}
        self.bydigest = {r.digest : r for r in self.byid.values()}

    def add_album(self, album : Album) -> Album :
        if album.digest in self.bydigest :
            a = self.bydigest[album.digest]

            if a.same(album) :
                if a.status == RECSTAT.OLD :
                    a.status = RECSTAT.SEEN

                return a

            album.id = a.id
            album.status = RECSTAT.MOD
            # fall through to update cache and return

        self.byid[album.id] = album
        self.bydigest[album.digest] = album
        return album

    def update_db(self) -> None :
        update_db(self.byid, 'albums', dbAlbum)


class AlbumTrackManager :
    def __init__(self) -> None:
        self.data : List[AlbumTrack] = []

    def load_existing(self) -> None :
        '''Do nothing. We replace everything later'''
        pass

    def add(self, track : AlbumTrack) -> None :
        self.data.append(track)

    def update_db(self) -> None :

        new_records = [{'album' : r.album, 'track' : r.track, 'pos' : r.pos} for r in self.data]
        print(f"$$$$$ reloading {len(new_records)} album tracks")

        with db.atomic() :
            dbAlbumTrack.truncate_table()

            dbAlbumTrack.insert_many(new_records).execute()


#############################################
# Global lists
#############################################
albumTrackList : List[AlbumTrack] = []

artistManager = ArtistManager()
trackManager = TrackManager()
artistAssocManager  = ArtistAssocManager()
coverManager = CoverManager()
albumManager = AlbumManager()
albumTrackManager = AlbumTrackManager()

__ALL__ = [
    artistManager, trackManager, artistAssocManager, coverManager,
    albumManager, albumTrackManager,

    ArtistManager, MusicFile, Track, Album, AlbumTrack, Artist, ArtistAssociation,
    Cover
]