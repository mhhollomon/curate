# CURATE

Fun DYI project to stream music.

Scans a music directory structure and uses found index files
to build a database of music references.

**CURRENTLY NO SECURITY** (future though)

- [server](./server/)
- [client](./client/)

## Roadmap
(User visible - in no particular order)

1. User logins - security.
1. User based playlists.
1. Play queue.
1. Actual support for album covers.

(internals)

1. Clean up cache periodically.
1. Fix cache locking.
1. Switch to async for api.


## Tech stack

### Server
- [Fastapi](https://fastapi.tiangolo.com/)
- [Sqlite](https://sqlite.org/index.html)
- [PeeWee ORM](https://docs.peewee-orm.com/en/latest/index.html)
- [uv](https://docs.astral.sh/uv/)
- [ffmpeg](https://ffmpeg.org/)
- [nanio](https://github.com/puyuan/py-nanoid)

### Client
- [Howler Audio Component](https://github.com/goldfire/howler.js)
- [React](https://react.dev/)
- [Wouter](https://www.npmjs.com/package/wouter)
- [Bootstrap](https://getbootstrap.com/)
- [vite](https://vite.dev/)
