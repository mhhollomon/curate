import './Album.css'

import { useEffect, useState } from "react"

import { type respAlbumAlbum, type respAlbumArtist, type respAlbumTrack } from '~/responses'
import Player2, { type PlayerTrackData } from './Player2'
import Toggle from './Toggle'

import { play_btn_fill } from '~/icons'

import { useProtectedData } from "~/lib/hook"
import { formatTime } from "~/lib/utils";
import Flex from '~/components/bulma/flex'
import Icon from '~/components/Icon'
import QueuePopupMenu from '~/components/QueuePopupMenu'
import { DropdownMenu } from "radix-ui";
import { useAtom } from 'jotai'
import { queueListAtom } from '~/atoms'
import type { QueueItem } from '~/types/queue_item'
import SuccessPopup from '~/components/SuccessPopup'


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
        url : '/api/album/' + album_id,
        data_proc : (data) => {
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
        if (! t) {
            setCurrentTrack(undefined);
        } else {
            setCurrentTrack(track2player_data(t));
        }

    }

    function track2player_data(t: respAlbumTrack) : PlayerTrackData {
        return { 'id': t.id,
                'src' : `/api/play/${t.id}`,
                'artist' : artist?.name || '',
                'cover' : `/api/cover/media/${coverId}`,
                'album' : album?.name,
                'name': t.name };
    }


    function compute_next_track(delta: number = 1) : respAlbumTrack | undefined {

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
        if (autoPlay) {
            const t = compute_next_track(1);
            playTrack(t);
            if (t === undefined)
                setAutoPlay(false);
        } else {
            playTrack(undefined);
        }
    }

    function onAutoPlay() {
        if (! autoPlay && ! currentTrack) {
            // Start the album if not curently playing something.
            const t = trackList[0];
            playTrack(t);

        }

        setAutoPlay(! autoPlay)
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
        setLoopAlbum(! loopAlbum)
    }

    function add_track_to_queue(t: respAlbumTrack) {
        const new_item : QueueItem = {
            track_name: t.name,
            track_id: t.id,
            artist_name: artist?.name || '',
            artist_id: artist?.id || '',
            album_name : album?.name || undefined,
            cover_id : album?.cover || undefined,
            duration : t.duration,
        }
        const new_queue = [...queueList, new_item];
        SetQueueList(new_queue);
        setShowQueue(true);
        setQueueMsg("Track added to queue");
    }

    function onOpenChange(open : boolean) {
        setShowQueue(open);
    }

    return (<>
        <SuccessPopup show={showQueue} message={queueMsg} onOpenChange={onOpenChange} />

        <Flex className="is-flex-direction-column is-justify-content-center is-align-items-center">
            <div className="coverBlock mt-2 mb-2">
                {coverId && <img src={`/api/cover/full/${coverId}`} width={300} height={300} />}
            </div>
            <div>
                <span className="has-text-weight-bold is-size-4 has-text-black">{album?.name}</span>
            </div>

            <div className="artistBlock">
                <span className="has-text-black">{artist?.name}</span>
            </div>

            <Player2 track={currentTrack}
                onEnd={onPlayEnd}
                onPrevious={onPrevious}
                onNext={onNext} />

            <table className="table is-striped is-fullwidth mb-5">
                <thead>
                    <tr>
                        <th colSpan={4}>
                            <Flex gap={2} className='is-justify-content-center'>
                                <Toggle state={autoPlay} title="Auto" onStateChange={onAutoPlay} />
                                <Toggle title="Loop" state={loopAlbum} onStateChange={changeLoop} />
                            </Flex>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {trackList && trackList.map(t => <tr
                            className={t.id === currentTrack?.id ? 'has-background-grey-lighter' : ''} key={t.id}>
                        <td style={{ width: '2rem' }}>{t.id === currentTrack?.id ? '>>>' : <a onClick={() => playTrack(t)}><Icon size="1.5em" icon={play_btn_fill} /></a>}</td>
                        <td style={{ width: '5rem' }}>{formatTime(t.duration)}</td>
                        <td><a onClick={() => playTrack(t)}>{t.name}</a></td>
                        <td>
                            <QueuePopupMenu>
                                <DropdownMenu.Item>
                                    <a href="#" className="bare-link hover-underline has-text-black" onClick={() => add_track_to_queue(t)}> Add Track to Queue </a>
                                </DropdownMenu.Item>
                            </QueuePopupMenu>
                        </td>
                    </tr>)}
                </tbody>
            </table>

        </Flex>

    </>)

}