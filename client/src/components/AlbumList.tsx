import { Fragment, useEffect, useRef, useState} from "react";
import { type Album } from "~/types/album";
import { useProtectedData } from "~/lib/hook";
import * as rad from 'radashi';

import { arrow_down, arrow_up, three_dots_vert } from "~/icons";
import { useAtom } from "jotai";
import { queueListAtom } from "~/atoms";
import type { QueueItem } from "~/types/queue_item";
import { Link } from "wouter";
import SuccessPopup from "~/components/SuccessPopup";

interface sorting {
    column: string;
    upward: boolean;
}

export default function AlbumList() {
    const [albumList, setAlbumList] = useState<Album[] | undefined>(undefined);
    const [sortStatus, setSortStatus] = useState<sorting>({ column: "name", upward: true });

    const [show, setShow] = useState<string>();

    const [showQueue, setShowQueue] = useState(false);
    const [queueMsg, setQueueMsg] = useState<string>('');

    const [queueList, SetQueueList] = useAtom(queueListAtom)

    useProtectedData({
        url: '/api/album',
        data_proc: (data) => {
            if (data.length > 0) {
                setAlbumList((data as Album[]))
            }

        }
    })

    useEffect(() => {
        if (!albumList) return;

        let value = undefined;
        if (sortStatus.column === 'name') {
            value = (r: Album) => r.sort_name;
        } else {
            value = (r: Album) => r.artist_sort_name;
        }

        const new_list = rad.alphabetical(albumList, value, sortStatus.upward ? 'asc' : 'desc')
        setAlbumList(new_list)

    }, [sortStatus])

    function calc_icon(col: string) {
        if (sortStatus.column === col) {
            return sortStatus.upward ? arrow_up : arrow_down;

        } else {
            return <>&nbsp;</>
        }

    }

    function sort_change(col: string) {
        const new_sort = { ...sortStatus, column: col };
        if (sortStatus.column == col) {
            new_sort.upward = !new_sort.upward;
        } else {
            new_sort.upward = true;
        }

        setSortStatus(new_sort)

    }

    function showPopover(id: string) {
        if (show === id) {
            setShow(undefined);
        } else {
            console.log(`showing ${id}`)
            setShow(id);
        }
    }

    async function add_to_queue(album_id: string) {
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
        setShowQueue(true);
        setQueueMsg('Album added to queue');
        setTimeout(() => {
            console.log('timeout expired');
            setShowQueue(false);
        }, 3000);
    }


    return <>
        <SuccessPopup show={showQueue} message={queueMsg} />
        <table className="table is-striped is-fullwidth">
            <thead>
                <tr>
                    <th></th>
                    <th><a className="bare-link" onClick={() => sort_change('name')}>name&nbsp;{calc_icon('name')}</a></th>
                    <th><a className="bare-link" onClick={() => sort_change('artist')}>artist&nbsp;{calc_icon('artist')}</a></th>
                    <th>&nbsp;</th>
                </tr>
            </thead>
            <tbody>
                {albumList && albumList.map(a => <Fragment key={a.id}>
                    <tr key={a.id}>
                        {a.cover ? <td><img src={`/api/cover/thumb/${a.cover}`} width={30} height={30} /></td> : <td><span>&nbsp;</span></td>}
                        <td><Link href={`/album/${a.id}`}>{a.name}</Link></td>
                        <td><Link href={`/artist/${a.artist_id}`}>{a.artist_name}</Link></td>
                        <td>
                            <div className={"dropdown is-right" + (show === a.id ? ' is-active' : '')}>
                                <div className="dropdown-trigger">
                                <a className="bare-link" onClick={() => showPopover(a.id)} aria-haspopup="true" aria-controls={"dropdown-menu-" + a.id}>{three_dots_vert}</a>
                                </div>
                                <div className={"dropdown-menu"} id={"dropdown-menu-" + a.id} role="menu">
                                    <div className={"dropdown-content"}>
                                        <a href="#" className="dropdown-item" onClick={() => add_to_queue(a.id)}> Add Album to Queue </a>
                                    </div>
                                </div>
                            </div>
                        </td>

                    </tr>

                </Fragment>
                )}
            </tbody>
        </table>

    </>
}