import { useEffect, useState } from "react";
import { type Artist } from "~/types/artist";

import { useProtectedData } from "~/lib/hook";
import { Link } from "wouter";

import * as rad from 'radashi';
import { arrow_down, arrow_up } from "~/icons";
import Icon from "~/framework/components/Icon";

export default function ArtistList() {
    const [artistList, setArtistList] = useState<Artist[] | undefined>(undefined);
    const[sortDir, setSortDir] = useState("up");

    useProtectedData({ url: '/api/artist',
        data_proc : (data) => {
                if (data.length > 1) {
                    setArtistList((data as Artist[]).filter(x => x.id !== '--unknown--'))
                }

    }});

    useEffect(() => {
        if (!artistList) return;

        const new_list = rad.alphabetical(artistList, (r) => r.sort_name, sortDir === 'up' ? 'asc' : 'desc')
        setArtistList(new_list)


    }, [sortDir]);

    function flipSort() {
        setSortDir((old) => old === 'up' ? 'down' : 'up' );
    }

    const sortIcon = sortDir === 'up' ?  arrow_up : arrow_down;

return <main>
    <h1 className="fs-2">Artist List</h1>

    <table className="table is-striped w-100">
        <thead>
            <tr><th className="txt-center fs-4 is-link" onClick={() => flipSort()}>name<Icon size="0.75em" icon={sortIcon}/></th></tr>
        </thead>
        <tbody>
            {artistList && artistList.map(a => {
                return (
                <tr key={a.id}>
                    <td><Link className="bare-link" href={`/artist/${a.id}`}>{a.name}</Link></td>
                </tr>

                );})}
        </tbody>
    </table>

</main>
}