import { useEffect, useState } from "react"
import { Table } from "react-bootstrap"
import { type Album } from "../types/album"

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
            <th>name</th>
            <th>artist</th>
        </thead>
        <tbody>
            {albumList && albumList.map(a => <tr key={a.id}><td>{a.name}</td><td>{a.artist_name}</td></tr>)}
        </tbody>
    </Table>

</>
}