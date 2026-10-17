# Music Directory Layout

Curate has multiple ways to try to figure out the artist, album, and tracks
that belong together .

Below are the various ways you can help it. This goes from highest priority
to lowest.

All items marked "Flag File" are empty files. It is the fact that they are present
in the directory that matters.

## .ignore Flag File

This directory and all its subdirectories are ignored. No data will be collected.

This is not active in the top level directory.

## .skip Flag File

This directory is skipped when using the [directory layout](#directory-layout-lowest)
method. If this would
have been the artist directory, then its subdirectories become artist directories
instead. And similar for album.

This can be used along with `_index.txt`, `.album`, or `.singles` in the same
directory.

## _index.yml

If a directory contains a file named `_index.yml`, this is used to decide what -
if anything - to do with the rest of the files in directory. Any files not mentioned
are ignored. Subdirectories are scanned, however, for other index files, etc.

See [INDEX_FILE.md](./INDEX_FILE.md) on the format of the `_index.yml` file


## .singles Flag File

If a file named `.singles` is in a directory, any music files will be registered
as singles. The name of the directory will be used as artist name.

If the music file names start with the same string as the directory name, it
will be removed to yield the track name.

### .album Flag File

If a file named `.album` is in a directory, any music files will be registered
as tracks of an album. The album name and the artist name is derived from the
directory name - `<artist> - <album>` - that is, the artist name and the album
name will be assumed to be separated by the sequence of characters ` - `.

The directory name `Harpy - What's not to Love` will parse as :
- artist = "Harpy"
- album = "What's not to Love"

If the track file names start with the same string as the directory name, it
will be removed to yield the track name.

The file name `Harpy - What's not to Love - Hot Girl.wav` will yield just `Hot Girl`
as the track name.

## directory layout (lowest)

Directories that directly under the top of the heirarchy are assumed to be named
after an artist. Subdirectories under those are considered to be the name of
albums. The artist name will be removed if it is at the start of the album name.

Music files (.wav, .mp3, etc) found in these second level directories will
be registered as tracks for the album they are contained in.

If there is a file with the name `cover.jpg` it will be used as the cover art.

Any subdirectories will be scanned but will only be registered if one of the
previous conditions are met.

```
/mnt/music
    Harpy
        Harpy - What's not to Love
            Hot Girl.wav
            cover.jpg
        The second album
    Flowman
        Beats me

```

THis will result in the registration of two artists - "Harpy" and "Flowman".
Harpy will be credited with two albums :
- What's not to Love (<- artist name removed)
- The second album

The file `cover.jpg` will be used as the cover art for the album.

Flowman will be credited with one album - "Beats me"