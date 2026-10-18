import { useState } from "react";
import { Table } from "react-bootstrap";
import { type Artist } from "~/types/artist";

import { useProtectedData } from "~/lib/hook";
import { Link, useLocation } from "wouter";
import { useSetAtom } from "jotai";
import { backURLAtom } from "~/atoms";

export default function ArtistList() {
    const [artistList, setArtistList] = useState<Artist[] | undefined>(undefined)
    const [location,] = useLocation()
    const setBackURL = useSetAtom(backURLAtom)

    useProtectedData({ url: '/api/artist',
        data_proc : (data) => {
                if (data.length > 1) {
                    setArtistList((data as Artist[]).filter(x => x.id !== '--unknown--'))
                }

    }})

    function setBackLink() {
        setBackURL(location)
    }


return <>

    <Table striped>
        <thead>
            <tr><th>name</th></tr>
        </thead>
        <tbody>
            {artistList && artistList.map(a => <tr key={a.id}><td><Link href={`/artist/${a.id}`} onClick={setBackLink}>{a.name}</Link></td></tr>)}
        </tbody>
    </Table>

</>
}