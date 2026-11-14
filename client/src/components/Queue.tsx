import { useAtom } from "jotai"
import { queueListAtom } from "~/atoms"
import CoverImage from "./CoverImage"
import Player2, { type PlayerTrackData } from './Player2'

import type { QueueItem } from "~/types/queue_item"
import { useState } from "react"
import { trash3 } from "~/icons"
import { Link } from "wouter"
import Flex from "~/framework/components/flex"
import Icon from "~/framework/components/Icon"

import { formatTime } from "~/lib/utils"


export default function Queue() {
    const [queueList, setQueueList] = useAtom(queueListAtom);
    const [currentTrack, setCurrentTrack] = useState<QueueItem>();

    function play_stop() {
        setCurrentTrack(currentTrack ? undefined : queueList[0]);
    }

    function next_song() {
        if (queueList.length > 1) {
            setCurrentTrack(queueList[1])
            const new_queue = queueList.slice(1);
            setQueueList(new_queue)

        } else {
            setCurrentTrack(undefined)
            setQueueList([]);
        }
    }

    function clear_queue() {
        setCurrentTrack(undefined);
        setQueueList([]);
    }

    function track2player_data(q: QueueItem) : PlayerTrackData {
        return { 'id': q.track_id,
                'src' : `/api/play/${q.track_id}`,
                'artist' : q.artist_name,
                'cover' : q.cover_id ? `/api/cover/media/${q.cover_id}` : undefined,
                'album' : q.album_name || undefined,
                'name': q.track_name
            };
    }


    function handleRemove(id : string) {
        console.log(`Removing ${id} from list`);
        const new_queue = queueList.filter(q => q.track_id !== id);
        setQueueList(new_queue);
    }


    const playSrc = currentTrack ? track2player_data(currentTrack) : undefined;
    const button_text = currentTrack ? 'Stop' : 'Play';

    return (<>
        <Player2 track={playSrc}
            onEnd={next_song}
            onNext={next_song}
            />

        <table className="table striped w-100 mb-5">
            <thead>
                <tr>
                    <th colSpan={6}>
                        <Flex gap={2} className='justify-content-center'>
                            <button className="button vrnt-brand" onClick={play_stop} disabled={queueList.length == 0}>{button_text}</button>
                            <button className="button vrnt-brand btn-icon-text" onClick={clear_queue} disabled={queueList.length == 0}>
                                <Icon icon={trash3} />Clear Queue</button>
                        </Flex>
                    </th>
                </tr>
                <tr>
                    <th style={{ width: '3em' }}>&nbsp;</th>
                    <th className="album-tracks-time-cell">&nbsp;</th>
                    <th className="txt-center">Name</th>
                    <th className="txt-center">Artist</th>
                    <th className="txt-center">Album</th>
                    <th>&nbsp;</th>
                </tr>
            </thead>
            <tbody>
                {queueList.map((t) =>
                    <tr className={t.track_id === currentTrack?.track_id ? 'bg-mid' : ''} key={t.track_id}>
                        <td>{t.cover_id ? <CoverImage cover_id={t.cover_id} /> : <>&nbsp;</>}</td>
                        <td className="album-tracks-time-cell">{formatTime(t.duration || 0)}</td>
                        <td>{t.track_name}</td>
                        <td><Link className="bare-link" href={`/artist/${t.artist_id}`}>{t.artist_name}</Link></td>
                        <td>{ t.album_id ?
                            <Link className="bare-link" href={`/album/${t.album_id}`}>{t.album_name}</Link> :
                            '&nbsp;'}
                        </td>
                        <td>
                            {t.track_id === currentTrack?.track_id ?
                                <>&nbsp;</> :
                                <a className="bare-link" onClick={()=>{handleRemove(t.track_id)}}><Icon size="1.1em" icon={trash3} /></a>
                            }
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
    </>)
}