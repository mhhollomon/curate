# CURATE

Fun DYI project to stream music.

Scans a music directory structure and uses found index files
to build a database of music references. Does **not** use reference
services such as _musicbrainz_. Does **not** write to the directory
structure where your music lives (It can be mounted read-only if you want).

Security is minimal.

- [server](./server/)
- [client](./client/)

## Roadmap

### User visible - in no particular order

1. User based playlists.
1. Seeking in the audio player.

### Internals

1. Clean up cache periodically.
1. Fix cache locking.
1. Switch to async for api.

## Install
see [INSTALL.md](./docs/INSTALL.md) for one solution.

## Tech stack

### Server
- [Fastapi](https://fastapi.tiangolo.com/)
- [Fastapi-login](https://fastapi-login.readthedocs.io/)
- [Sqlite](https://sqlite.org/index.html)
- [PeeWee ORM](https://docs.peewee-orm.com/en/latest/index.html)
- [uv](https://docs.astral.sh/uv/)
- [ffmpeg](https://ffmpeg.org/)
- [pillow](https://pillow.readthedocs.io/en/stable/)
- [nanio](https://github.com/puyuan/py-nanoid)

### Client
- [React](https://react.dev/)
- [Wouter](https://www.npmjs.com/package/wouter)
- [jotai](https://jotai.org/)
- [vite](https://vite.dev/)
- [sass](https://sass-lang.com/)
