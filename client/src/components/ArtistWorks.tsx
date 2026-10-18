import { useEffect, useState } from "react";
import { Table } from "react-bootstrap";
import { Link } from "wouter";
import Player from "~/components/Player";
import { play_btn_fill } from "~/icons";
import { useProtectedData } from "~/lib/hook";
import type { ArtistWorks } from "~/types/artist";
import type { Track } from "~/types/track";

export interface ArtistWorksProps {
    artist_id: string;
}

interface playTrackData {
    id: string;
    name: string;
}

export default function ArtistWorks({ artist_id }: ArtistWorksProps) {
    const [artistWorks, setArtistWorks] = useState<ArtistWorks | undefined>(undefined)
    const [playSrc, setPlaySrc] = useState<string|null>(null)
    const [playTrackDataState, setPlayTrackData] = useState<playTrackData>()

    useProtectedData({
        url: `/api/artist/${artist_id}`,
        data_proc: (data) => {
            setArtistWorks(data)
        }
    })

    useEffect(() =>{
        if (!playTrackDataState) {
            console.log("useEffect - nulling out playSrc")
            setPlaySrc(null)
        } else {
            console.log("useEffect - updating playSrc")
            setPlaySrc(`/api/play/${playTrackDataState.id}`)
        }


    }, [playTrackDataState])


    function playTrack(t: Track) {
        setPlayTrackData({ 'id': t.id, 'name': t.name })

    }


    const track_name = playTrackDataState?.name || ''


    return (<>
        <div className="container d-flex flex-column justify-content-center align-items-center">
            <div className="artistBlock">
                <span className="fs-3">{artistWorks?.artist.name}</span>
            </div>

            <Player src={playSrc} name={track_name} album={undefined}
                artist={artistWorks?.artist.name || "unknown"} cover={undefined}
                onEnd={undefined}
                onPrevious={undefined} onNext={undefined} />

            {artistWorks && artistWorks.singles.length > 0 && <Table striped>
                <thead>
                    <tr>
                        <th colSpan={3}><span className="fs-4">Singles</span></th>
                    </tr>
                    <tr>
                        <th>&nbsp;</th>
                        <th>track</th>
                        <th>&nbsp;</th>
                    </tr>
                </thead>
                <tbody>
                    {artistWorks && artistWorks.singles.length > 0 && artistWorks.singles.map(a => <tr key={a.id}>
                        <td style={{ width: '2rem' }}>{a.id === playTrackDataState?.id ? '>>>' : <a onClick={() => playTrack(a)}>{play_btn_fill}</a>}</td>
                        <td><a onClick={() => playTrack(a)}>{a.name}</a></td>
                    </tr>)}
                </tbody>
            </Table>}

            {artistWorks && artistWorks.albums.length > 0 && <Table striped>
                <thead>
                    <tr>
                        <th colSpan={3}><span className="fs-4">Albums</span></th>
                    </tr>
                    <tr>
                        <th>&nbsp;</th>
                        <th>album</th>
                        <th>&nbsp;</th>
                    </tr>
                </thead>
                <tbody>
                    {artistWorks && artistWorks.albums.length > 0 && artistWorks.albums.map(a => <tr key={a.id}>
                        <td style={{ width: '2rem' }}>&nbsp;</td>
                        <td><Link href={`/album/${a.id}`}>{a.name}</Link></td>
                    </tr>)}
                </tbody>
            </Table>}

        </div>


    </>)
}