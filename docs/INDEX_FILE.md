# Index file format

The index file (`_index.yml`) is a YAML based file containing reigstration
information for the directory which contains it.

There are two different formats depending if the file is registering singles
or an album.

## Singles format

```yml
type : single
files :
    "My first Indie Hit.wav" :
        artist : Cool Guy
        name : That Indie Hit
    "Your Indie Hit.wav" :
        artist : Some Phenom
        name : The Other Hit
```

## Album format
Track are added to the album in the order they are mentioned in the file.


```yml
type : album
artist : Phrenzy
# Name of the album
name : Phrenetic
cover : cover.jpg
tracks :
    - file : Phrenetic - 01 - Not going Zen.flac
      name : Not going Zen
    - file : Phrenetic - 02 - Not wise (remix).flac
      name : Not wise
```

the `tracks` tag can also be just the single word `auto`. In that case
the system use hueristics to decide the name a position of the track based
on its name and the artist and album name.

```yml
type : album
artist : Phrenzy
name : Phrenetic
tracks : auto
```
