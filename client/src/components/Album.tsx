import './Album.css'

import { useEffect, useState } from "react"
import { Table, Button } from "react-bootstrap"

import { type respAlbumAlbum, type respAlbumArtist, type respAlbumTrack } from '../responses'
import Player from './Player'
import { collection_play } from '../icons'

export interface AlbumProps {
    album_id: string
}

interface playTrackData {
    id: string;
    name: string;
}
export default function Album({ album_id }: AlbumProps) {

    const [trackList, setTrackList] = useState<respAlbumTrack[]>([])
    const [artist, setArtist] = useState<respAlbumArtist>()
    const [album, setAlbum] = useState<respAlbumAlbum>()
    const [playTrackDataState, setPlayTrackData] = useState<playTrackData>()
    const [coverId, setCoverId] = useState<string>()
    const [playingAll, setPlayingAll] = useState<boolean>(false)

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

    function playTrack(t: respAlbumTrack) {
        setPlayTrackData({ 'id': t.id, 'name': t.name })

    }

    function compute_next_track(delta : number = 1) {

            let index = trackList.findIndex((t) => t.id === playTrackDataState?.id)
            index += delta
            index = index >=trackList.length ? 0 : index
            index = index < 0 ? trackList.length-1 : index
            const t = trackList[index]
            setPlayTrackData({ 'id': t.id, 'name': t.name })
    }

    function onPlayEnd() {
        console.log("Playback ended")
        if (playingAll) {
            compute_next_track(1)
        } else {
            setPlayTrackData(undefined)
        }
    }

    function onPlayAll() {
        const t = trackList[0]
        setPlayTrackData({ 'id': t.id, 'name': t.name })
        setPlayingAll(true)
    }

    function onNext() {
        if (playingAll) {
            compute_next_track(1)
        } else {
            setPlayTrackData(undefined)
        }

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
                {coverId && <img src={`/api/cover/${coverId}`} width={300} />}
            </div>
            <div>
                <span className="fw-bold fs-4">{album?.name}</span>
            </div>

            <div className="artistBlock">
                <span>{artist?.name}</span>
            </div>

            <Player src={track_href} name={track_name} onEnd={onPlayEnd}
                onPrevious={() => { }} onNext={onNext} />

            <Table striped>
                <thead>
                    <tr><th><Button className="me-3" onClick={onPlayAll}>{collection_play} Play All</Button>
                        Tracks</th></tr>
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