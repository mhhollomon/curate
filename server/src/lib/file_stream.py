import os
from pathlib import Path
from typing import Dict

from fastapi.responses import StreamingResponse


def _mtype(ext : str) -> str :
    """cf https://www.iana.org/assignments/media-types"""
    return {
        '.webm' : 'audio/webm',
        '.mp3'  : 'audio/mpeg',
        '.flac' : 'audio/flac',
        '.jpg'  : 'image/jpeg',
        '.jpeg' : 'image/jpeg',
        '.png'  : 'image/png',
        '.webp' : 'image/webp',
    }[ext]


def read_streaming_file(path : Path | str, start_byte : int = 0) :
    with open(file=path, mode='br') as f :
        if start_byte > 0 :
            f.seek(start_byte)
        yield from f


def stream_file(path : Path, *,
                range_header : str | None = None,
                media_type : str | None = None,
                headers : Dict[str, str] | None = None) -> StreamingResponse :

    content_size = os.path.getsize(path)

    if range_header :
        # Range will look like `bytes=<start>-<stop?>`
        start_byte = int(range_header[6:].split('-', 2)[0])
    else :
        start_byte = 0

    if not media_type :
        ext = path.suffix
        media_type = _mtype(ext)

    if headers is None :
        headers = {}

    headers['Content-Length'] = str(content_size - start_byte)

    print(f"""-- Streaming file
      path = {path}
      start = {start_byte}
      media_type = {media_type}
      headers = {repr(headers)}""")

    return StreamingResponse(read_streaming_file(path, start_byte), media_type=media_type, headers=headers)
