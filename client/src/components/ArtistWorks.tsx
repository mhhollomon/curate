import { useAtom } from "jotai";
import { useRef, useState } from "react";
import { Link } from "wouter";
import { queueListAtom } from "~/atoms";
import Player2, { type PlayerTrackData } from './Player2'
import { play_btn_fill, three_dots_vert } from "~/icons";
import { useProtectedData } from "~/lib/hook";
import type { ArtistWorks } from "~/types/artist";
import type { QueueItem } from "~/types/queue_item";
import type { Track } from "~/types/track";
import { formatTime } from "~/lib/utils";
import Flex from "~/components/bulma/flex";

export interface ArtistWorksProps {
    artist_id: string;
}

export default function ArtistWorks({ artist_id }: ArtistWorksProps) {
    const [artistWorks, setArtistWorks] = useState<ArtistWorks | undefined>(undefined)
    const [currentTrack, setCurrentTrack] = useState<PlayerTrackData>();

    const [show, setShow] = useState<string>();

    const [queueList, SetQueueList] = useAtom(queueListAtom)

    const noteRef = useRef<HTMLDivElement|null>(null);

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

    function showPopover(id: string) {
        if (show === id) {
            setShow(undefined);
        } else {
            console.log(`showing ${id}`)
            setShow(id);
        }
    }

    function add_single_to_queue(t: Track) {
        const new_item = {
            track_name: t.name,
            track_id: t.id,
            artist_name: artistWorks?.artist.name || '',
            artist_id: artistWorks?.artist.id || '',
        }
        const new_queue = [...queueList, new_item];
        SetQueueList(new_queue)
        setShow(undefined)
        if (noteRef.current) {
            noteRef.current.classList.remove('no-display');
            setTimeout(() => {
                console.log('timeout expired')
                if (noteRef.current)
                    noteRef.current.classList += ' no-display';
            }, 3000);
        }
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
                album_id: data.album.id
            }
            new_items.push(new_item)
        })
        const new_queue = [...queueList, ...new_items];
        SetQueueList(new_queue);
        setShow(undefined);
        if (noteRef.current) {
            noteRef.current.classList.remove('no-display');
            setTimeout(() => {
                console.log('timeout expired')
                if (noteRef.current)
                    noteRef.current.classList += ' no-display';
            }, 3000);
        }
    }


    return (<>
        <Flex dir="column" className="justify-content-center align-items-center">
            <div className="notification no-display queue-note has-background-success m-1 p-1" ref={noteRef}>Album added to queue</div>

            <div className="artistBlock">
                <span className="has-text-black is-size-3">{artistWorks?.artist.name}</span>
            </div>

            <Player2 track={currentTrack}
                onEnd={undefined}
                onPrevious={undefined} onNext={undefined} />

            {artistWorks && artistWorks.singles.length > 0 && <table className="table is-striped is-fullwidth">
                <thead>
                    <tr>
                        <th colSpan={4}><span className="is-size-4">Singles</span></th>
                    </tr>
                    <tr>
                        <th>&nbsp;<button className="button is-primary is-small" onClick={handleStop}>Stop</button></th>
                        <th colSpan={2} className="has-text-centered">track</th>
                        <th>&nbsp;</th>
                    </tr>
                </thead>
                <tbody>
                    {artistWorks && artistWorks.singles.length > 0 && artistWorks.singles.map(s =>
                        <tr key={s.id + '-s'}>
                            <td style={{ width: '2rem' }}>{s.id === currentTrack?.id ? '>>>' : <a onClick={() => playTrack(s)}>{play_btn_fill}</a>}</td>
                            <td style={{ width: '5rem' }}>{formatTime(s.duration)}</td>
                            <td><a onClick={() => playTrack(s)}>{s.name}</a></td>
                            <td>
                                <div className={"dropdown" + (show === s.id ? ' is-active' : '')}>
                                    <div className="dropdown-trigger">
                                        <a className="bare-link" onClick={() => showPopover(s.id)} aria-haspopup="true" aria-controls={"dropdown-menu-" + s.id}>{three_dots_vert}</a>
                                    </div>
                                    <div className={"dropdown-menu"} id={"dropdown-menu-" + s.id} role="menu">
                                        <div className={"dropdown-content"}>
                                            <a href="#" className="dropdown-item" onClick={() => add_single_to_queue(s)}> Add Album to Queue </a>
                                        </div>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>}

            {artistWorks && artistWorks.albums.length > 0 && <table className="table is-striped is-fullwidth">
                <thead>
                    <tr>
                        <th colSpan={3}><span className="is-size-4">Albums</span></th>
                    </tr>
                    <tr>
                        <th>&nbsp;</th>
                        <th className="has-text-centered">album</th>
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
                                    <div className={"dropdown" + (show === a.id ? ' is-active' : '')}>
                                        <div className="dropdown-trigger">
                                            <a className="bare-link" onClick={() => showPopover(a.id)} aria-haspopup="true" aria-controls={"dropdown-menu-" + a.id}>{three_dots_vert}</a>
                                        </div>
                                        <div className={"dropdown-menu"} id={"dropdown-menu-" + a.id} role="menu">
                                            <div className={"dropdown-content"}>
                                                <a href="#" className="dropdown-item" onClick={() => add_album_to_queue(a.id)}> Add Album to Queue </a>
                                            </div>
                                        </div>
                                    </div>
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