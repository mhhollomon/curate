import { useState } from "react";
import { type Artist } from "~/types/artist";

import { useProtectedData } from "~/lib/hook";
import { Link } from "wouter";

export default function ArtistList() {
    const [artistList, setArtistList] = useState<Artist[] | undefined>(undefined)

    useProtectedData({ url: '/api/artist',
        data_proc : (data) => {
                if (data.length > 1) {
                    setArtistList((data as Artist[]).filter(x => x.id !== '--unknown--'))
                }

    }})


return <>

    <table className="table is-striped is-fullwidth">
        <thead>
            <tr><th className="has-text-centered">name</th></tr>
        </thead>
        <tbody>
            {artistList && artistList.map(a => {
                return (
                <tr key={a.id}>
                    <td><Link href={`/artist/${a.id}`}>{a.name}</Link></td>
                </tr>

                );})}
        </tbody>
    </table>

</>
}