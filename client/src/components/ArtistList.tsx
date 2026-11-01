import { useState } from "react";
import * as Table from "@radix-ui/themes/components/table";
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

    <Table.Root>
        <Table.Header>
            <Table.Row><Table.ColumnHeaderCell>name</Table.ColumnHeaderCell></Table.Row>
        </Table.Header>
        <Table.Body>
            {artistList && artistList.map(a => <Table.Row key={a.id}><Table.Cell><Link href={`/artist/${a.id}`}>{a.name}</Link></Table.Cell></Table.Row>)}
        </Table.Body>
    </Table.Root>

</>
}