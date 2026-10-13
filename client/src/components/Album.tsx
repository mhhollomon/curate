import './Album.css'

import { useEffect, useState } from "react"
import { Table } from "react-bootstrap"

import { type respAlbumAlbum, type respAlbumArtist, type respAlbumTrack } from '../responses'
import Player from './Player'
import Toggle from './Toggle'

import { play_btn_fill } from '../icons'

import { useProtectedData } from "../lib/hook"


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
    const [autoPlay, setAutoPlay] = useState<boolean>(false)
    const [loopAlbum, setLoopAlbum] = useState<boolean>(false)
    const [playSrc, setPlaySrc] = useState<string|null>(null)

    useProtectedData({
        url : '/api/album/' + album_id,
        data_proc : (data) => {
            const tracks = data.tracks
            if (tracks.length > 1) {
                setTrackList(tracks)
            }

            setArtist(data.artist as respAlbumArtist)

            setAlbum(data.album as respAlbumAlbum)

            console.log(JSON.stringify(data.album))
        }
    })


    useEffect(() => {
        if (album === undefined || album.cover === null) return;
        setCoverId(album.cover)
    }, [album])

    useEffect(() =>{
        if (!playTrackDataState) {
            console.log("useEffect - nulling out playSrc")
            setPlaySrc(null)
        } else {
            console.log("useEffect - updating playSrc")
            setPlaySrc(`/api/play/${playTrackDataState.id}`)
        }


    }, [playTrackDataState])

    function playTrack(t: respAlbumTrack) {
        setPlayTrackData({ 'id': t.id, 'name': t.name })

    }

    function compute_next_track(delta: number = 1) {

        let index = trackList.findIndex((t) => t.id === playTrackDataState?.id)
        const old_index = index
        console.log(`compute_next_track : old_index = ${old_index}`)
        index += delta
        index = index >= trackList.length ? 0 : index
        index = index < 0 ? trackList.length - 1 : index

        console.log(`compute_next_track : index = ${index}`)
        console.log(`compute_next_track : loopAlbum = ${loopAlbum}`)

        if (!loopAlbum && index != old_index + delta) {
            // we reached the "end"
            setPlayTrackData(undefined)
            return
        }

        const t = trackList[index]
        setPlayTrackData({ 'id': t.id, 'name': t.name })
    }

    function onPlayEnd() {
        console.log("Playback ended")
        if (autoPlay) {
            compute_next_track(1)
        } else {
            setPlayTrackData(undefined)
        }
    }

    function onAutoPlay() {
        if (! autoPlay && ! playTrackDataState) {
            // Start the album if not curently playing something.
            const t = trackList[0]
            setPlayTrackData({ 'id': t.id, 'name': t.name })
        }

        setAutoPlay(! autoPlay)
    }

    function onNext() {
        if (autoPlay) {
            compute_next_track(1)
        } else {
            setPlayTrackData(undefined)
        }

    }

    function onPrevious() {
        if (autoPlay) {
            compute_next_track(-1)
        } else {
            setPlayTrackData(undefined)
        }

    }

    function changeLoop() {
        setLoopAlbum(! loopAlbum)
    }

    let track_name = ''

    if (playTrackDataState !== undefined) {
        track_name = playTrackDataState.name
    }

    return (<>

        <div className="container d-flex flex-column justify-content-center align-items-center">
            <div className="coverBlock mt-2 mb-2">
                {coverId && <img src={`/api/cover/${coverId}`} width={300} height={300} />}
            </div>
            <div>
                <span className="fw-bold fs-4">{album?.name}</span>
            </div>

            <div className="artistBlock">
                <span>{artist?.name}</span>
            </div>

            <Player src={playSrc} name={track_name} onEnd={onPlayEnd}
                onPrevious={onPrevious} onNext={onNext} />

            <Table striped>
                <thead>
                    <tr>
                        <th colSpan={2}><div className='d-flex gap-2'>
                            <Toggle state={autoPlay} title="Auto" onStateChange={onAutoPlay} />
                            <Toggle title="Loop" state={loopAlbum} onStateChange={changeLoop} />

                        </div>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {trackList && trackList.map(a => <tr key={a.id}>
                        <td style={{ width: '2rem' }}>{a.id === playTrackDataState?.id ? '>>>' : <a onClick={() => playTrack(a)}>{play_btn_fill}</a>}</td>
                        <td><a onClick={() => playTrack(a)}>{a.name}</a></td>
                    </tr>)}
                </tbody>
            </Table>

        </div>

    </>)

}