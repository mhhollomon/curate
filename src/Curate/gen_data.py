#!/bin/env python
from .lib.types import *
from .lib.music_file import read_music_file
from .lib.database import *

from argparse import ArgumentParser, Namespace
from pathlib import Path
import yaml

from typing import Any, Dict
import sys



class GenerateData :
    def __init__(self, directory: str, output_directory : str) -> None :
        self.directory=Path(directory)
        if not self.directory.exists() :
            raise Exception(f"Directory {self.directory} does not exist")

        if not self.directory.is_dir() :
            raise Exception(f"Directory {self.directory} is not a directory")

        self.output_directory = Path(output_directory)
        if self.output_directory.exists() and not self.output_directory.is_dir() :
            raise Exception(f"Output directory {self.output_directory} is not a directory")

        if not self.output_directory.exists() :
            self.output_directory.mkdir()

        self.output = (self.output_directory / 'data.yml').open('w')
        self.artists = ArtistManager()

    ##########################################################
    def launch(self) -> int :
        print(f"Starting on collection {self.directory}")

        self.walk_tree(self.directory)

        self.output_data()
        self.output.close()

        self.build_db()

        print(f"Finished on collection {self.directory}")

        return 0

    ##########################################################
    def walk_tree(self, dir : Path, prefix : str = '') -> None :
        print(f"{prefix}-- Walking directory {dir}")

        # Run through subdirectories
        for entry in dir.iterdir() :
            if entry.is_dir() :
                print(f"{prefix} - recursing {entry}")
                self.walk_tree(dir / entry, prefix + '  ')


        # For now, only lool at directories that have an index file
        index_path = dir / '_index.yml'
        if not index_path.exists() :
            print(f"{prefix}-- no index. returning")
            return

        index_data : Dict[str, Any] = self.read_index_file(index_path)
        if index_data['type'] == 'single' :
            self.read_singles(dir, index_data, prefix)
        elif index_data['type'] == 'album' :
            self.read_album(dir, index_data, prefix)
        else :
            raise Exception(f"Unknown type '{index_data['type']}' in {dir}")

        print(f"{prefix}-- Finished directory {dir}")

    ##########################################################
    def read_singles(self, dir : Path, index_data : Dict[str, Any], prefix : str) -> None :
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
            data['sort_name'] = data['name']
        track = Track(music, data['name'], data['sort_name'])
        if 'artist' in data :
            artist = self.artists.add_artist(data['artist'])
        else :
            artist = self.artists.unknown()

        artist.add_track(track)

    ##########################################################
    def read_album(self, dir : Path, index_data : Dict[str, Any], prefix : str) -> None :
        if 'tracks' not in index_data :
            print(f"{prefix} == No tracks in index - ignoring")
            return
        if 'sort_name' not in index_data :
            index_data['sort_name'] = index_data['name']

        if 'artist' in index_data :
            artist = self.artists.add_artist(index_data['artist'])
        else :
            artist = self.artists.unknown()

        album = Album(index_data['name'], index_data['sort_name'])
        artist.add_album(album)

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
        return (file.is_file() & (file.suffix in ('.wav', '.mp3', '.flac')))

    class outputter :
        def __init__(self, output) -> None :
            self.output = output
            self.prefix = ''

        def prt(self, s : str) -> None :
            self.output.write(self.prefix + s + '\n')

    ##########################################################
    def output_data(self) -> None :
        out = self.outputter(self.output)

        out.prt("artists :")
        for artist in self.artists :
            out.prefix = "  - "
            out.prt(f"id : {artist.id}")
            out.prefix = "    "
            out.prt(f"name : {artist.name}")
            out.prt(f"sort_name : {artist.sort_name}")

        out.prefix = ""
        out.prt("tracks :")
        for track in trackList :
            out.prefix = "  - "
            out.prt(f"id : {track.id}")
            out.prefix = "    "
            out.prt(f"name : {track.name}")
            out.prt(f"sort_name : {track.sort_name}")
            out.prt(f"file :")
            out.prt(f"  path : {track.file.path}")
            out.prt(f"  digest : {track.file.digest}")
            out.prt(f"  format : {track.file.format}")

        out.prefix = ""
        out.prt("albums :")
        for album in albumList :
            out.prefix = "  - "
            out.prt(f"id : {album.id}")
            out.prefix = "    "
            out.prt(f"name : {album.name}")
            out.prt(f"sort_name : {album.sort_name}")

        out.prefix = ""
        out.prt("artist_music :")
        for association in artistAssociationList :
            out.prefix = "  - "
            out.prt(f"artist : {association.artist}")
            out.prefix = "    "
            out.prt(f"music : {association.music}")
            out.prt(f"kind : {association.kind}")

        out.prefix = ""
        out.prt("album_track :")
        for track in albumTrackList :
            out.prefix = "  - "
            out.prt(f"track : {track.track}")
            out.prefix = "    "
            out.prt(f"album : {track.album}")
            out.prt(f"pos : {track.pos}")

    ##########################################################
    def build_db(self) -> None :
        db_file = self.output_directory / 'curate.db'
        if db_file.exists() :
            db_file.unlink()

        db.init(db_file)
        with db.atomic() :
            dbAlbum.create_table()
            dbArtist.create_table()
            dbTrack.create_table()
            dbAlbumTrack.create_table()
            dbArtistAssociation.create_table()

        with db.atomic() :
            artists = [{"id" : a.id, "name" : a.name, "sort_name" : a.sort_name} for a in self.artists]
            dbArtist.insert_many(artists).execute()

            tracks = [{"id" : t.id, "name" : t.name, "sort_name" : t.sort_name, "path" : t.file.path, "digest" : t.file.digest, "format" : t.file.format} for t in trackList]
            dbTrack.insert_many(tracks).execute()

            albums = [{"id" : a.id, "name" : a.name, "sort_name" : a.sort_name} for a in albumList]
            dbAlbum.insert_many(albums).execute()

            album_tracks = [{"album" : at.album, "track" : at.track, "pos" : at.pos} for at in albumTrackList]
            dbAlbumTrack.insert_many(album_tracks).execute()

            artist_associations = [{"artist" : aa.artist, "item" : aa.music, "kind" : aa.kind} for aa in artistAssociationList]
            dbArtistAssociation.insert_many(artist_associations).execute()

##########################################################
def getargs() -> Namespace :
    parser = ArgumentParser()

    parser.add_argument('--music', default='/mnt/music/Bandcamp')
    parser.add_argument('--out', required=True)

    return parser.parse_args()

def main() :
    args = getargs()

    obj = GenerateData(directory=args.music, output_directory=args.out)
    retval = obj.launch()

    return retval

##########################################################
if __name__ == '__main__' :

    retval = main()

    exit(retval)
