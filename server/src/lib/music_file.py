import os

from .types import MusicFile
from pathlib import Path
import hashlib

def hash_file(file : Path) -> str :
    """Generate a "fingerprint" for the file using the size of
    the file and the contents of the first 128K bytes.
    """
    hash = hashlib.sha256()

    size = os.path.getsize(file)
    hash.update(str(size).encode())

    with open(file, 'rb') as f :
        # Only read the first 128K.
        # Most times, this should be a single block.
        read_size = 1024 * 128
        data = f.read(read_size)
        if data :
            hash.update(data)

    return hash.hexdigest()


def read_music_file(read_path : Path, db_path : Path) -> MusicFile :
    tags = {} # for now
    format = read_path.suffix[1:]
    digest = hash_file(read_path)

    return MusicFile(db_path, format, digest, tags)
