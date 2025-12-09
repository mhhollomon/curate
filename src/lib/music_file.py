from .types import MusicFile
from pathlib import Path
import hashlib

def hash_file(file : Path) -> str :
    hash = hashlib.sha256()

    with open(file, 'rb') as f :
        read_size = 65536
        while True :
            data = f.read(read_size)
            if not data :
                break
            hash.update(data)
    return hash.hexdigest()


def read_music_file(read_path : Path, db_path : Path) -> MusicFile :
    tags = {} # for now

    id = hash_file(read_path)

    format = read_path.suffix[1:]

    return MusicFile(db_path, format, id, tags)
