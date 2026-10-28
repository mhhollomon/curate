import { useAtom } from "jotai";
import { Fragment, useState } from "react";
import { Button, Overlay, Popover, Table } from "react-bootstrap";
import { Link } from "wouter";
import { queueListAtom } from "~/atoms";
import Player2, { type PlayerTrackData } from './Player2'
import { play_btn_fill, three_dots_vert } from "~/icons";
import { useProtectedData } from "~/lib/hook";
import type { ArtistWorks } from "~/types/artist";
import type { QueueItem } from "~/types/queue_item";
import type { Track } from "~/types/track";

export interface ArtistWorksProps {
    artist_id: string;
}

export default function ArtistWorks({ artist_id }: ArtistWorksProps) {
    const [artistWorks, setArtistWorks] = useState<ArtistWorks | undefined>(undefined)
    const [currentTrack, setCurrentTrack] = useState<PlayerTrackData>();

    const [show, setShow] = useState<string>();
    const [target, setTarget] = useState(null);

    const [queueList, SetQueueList] = useAtom(queueListAtom)

    useProtectedData({
        url: `/api/artist/${artist_id}`,
        data_proc: (data) => {
            setArtistWorks(data)
        }
    })


    function playTrack(t: Track) {
        setCurrentTrack(track2player_data(t));

    }

    function handleStop() {
        setCurrentTrack(undefined);
    }

    function showPopover(e: any, id: string) {
        if (show === id)
            setShow(undefined);
        else {
            setShow(id);
            setTarget(e.target);
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
    }

    function track2player_data(t: Track) : PlayerTrackData {
        return { 'id': t.id,
                'src' : `/api/play/${t.id}`,
                'artist' : artistWorks?.artist.name || '',
                'cover' : undefined,
                'album' : undefined,
                'name': t.name };
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
        setTarget(null);
    }


    return (<>
        <div className="container d-flex flex-column justify-content-center align-items-center">
            <div className="artistBlock">
                <span className="fs-3">{artistWorks?.artist.name}</span>
            </div>

            <Player2 track={currentTrack}
                onEnd={undefined}
                onPrevious={undefined} onNext={undefined} />

            {artistWorks && artistWorks.singles.length > 0 && <Table striped>
                <thead>
                    <tr>
                        <th colSpan={3}><span className="fs-4">Singles</span></th>
                    </tr>
                    <tr>
                        <th>&nbsp;<Button onClick={handleStop}>Stop</Button></th>
                        <th>track</th>
                        <th>&nbsp;</th>
                    </tr>
                </thead>
                <tbody>
                    {artistWorks && artistWorks.singles.length > 0 && artistWorks.singles.map(s => <Fragment key={s.id}>
                        <tr key={s.id+'-s'}>
                            <td style={{ width: '2rem' }}>{s.id === currentTrack?.id ? '>>>' : <a onClick={() => playTrack(s)}>{play_btn_fill}</a>}</td>
                            <td><a onClick={() => playTrack(s)}>{s.name}</a></td>
                            <td><a className="bare-link" onClick={(e) => showPopover(e, s.id)}>{three_dots_vert}</a></td>
                        </tr>
                        <Overlay show={show == s.id} target={target} placement="bottom-end">
                            <Popover.Body>
                                <div className="mx-1">
                                    <a className="bare-link" onClick={() => add_single_to_queue(s)}>Add to Queue</a>
                                </div>
                            </Popover.Body>
                        </Overlay>
                    </Fragment>

                    )}
                </tbody>
            </Table>}

            {artistWorks && artistWorks.albums.length > 0 && <Table striped>
                <thead>
                    <tr>
                        <th colSpan={3}><span className="fs-4">Albums</span></th>
                    </tr>
                    <tr>
                        <th>&nbsp;</th>
                        <th>album</th>
                        <th>&nbsp;</th>
                    </tr>
                </thead>
                <tbody>
                    {artistWorks && artistWorks.albums.length > 0 && artistWorks.albums.map(a => { return <Fragment key={a.id}>
                        <tr key={a.id + '-a'}>
                            <td style={{ width: '2rem' }}>&nbsp;</td>
                            <td><Link href={`/album/${a.id}`}>{a.name}</Link></td>
                            <td><a className="bare-link" onClick={(e) => showPopover(e, a.id)}>{three_dots_vert}</a></td>
                        </tr>
                        <Overlay key={a.id + "-o"} show={show == a.id} target={target} placement="bottom-end">
                            <Popover.Body>
                                <div className="mx-1">
                                    <a className="bare-link" onClick={() => add_album_to_queue(a.id)}>Add to Queue</a>
                                </div>
                            </Popover.Body>
                        </Overlay>
                    </Fragment>}
                    )}
                </tbody>
            </Table>}

        </div>


    </>)
}