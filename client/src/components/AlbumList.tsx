import { useEffect, useState } from "react";
import { Table } from "react-bootstrap";
import { type Album } from "~/types/album";
import { Link } from "wouter";
import { useProtectedData } from "~/lib/hook";
import * as rad from 'radashi';

import { arrow_down, arrow_up } from "~/icons";

import './AlbumList.css'

interface sorting {
    column: string;
    upward: boolean;
}

export default function AlbumList() {
    const [albumList, setAlbumList] = useState<Album[] | undefined>(undefined);
    const [sortStatus, setSortStatus] = useState<sorting>({ column: "name", upward: true });

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

    function calc_icon(col : string) {
        if (sortStatus.column === col) {
            return sortStatus.upward ? arrow_up : arrow_down;

        } else {
            return <>&nbsp;</>
        }

    }

    function sort_change(col : string) {
        const new_sort = {...sortStatus, column : col};
        if (sortStatus.column == col) {
            new_sort.upward = ! new_sort.upward;
        } else {
            new_sort.upward = true;
        }

        setSortStatus(new_sort)

    }

    return <>

        <Table striped>
            <thead>
                <tr>
                    <th></th>
                    <th><a className="bare-link" onClick={() => sort_change('name')}>name&nbsp;{calc_icon('name')}</a></th>
                    <th><a className="bare-link" onClick={() => sort_change('artist')}>artist&nbsp;{calc_icon('artist')}</a></th>
                </tr>
            </thead>
            <tbody>
                {albumList && albumList.map(a => <tr key={a.id}>
                    {a.cover ? <td><img src={`/api/cover/thumb/${a.cover}`} width={30} height={30} /></td> : <td><span>&nbsp;</span></td>}
                    <td><Link href={`/album/${a.id}`}>{a.name}</Link></td>
                    <td><Link href={`/artist/${a.artist_id}`}>{a.artist_name}</Link></td>
                </tr>)}
            </tbody>
        </Table>

    </>
}