import { useAtom } from "jotai"
import { queueListAtom } from "~/atoms"
import CoverImage from "./CoverImage"
import Player2, { type PlayerTrackData } from './Player2'

import type { QueueItem } from "~/types/queue_item"
import { useState } from "react"
import { trash3 } from "~/icons"
import { Link } from "wouter"
import Flex from "~/components/bulma/flex"
import Icon from "~/components/Icon"

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

        <table className="table is-striped is-fullwidth mb-5">
            <thead>
                <tr>
                    <th colSpan={6}>
                        <Flex gap={2} className='is-justify-content-center'>
                            <button className="button is-primary" onClick={play_stop} disabled={queueList.length == 0}>{button_text}</button>
                            <button className="button is-primary" onClick={clear_queue} disabled={queueList.length == 0}>Clear Queue</button>
                        </Flex>
                    </th>
                </tr>
                <tr>
                    <th style={{ width: '3em' }}>&nbsp;</th>
                    <th style={{ width: '5em' }}>&nbsp;</th>
                    <th className="has-text-centered">Name</th>
                    <th className="has-text-centered">Artist</th>
                    <th className="has-text-centered">Album</th>
                    <th>&nbsp;</th>
                </tr>
            </thead>
            <tbody>
                {queueList.map((t) =>
                    <tr className={t.track_id === currentTrack?.track_id ? 'has-background-grey-lighter' : ''} key={t.track_id}>
                        <td>{t.cover_id ? <CoverImage cover_id={t.cover_id} /> : <>&nbsp;</>}</td>
                        <td>{formatTime(t.duration || 0)}</td>
                        <td>{t.track_name}</td>
                        <td><Link href={`/artist/${t.artist_id}`}>{t.artist_name}</Link></td>
                        <td>{t.album_name || ''}</td>
                        <td>
                            {t.track_id === currentTrack?.track_id ?
                                <>&nbsp;</> :
                                <a className="bare_link" onClick={()=>{handleRemove(t.track_id)}}><Icon size="1.5em" icon={trash3} /></a>
                            }
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
    </>)
}