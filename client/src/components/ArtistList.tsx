import { useState } from "react";
import { Table } from "react-bootstrap";
import { type Artist } from "../types/artist";

import { useProtectedData } from "../lib/hook";

export default function ArtistList() {
    const [artistList, setArtistList] = useState<Artist[] | undefined>(undefined)

    useProtectedData({ url: '/api/artist',
        data_proc : (data) => {
                if (data.length > 1) {
                    setArtistList((data as Artist[]).filter(x => x.id !== '--unknown--'))
                }

    }})

return <>

    <Table striped>
        <thead>
            <tr><th>name</th></tr>
        </thead>
        <tbody>
            {artistList && artistList.map(a => <tr key={a.id}><td>{a.name}</td></tr>)}
        </tbody>
    </Table>

</>
}