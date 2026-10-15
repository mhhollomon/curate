# CURATE

Fun DYI project to stream music.

Scans a music directory structure and uses found index files
to build a database of music references.

**CURRENTLY NO SECURITY** (future though)

- [server](./server/)
- [client](./client/)

## Roadmap
(User visible - in no particular order)

1. User based playlists.
1. Play queue.

(internals)

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
- [Howler Audio Component](https://github.com/goldfire/howler.js)
- [React](https://react.dev/)
- [Wouter](https://www.npmjs.com/package/wouter)
- [Bootstrap](https://getbootstrap.com/)
- [react-bootstrap](https://react-bootstrap.github.io/)
- [jotai](https://jotai.org/)
- [vite](https://vite.dev/)
