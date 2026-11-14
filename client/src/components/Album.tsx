import './Album.css'

import { useEffect, useState } from "react"

import { type respAlbumAlbum, type respAlbumArtist, type respAlbumTrack } from '~/responses'
import Player2, { type PlayerTrackData } from './Player2'
import Toggle from '../framework/components/Toggle'


import { useProtectedData } from "~/lib/hook"
import { formatTime } from "~/lib/utils";
import Flex from '~/framework/components/flex'
import QueuePopupMenu from '~/components/QueuePopupMenu'
import { useAtom } from 'jotai'
import { queueListAtom } from '~/atoms'
import type { QueueItem } from '~/types/queue_item'
import SuccessPopup from '~/components/SuccessPopup'
import PlayIcon from '~/components/PlayIcon'


export interface AlbumProps {
    album_id: string
}


export default function Album({ album_id }: AlbumProps) {

    const [trackList, setTrackList] = useState<respAlbumTrack[]>([]);
    const [artist, setArtist] = useState<respAlbumArtist>()
    const [album, setAlbum] = useState<respAlbumAlbum>();;
    const [coverId, setCoverId] = useState<string>();
    const [autoPlay, setAutoPlay] = useState<boolean>(false);
    const [loopAlbum, setLoopAlbum] = useState<boolean>(false);

    const [currentTrack, setCurrentTrack] = useState<PlayerTrackData>();

    const [queueList, SetQueueList] = useAtom(queueListAtom)

    const [showQueue, setShowQueue] = useState(false);
    const [queueMsg, setQueueMsg] = useState<string>('');

    useProtectedData({
        url: '/api/album/' + album_id,
        data_proc: (data) => {
            const tracks = data.tracks
            if (tracks.length > 0) {
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



    function playTrack(t: respAlbumTrack | undefined) {
        if (!t) {
            setCurrentTrack(undefined);
        } else {
            setCurrentTrack(track2player_data(t));
        }

    }

    function track2player_data(t: respAlbumTrack): PlayerTrackData {
        return {
            'id': t.id,
            'src': `/api/play/${t.id}`,
            'artist': artist?.name || '',
            'cover': `/api/cover/media/${coverId}`,
            'album': album?.name,
            'name': t.name
        };
    }


    function compute_next_track(delta: number = 1): respAlbumTrack | undefined {

        let index = trackList.findIndex((t) => t.id === currentTrack?.id)
        const old_index = index

        index += delta
        index = index >= trackList.length ? 0 : index
        index = index < 0 ? trackList.length - 1 : index

        if (!loopAlbum && index != old_index + delta) {
            // we reached the "end"
            console.log("compute_next_track : returning undefined.")
            return undefined;
        }

        const t = trackList[index];
        console.log("compute_next_track : returning id =", t.id)

        return t;
    }

    function onPlayEnd() {
        console.log("Playback ended")

        setAutoPlay((old) => {
            if (old) {
                const t = compute_next_track(1);
                playTrack(t);
                if (t === undefined)
                    return false;
            } else {
                playTrack(undefined);
            }
            return old;
        });
    }

    function onAutoPlay() {
        if (!autoPlay && !currentTrack) {
            // Start the album if not curently playing something.
            const t = trackList[0];
            playTrack(t);

        }

        setAutoPlay((old) => !old)
    }

    function onNext() {
        if (autoPlay) {
            const t = compute_next_track(1);
            playTrack(t);
        } else {
            playTrack(undefined)
        }

    }

    function onPrevious() {
        if (autoPlay) {
            const t = compute_next_track(-1);
            playTrack(t);
        } else {
            playTrack(undefined)
        }

    }

    function changeLoop() {
        setLoopAlbum(!loopAlbum)
    }

    function add_track_to_queue(t: respAlbumTrack) {
        const new_item: QueueItem = {
            track_name: t.name,
            track_id: t.id,
            artist_name: artist?.name || '',
            artist_id: artist?.id || '',
            album_name: album?.name || undefined,
            cover_id: album?.cover || undefined,
            duration: t.duration,
        }
        const new_queue = [...queueList, new_item];
        SetQueueList(new_queue);
        setShowQueue(true);
        setQueueMsg("Track added to queue");
    }

    async function add_album_to_queue(album_id: string) {
        console.log(`- Adding album ${album_id} to Queue`)

        fetch(`/api/album/${album_id}`)
            .then(response => response.json()).then((data) => {

                const new_items: QueueItem[] = [];
                (data.tracks as respAlbumTrack[]).map((t: respAlbumTrack) => {
                    const new_item: QueueItem = {
                        track_name: t.name,
                        track_id: t.id,
                        artist_name: data.artist.name || '',
                        artist_id: data.artist.id || '',
                        cover_id: data.album.cover,
                        album_name: data.album.name,
                        album_id: data.album.id,
                        duration: t.duration
                    }
                    new_items.push(new_item)
                })
                const new_queue = [...queueList, ...new_items];
                SetQueueList(new_queue);
                setShowQueue(true);
                setQueueMsg('Album added to queue');
            });
    }


    function onOpenChange(open: boolean) {
        setShowQueue(open);
    }

    const flex_dir_class = ((window.screen.width > 700) && currentTrack) ? 'flex-dir-row gap-3' : 'flex-dir-col';

    return (<>
        <SuccessPopup show={showQueue} message={queueMsg} onOpenChange={onOpenChange} />

        <Flex dir='col' className="justify-content-center align-items-center">
            <Flex className={flex_dir_class}>
            <div className="coverBlock mt-2 mb-2">
                {coverId && <img src={`/api/cover/full/${coverId}`} width={300} height={300} />}
            </div>
            <Flex dir='col'>
                <div>
                    <span className="fw-bold fs-4">{album?.name}</span>
                </div>
                <div className="artistBlock">
                    <span>{artist?.name}</span>
                </div>
            </Flex>
            </Flex>
            <Player2 track={currentTrack}
                onEnd={onPlayEnd}
                onPrevious={onPrevious}
                onNext={onNext} />

            <table className="table striped w-100 mb-5">
                <thead>
                    <tr>
                        <th colSpan={4}>
                            <Flex gap={2} className='justify-content-center'>
                                <button className="button vrnt-danger me-5" disabled={!currentTrack}
                                    onClick={() => setCurrentTrack(undefined)} >Stop</button>
                                <Toggle state={autoPlay} title="Auto" onStateChange={onAutoPlay} />
                                <Toggle title="Loop" state={loopAlbum} onStateChange={changeLoop} />
                                <button className="button vrnt-brand ms-5"
                                    onClick={() => add_album_to_queue(album_id)}>Queue
                                </button>
                            </Flex>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {trackList && trackList.map(t => <tr
                        className={t.id === currentTrack?.id ? 'bg-mid' : ''} key={t.id}>
                        <td className="album-tracks-play-cell">
                            {t.id === currentTrack?.id ?
                                '>>>' :
                                <a onClick={() => playTrack(t)} className="album-tracks-play-link">
                                    <PlayIcon/>
                                </a>}
                        </td>
                        <td className="album-tracks-time-cell">{formatTime(t.duration)}</td>
                        <td><a onClick={() => playTrack(t)}>{t.name}</a></td>
                        <td className="album-tracks-menu-cell">
                            <QueuePopupMenu>
                                <a href="#" className="bare-link hover-underline" onClick={() => add_track_to_queue(t)}> Add Track to Queue </a>
                            </QueuePopupMenu>
                        </td>
                    </tr>)}
                </tbody>
            </table>

        </Flex>

    </>)

}