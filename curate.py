#!/bin/env python
from lib.types import *
from lib.music_file import read_music_file

from argparse import ArgumentParser, Namespace
from pathlib import Path
import yaml

from dataclasses import asdict

from typing import Any, Dict
import sys




class Curate :
    def __init__(self, directory: str, output) -> None :
        self.directory=Path(directory)
        self.output=output
        self.artists = ArtistManager()

        if self.output.closed :
            raise Exception("closed")

    ##########################################################
    def launch(self) -> int :
        print(f"Starting on collection {self.directory}")

        self.walk_tree(self.directory)

        self.output_data()

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
def getargs() -> Namespace :
    parser = ArgumentParser()

    parser.add_argument('--dir', default='/mnt/music/Bandcamp')
    parser.add_argument('--out', default='-')

    return parser.parse_args()

##########################################################
if __name__ == '__main__' :

    args = getargs()
    need_to_close = False
    if args.out == '-' :
        output = sys.stdout
    else :
        output = open(args.out, 'w')
        need_to_close = True

    obj = Curate(directory=args.dir, output=output)
    retval = obj.launch()

    if need_to_close :
        output.close()


    exit(retval)
