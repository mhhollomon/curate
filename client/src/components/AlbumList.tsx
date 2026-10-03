import { useEffect, useState } from "react"
import { Table } from "react-bootstrap"
import { type Album } from "../types/album"
import { Link } from "wouter"

export default function AlbumList() {
    const [albumList, setAlbumList] = useState<Album[] | undefined>(undefined)

    useEffect( () => {
        fetch(
            '/api/album'
        ).then(
            response => response.json()
        ).then(
            data => {
                if (data.length > 0) {
                    setAlbumList((data as Album[]))
                }
            }
        )

    },[])

return <>

    <Table striped>
        <thead>
            <tr><th>name</th>
            <th>artist</th>
            </tr>
        </thead>
        <tbody>
            {albumList && albumList.map(a => <tr key={a.id}>
                <td><Link href={`/album/${a.id}`}>{a.name}</Link></td>
                <td><Link href={`/artist/${a.artist_id}`}>{a.artist_name}</Link></td>
                </tr>)}
        </tbody>
    </Table>

</>
}