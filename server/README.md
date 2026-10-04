# Server API

## /api/artist
List all artists known to the system.

## /api/artist/\<id>
List music (singles and albums) for that artist.

## /api/album
List all albums known to the system

## /api/album/\<id>
List tracks associated with the given album.

## /api/play/\<id>
Play the track with the given id. Always returns a `.webm` file for simplicity.
Uses `ffmpeg` to recode the file when necessary.

# gen_data
Script to create/update the database by scanning the configured directory.

This is currently extremely slow.

```bash
uv run -m src.gen_data --music /mnt/music/Bandcamp --out output
```


# Development


## Run the server in debug mode
```bash
 uv run fastapi dev
```