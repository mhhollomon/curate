# Server API

## /api/artist
List all artists known to the system.

## /api/artist/\<id\>
List music (singles and albums) for that artist.

## /api/album
List all albums known to the system

### /api/album/\<id\>
List tracks associated with the given album.

# Development

## Run gen_data
```bash
python -m src.Curate.gen_data --music /mnt/music/Bandcamp --out output
```

## Run the server in debug mode
```bash
# listens on http://localhost:9999
#expects the database to be in "output/curate.db"
python -m src.Curate.server
```