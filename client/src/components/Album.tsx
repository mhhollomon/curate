import './Album.css'

import { useEffect, useState } from "react"
import { Table } from "react-bootstrap"

import {type respAlbumAlbum, type respAlbumArtist, type respAlbumTrack} from '../responses'
import Player from './Player'

export interface AlbumProps {
    album_id: string
}

interface playTrackData {
    id : string;
    name : string;
}
export default function Album({ album_id }: AlbumProps) {

    const [trackList, setTrackList] = useState<respAlbumTrack[]>([])
    const [artist, setArtist] = useState<respAlbumArtist>()
    const [album, setAlbum] = useState<respAlbumAlbum>()
    const [playTrackDataState, setPlayTrackData] = useState<playTrackData>()
    const [coverId, setCoverId] = useState<string>()

    useEffect(() => {
        fetch(
            '/api/album/' + album_id
        ).then(
            response => response.json()
        ).then(
            data => {
                const tracks = data.tracks
                if (tracks.length > 1) {
                    setTrackList(tracks)
                }

                setArtist(data.artist as respAlbumArtist)

                setAlbum(data.album as respAlbumAlbum)

                console.log(JSON.stringify(data.album))

            }
        )

    }, [album_id])

    useEffect(() => {
        if (album === undefined || album.cover === null) return;
        setCoverId(album.cover)
    }, [album])

    function playTrack(t : respAlbumTrack) {
        setPlayTrackData({'id' : t.id, 'name' : t.name })

    }

    function onPlayEnd() {
        console.log("Playback ended")
        setPlayTrackData(undefined)
    }

    let track_href = null
    let track_name = ''

    if (playTrackDataState !== undefined) {
        track_href = `/api/play/${playTrackDataState.id}`
        track_name = playTrackDataState.name
    }

    return (<>

        <div className="container d-flex flex-column justify-content-center align-items-center">
        <div className="coverBlock mt-2 mb-2">
            { <img src={`/api/cover/${coverId}`} width={300}/>}
        </div>
        <div>
            <span className="fw-bold fs-4">{album?.name}</span>
        </div>

        <div className="artistBlock">
            <span>{artist?.name}</span>
        </div>

        <Player src={track_href} name={track_name} onEnd={onPlayEnd}/>

        <Table striped>
            <thead>
                <tr><th>Tracks</th></tr>
            </thead>
            <tbody>
                {trackList && trackList.map(a => <tr key={a.id}>
                    <td><a onClick={() => playTrack(a)}>{a.name}</a></td>
                    </tr>)}
            </tbody>
        </Table>

</div>

    </>)

}