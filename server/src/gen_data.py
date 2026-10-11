import re

from .lib.types import *
from .lib.music_file import read_music_file
from .lib.database import *

from argparse import ArgumentParser, Namespace, BooleanOptionalAction
from pathlib import Path
import yaml

from typing import Any, Dict

class GenerateData :
    def __init__(self, directory: str, database : str, rebuild : bool = False) -> None :
        self.directory=Path(directory)
        self.db_file=Path(database)
        self.rebuild = rebuild

        if not self.directory.exists() :
            raise Exception(f"Directory {self.directory} does not exist")

        if not self.directory.is_dir() :
            raise Exception(f"Directory {self.directory} is not a directory")

        if not self.db_file.parent.exists() :
            raise Exception(f"Output directory {self.db_file.parent} does not exist.")


    ##########################################################
    def launch(self) -> int :

        self.open_db()

        print(f"Starting on collection {self.directory}")

        level = 0
        self.tree_top(self.directory, level)


        print(f"Finished with collection {self.directory}")

        self.update_db()

        return 0

    ##########################################################
    def open_db(self) -> None :

        print(f"db file = {self.db_file}")
        db.init(str(self.db_file))

        if self.rebuild :
            print("!!!!! Dropping tables for rebuild")
            with db :
                db.drop_tables([dbArtist, dbTrack, dbAlbum,
                              dbAlbumTrack, dbArtistAssociation,
                              dbCover], safe=True)
        with db :
            db.create_tables([dbArtist, dbTrack, dbAlbum,
                              dbAlbumTrack, dbArtistAssociation,
                              dbCover], safe=True)

        artistManager.load_existing()
        trackManager.load_existing()
        artistAssocManager.load_existing()
        coverManager.load_existing()
        albumManager.load_existing()
        albumTrackManager.load_existing()

    ##########################################################
    def update_db(self) -> None :

        artistManager.update_db()
        trackManager.update_db()
        artistAssocManager.update_db()
        coverManager.update_db()
        albumManager.update_db()
        albumTrackManager.update_db()

    ##########################################################
    def clean_name(self, name : str, *frags) :
        for z in frags :
            name = name.replace(z, '', 1)

        name = re.sub(r"-?(:?ALBUM|EP)-?", "", name)

        name = name.strip(" -")



        return name

    ##########################################################
    def tree_top(self, dir : Path, level : int,  prefix : str = '') -> None :
        # Run through subdirectories
        for entry in dir.iterdir() :
            if entry.is_dir() :
                print(f"{prefix} - artist {entry}")
                self.artist_dir(dir / entry, level+1, prefix + '  ')
        # handle the index if there
        print(f"top {dir}")
        self.handle_index(dir, prefix)

    ##########################################################
    def artist_dir(self, dir : Path, level : int,  prefix : str = '') -> None :
        artist_name = dir.name.strip(" -")
        music : list[Path] = []
        for entry in dir.iterdir() :
            if entry.is_dir() :
                print(f"{prefix} - album {entry}")
                self.album_dir(dir / entry, level+1, artist_name, prefix + '  ')
            elif self.is_music(entry) :
                music.append(entry)

        if self.handle_index(dir, prefix):
            # If there is an index, then don't try to
            # something with any music files.
            return

        if not music :
            return

        if (dir / '.album').exists() :
            self.discover_album(dir, music)
            return

        artist = artistManager.add_artist(artist_name)
        for f in music :
            rel_path = f.relative_to(self.directory)
            music_obj = read_music_file(f, rel_path)
            track_name = self.clean_name(f.stem, artist_name)
            track = Track(music_obj, track_name)
            artist.add_track(track)

    ##########################################################
    def album_dir(self, dir : Path, level : int,  artist : str, prefix : str) -> None :
        album = self.clean_name(dir.name, artist)
        music : list[Path] = []
        for entry in dir.iterdir() :
            if entry.is_dir() :
                print(f"{prefix} - lower {entry}")
                self.lower_dir(dir / entry, level+1, prefix + '  ')
            elif self.is_music(entry) :
                music.append(entry)

        if self.handle_index(dir, prefix) :
            return

        if music :
            # For now, ignore the names passed in
            # and let discover do the parsing.
            self.discover_album(dir, music)


    ##########################################################
    def lower_dir(self, dir : Path, level : int,  prefix : str) -> None :
        for entry in dir.iterdir() :
            if entry.is_dir() :
                print(f"{prefix} - lower {entry}")
                self.lower_dir(dir / entry, level+1, prefix + '  ')

        self.handle_index(dir, prefix)

    ##########################################################
    def find_track_position(self, track_name : str) -> tuple[str, int | None] :

        match = re.match(r"\d+", track_name)
        pos : int | None = None
        if match :
            pos_str = match.group()
            track_name = self.clean_name(track_name, pos_str)
            pos = int(pos_str)

        return (track_name, pos)


    ##########################################################
    def discover_album(self, dir : Path, music : list[Path], artist_name : str | None = None) -> None :
        """The user marked this as an album using ``.album``.
        Try to make sense of the directory."""

        # The directory must contain both the artist and album name.
        # <sp><dash><sp> is used by bandcamp.
        pieces = dir.name.split(" - ", 1)
        if len(pieces) < 2 :
            print(f"$$$$$ could not discover in {dir}")
            return

        if not artist_name :
           artist_name = pieces[0]

        album_name = pieces[1]

        artist_name = artist_name.strip()
        album_name = self.clean_name(album_name.strip())

        cover = None
        if (dir / "cover.jpg").exists() :
            cover = Cover(path=(dir / 'cover.jpg').relative_to(self.directory))
            cover = coverManager.add_cover(cover)

        artist = artistManager.add_artist(artist_name)

        album = Album(album_name, cover=cover.id if cover else None, digest=path_digest(dir))
        album = artist.add_album(album)

        index : int = 0
        for f in music :
            music_obj = read_music_file(f, f.relative_to(self.directory))
            track_name = self.clean_name(f.stem, *pieces)
            (track_name, position) = self.find_track_position(track_name)
            if not position :
                index += 1
                position = index
            track = Track(music_obj, track_name)
            album.add_track(track, position)


    ##########################################################
    def handle_index(self, dir : Path, prefix : str) -> bool :

        index_path = dir / '_index.yml'
        if not index_path.exists() :
            print(f"{prefix}-- no index. returning")
            return False

        print(f"{prefix}-- has index.")
        index_data : Dict[str, Any] = self.read_index_file(index_path)
        if index_data['type'] == 'single' :
            self.read_singles_index(dir, index_data, prefix)
        elif index_data['type'] == 'album' :
            self.read_album_index(dir, index_data, prefix)
        else :
            raise Exception(f"Unknown type '{index_data['type']}' in {dir}")

        print(f"{prefix}-- Finished directory {dir}")
        return True


    ##########################################################
    def read_singles_index(self, dir : Path, index_data : Dict[str, Any], prefix : str) -> None :
        print(f"{prefix}-- singles")

        if 'files' not in index_data :
            print(f"{prefix} == No files in index - ignoring")
            return
        template =  { **index_data }
        del template['files']

        seen_files = set()
        for filename,v in index_data['files'].items() :
            full_path = dir / filename
            rel_path = full_path.relative_to(self.directory)
            if full_path.exists() :
                music_obj = read_music_file(full_path, rel_path)
                data = {**(music_obj.tags if music_obj.tags else {}), **template, **v}
                data['filename'] = filename
                self.add_to_artist(music_obj, data)
                seen_files.add(filename)
            else :
                print(f"{prefix} - {filename} does not exist - ignoring")

        for f in dir.iterdir() :
            filename = f.parts[-1]
            if self.is_music(f) and filename not in seen_files :
                rel_path = f.relative_to(self.directory)
                music_obj = read_music_file(f, rel_path)
                data = {**(music_obj.tags if music_obj.tags else {}), **template}
                data['filename'] = filename
                self.add_to_artist(music_obj, data)

    ##########################################################
    def add_to_artist(self, music : MusicFile, data : Dict[str, Any]) -> None :
        if 'name' not in data :
            data['name'] = Path(data['filename']).stem
        if 'sort_name' not in data :
            data['sort_name'] = data['name'].lower()
        track = Track(music, data['name'], data['sort_name'])
        if 'artist' in data :
            artist = artistManager.add_artist(data['artist'])
        else :
            artist = artistManager.unknown()

        artist.add_track(track)

    ##########################################################
    def read_album_index(self, dir : Path, index_data : Dict[str, Any], prefix : str) -> None :
        print(f"{prefix}-- album")
        if 'tracks' not in index_data :
            print(f"{prefix} == No tracks in index - ignoring")
            return
        if 'sort_name' not in index_data :
            index_data['sort_name'] = index_data['name'].lower()

        if 'artist' in index_data :
            artist = artistManager.add_artist(index_data['artist'])
        else :
            artist = artistManager.unknown()

        cover = None
        if 'cover' in index_data :
            full_cover_path = dir / index_data['cover']
            if full_cover_path.exists() :
                cover = Cover(path=full_cover_path.relative_to(self.directory))
                # It may already exist. Let the manager tell us.
                cover = coverManager.add_cover(cover)
        elif (dir / 'cover.jpg').exists() :
            cover = Cover(path=(dir / 'cover.jpg').relative_to(self.directory))
            cover = coverManager.add_cover(cover)

        album = Album(index_data['name'], index_data['sort_name'], cover=cover.id if cover else None)
        album = artist.add_album(album)

        if index_data['tracks'] == 'auto' :
            index = 0
            for entry in dir.iterdir() :
                if self.is_music(entry) :
                    rel_path = entry.relative_to(self.directory)
                    music_obj = read_music_file(entry, rel_path)
                    track_name = self.clean_name(entry.stem, artist.name, album.name)
                    (track_name, position) = self.find_track_position(track_name)
                    if not position :
                        index += 1
                        position = index
                    track = Track(music_obj, track_name)
                    album.add_track(track, position)
        else :
            for index, t in enumerate(index_data['tracks']) :
                full_path = dir / t['file']
                rel_path = full_path.relative_to(self.directory)
                if full_path.exists() :
                    music_obj = read_music_file(full_path, rel_path)
                    sort_name = t['sort_name'] if 'sort_name' in t else None
                    track = Track(music_obj, t['name'], sort_name)
                    album.add_track(track, index+1)

    ##########################################################
    def read_index_file(self, file : Path) -> Dict[str, Any] :
        index_data : Dict[str, Any] = {'type' : 'album'}
        with open(file, 'r') as f :
            index_data.update(yaml.safe_load(f))

        if 'type' not in index_data :
            index_data['type'] = 'album'

        return index_data

    ##########################################################
    def is_music(self, file : Path) -> bool :
        return (file.is_file() & (file.suffix in ('.wav', '.mp3', '.flac', '.webm')))

    class outputter :
        def __init__(self, output) -> None :
            self.output = output
            self.prefix = ''

        def prt(self, s : str) -> None :
            self.output.write(self.prefix + s + '\n')


##########################################################
def getargs() -> Namespace :
    parser = ArgumentParser()

    parser.add_argument('--music', default='/mnt/music/Bandcamp')
    parser.add_argument('--rebuild', action=BooleanOptionalAction, default=False)
    parser.add_argument('--out', required=True, help="Name of file for the database.")

    return parser.parse_args()

def main() :
    args = getargs()

    obj = GenerateData(directory=args.music, database=args.out, rebuild=args.rebuild)
    retval = obj.launch()

    return retval

##########################################################
if __name__ == '__main__' :

    retval = main()

    exit(retval)
