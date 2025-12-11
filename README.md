# CURATE

Fun DYI project to stream music

# Server API

## /api/artist
List all artists

## /api/artist/<id>
List music (singles and albums) for that artist


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