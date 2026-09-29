import { useEffect, useState } from "react"
import { Table } from "react-bootstrap"
import { type Artist } from "../types/artist"

export default function ArtistList() {
    const [artistList, setArtistList] = useState<Artist[] | undefined>(undefined)

    useEffect( () => {
        fetch(
            '/api/artist'
        ).then(
            response => response.json()
        ).then(
            data => {
                if (data.length > 1) {
                    setArtistList((data as Artist[]).filter(x => x.id !== '--unknown--'))
                }
            }
        )

    },[])

return <>

    <Table striped>
        <thead>
            <th>name</th>
        </thead>
        <tbody>
            {artistList && artistList.map(a => <tr key={a.id}><td>{a.name}</td></tr>)}
        </tbody>
    </Table>

</>
}