import { useAtom } from "jotai";
import { useState } from "react";
import { Link } from "wouter";
import { queueListAtom } from "~/atoms";
import Player2, { type PlayerTrackData } from './Player2'
import { play_btn_fill } from "~/icons";
import { useProtectedData } from "~/lib/hook";
import type { ArtistWorks } from "~/types/artist";
import type { QueueItem } from "~/types/queue_item";
import type { Track } from "~/types/track";
import { formatTime } from "~/lib/utils";
import Flex from "~/framework/components/flex";
import Icon from "~/framework/components/Icon";
import QueuePopupMenu from "~/components/QueuePopupMenu";
import SuccessPopup from "~/components/SuccessPopup";

export interface ArtistWorksProps {
    artist_id: string;
}

export default function ArtistWorks({ artist_id }: ArtistWorksProps) {
    const [artistWorks, setArtistWorks] = useState<ArtistWorks | undefined>(undefined)
    const [currentTrack, setCurrentTrack] = useState<PlayerTrackData>();

    const [queueList, SetQueueList] = useAtom(queueListAtom)

    const [showQueue, setShowQueue] = useState(false);
    const [queueMsg, setQueueMsg] = useState<string>('');

    useProtectedData({
        url: `/api/artist/${artist_id}`,
        data_proc: (data) => {
            setArtistWorks(data)
        }
    });


    function playTrack(t: Track) {
        setCurrentTrack(track2player_data(t));

    }

    function handleStop() {
        setCurrentTrack(undefined);
    }

    function add_single_to_queue(t: Track) {
        const new_item = {
            track_name: t.name,
            track_id: t.id,
            artist_name: artistWorks?.artist.name || '',
            artist_id: artistWorks?.artist.id || '',
            duration: t.duration,
        }
        const new_queue = [...queueList, new_item];
        SetQueueList(new_queue)
        setShowQueue(true);
        setQueueMsg('Single added to queue');
    }

    function onOpenChange(open: boolean) {
        setShowQueue(open);
    }

    function track2player_data(t: Track): PlayerTrackData {
        return {
            'id': t.id,
            'src': `/api/play/${t.id}`,
            'artist': artistWorks?.artist.name || '',
            'cover': undefined,
            'album': undefined,
            'name': t.name
        };
    }

    async function add_album_to_queue(album_id: string) {
        console.log(`- Adding album ${album_id} to Queue`)

        const data = await fetch(`/api/album/${album_id}`)
            .then(response => response.json());

        const new_items: QueueItem[] = []
        data.tracks.map((t: any) => {
            const new_item = {
                track_name: t.name,
                track_id: t.id,
                artist_name: data.artist.name || '',
                artist_id: data.artist.id || '',
                cover_id: data.album.cover,
                album_name: data.album.name,
                album_id: data.album.id,
                duration: t.duration,
            }
            new_items.push(new_item)
        })
        const new_queue = [...queueList, ...new_items];
        SetQueueList(new_queue);
        setShowQueue(true);
        setQueueMsg('Album added to queue');
        setTimeout(() => {
            console.log('timeout expired');
            setShowQueue(false);
        }, 2500);
    }


    return (<>
        <Flex dir="column" className="justify-content-center align-items-center">
            <SuccessPopup show={showQueue} message={queueMsg} onOpenChange={onOpenChange} />

            <div className="artistBlock">
                <span className="has-text-black fs-3">{artistWorks?.artist.name}</span>
            </div>

            <Player2 track={currentTrack}
                onEnd={undefined}
                onPrevious={undefined} onNext={undefined} />

            {artistWorks && artistWorks.singles.length > 0 && <table className="table is-striped w-100">
                <thead>
                    <tr>
                        <th colSpan={4}><span className="fs-4">Singles</span></th>
                    </tr>
                    <tr>
                        <th>&nbsp;<button className="button vrnt-brand is-small" onClick={handleStop}>Stop</button></th>
                        <th>&nbsp;</th>
                        <th className="txt-center">track</th>
                        <th>&nbsp;</th>
                    </tr>
                </thead>
                <tbody>
                    {artistWorks && artistWorks.singles.length > 0 && artistWorks.singles.map(s =>
                        <tr className={s.id === currentTrack?.id ? 'has-background-grey-lighter' : ''} key={s.id + '-s'}>
                            <td style={{ width: '2rem' }}>{s.id === currentTrack?.id ? '>>>' : <a onClick={() => playTrack(s)}><Icon size="1.5em" icon={play_btn_fill} /></a>}</td>
                            <td style={{ width: '5rem' }}>{formatTime(s.duration)}</td>
                            <td><a onClick={() => playTrack(s)}>{s.name}</a></td>
                            <td>
                                <QueuePopupMenu>
                                    <a className="bare-link hover-underline" onClick={() => add_single_to_queue(s)}>Add Single to Queue</a>
                                </QueuePopupMenu>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>}

            {artistWorks && artistWorks.albums.length > 0 && <table className="table is-striped w-100">
                <thead>
                    <tr>
                        <th colSpan={3}><span className="fs-4">Albums</span></th>
                    </tr>
                    <tr>
                        <th>&nbsp;</th>
                        <th className="txt-center">album</th>
                        <th>&nbsp;</th>
                    </tr>
                </thead>
                <tbody>
                    {artistWorks && artistWorks.albums.length > 0 && artistWorks.albums.map(a => {
                        return (
                            <tr key={a.id + '-a'}>
                                {a.cover ? <td><img src={`/api/cover/thumb/${a.cover}`} width={30} height={30} /></td> : <td><span>&nbsp;</span></td>}
                                <td><Link href={`/album/${a.id}`}>{a.name}</Link></td>
                                <td>
                                    <QueuePopupMenu>
                                        <a className="bare-link hover-underline" onClick={() => add_album_to_queue(a.id)}>Add Album to Queue</a>
                                    </QueuePopupMenu>
                                </td>
                            </tr>
                        )
                    }
                    )}
                </tbody>
            </table>}

        </Flex>


    </>)
}