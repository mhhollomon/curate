import { useAtom } from "jotai"
import { Button, Table } from "react-bootstrap"
import { queueListAtom } from "~/atoms"
import CoverImage from "./CoverImage"
import Player2, { type PlayerTrackData } from './Player2'

import type { QueueItem } from "~/types/queue_item"
import { useState } from "react"
import { trash3 } from "~/icons"
import { Link } from "wouter"


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

        <Table striped>
            <thead>
                <tr>
                    <th colSpan={5}>
                        <div className='d-flex gap-2 justify-content-center'>
                            <Button onClick={play_stop} disabled={queueList.length == 0}>{button_text}</Button>
                            <Button onClick={clear_queue} disabled={queueList.length == 0}>Clear Queue</Button>
                        </div>
                    </th>
                </tr>
                <tr>
                    <th style={{ width: '3em' }}></th>
                    <th>Name</th>
                    <th>Artist</th>
                    <th>Album</th>
                </tr>
            </thead>
            <tbody>
                {queueList.map((t) =>
                    <tr key={t.track_id}>
                        <td>{t.cover_id ? <CoverImage cover_id={t.cover_id} /> : <>&nbsp;</>}</td>
                        <td>{t.track_name}</td>
                        <td><Link href={`/artist/${t.artist_id}`}>{t.artist_name}</Link></td>
                        <td>{t.album_name || ''}</td>
                        <td>
                            {t.track_id === currentTrack?.track_id ?
                                <>&nbsp;</> :
                                <a className="bare_link" onClick={()=>{handleRemove(t.track_id)}}>{trash3}</a>
                            }
                        </td>
                    </tr>
                )}
            </tbody>
        </Table>
    </>)
}