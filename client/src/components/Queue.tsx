import { useAtom } from "jotai"
import { Button, Table } from "react-bootstrap"
import { queueListAtom } from "~/atoms"
import CoverImage from "./CoverImage"
import ForwardLink from "~/components/ForwardLink"
import Player from "~/components/Player"
import type { QueueItem } from "~/types/queue_item"
import { useState } from "react"


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

    const track_name = currentTrack?.track_name || '';
    const playSrc = currentTrack ? `/api/play/${currentTrack.track_id}` : null;
    const button_text = currentTrack ? 'Stop' : 'Play';

    return (<>
        <Player src={playSrc} name={track_name} album={currentTrack?.album_name}
            artist={currentTrack?.artist_name || "unknown"} cover={currentTrack?.cover_id}
            onEnd={next_song}
            onPrevious={undefined} onNext={next_song} />

        <Table striped>
            <thead>
                <tr>
                    <th colSpan={4}>
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
                    <tr>
                        <td>{t.cover_id ? <CoverImage cover_id={t.cover_id} /> : <>&nbsp;</>}</td>
                        <td>{t.track_name}</td>
                        <td><ForwardLink href={`/artist/${t.artist_id}`} title={t.artist_name} /></td>
                        <td>{t.album_name || ''}</td>
                    </tr>
                )}
            </tbody>
        </Table>
    </>)
}