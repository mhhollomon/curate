from dataclasses import dataclass, field
from nanoid import generate
from pathlib import Path
from typing import List, Dict, Any

def get_id() -> str :
    """Generate a random ID string
    """
    return generate("23456789abcdefghijkmnpqrstuvwxyzABCDEFGHIJKMNPQRSTUVWXYZ",16)

@dataclass
class MusicFile :
    path : Path
    format : str # currently one of 'wav' or 'mp3'
    id   : str # sha256 hash of the file
    tags : Dict[str, Any] | None = None

@dataclass
class OwnableMusic :
    name : str
    sort_name : str
    id   : str
    kind : str 


class Track(OwnableMusic) :
    def __init__(self, file : MusicFile, name : str, sort_name : str) :
        super().__init__(name, sort_name, get_id(), 'Track')
        self.file = file

@dataclass
class AlbumTrack :
    file : MusicFile
    name : str
    pos  : int

class Album(OwnableMusic) :
    def __init__(self, name : str, sort_name : str) :
        super().__init__(name, sort_name, get_id(), 'Album')
        self.tracks : List[AlbumTrack] = []

    def add_track(self, music : MusicFile, name : str, track_number : int ) :

        if track_number in [ t.pos for t in self.tracks ] :
            raise Exception(f"Duplicate track number in album {self.name} ({track_number})")
        self.tracks.append(AlbumTrack(music, name, track_number))

@dataclass 
class Artist :
    name : str
    sort_name : str
    id   : str
    assoc : List[OwnableMusic] = field(init=False, default_factory=list)

    def add_music(self, m : OwnableMusic) :
        self.assoc.append(m)

