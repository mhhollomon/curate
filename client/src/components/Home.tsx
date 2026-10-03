import {Nav } from 'react-bootstrap'

import ArtistList from './ArtistList';
import AlbumList from './AlbumList';

import { useLocation } from 'wouter';

export interface HomeScreenProps {
    tab : string
}
export default function HomeScreen({tab} : HomeScreenProps) {
    const [_, navigate] = useLocation()

    function onTabChange(key : string | null) {
        if (key && key !== tab) {
            navigate(`/${key}`)
        }


    }

    // Need to rethink this. Navigating on tab changes means both
    // tabs get rerender forcing two calls to the server.
    // Maybe switch to simple navigation bar.
    return <>
            <div className="container" >
                <Nav activeKey={tab} variant="pills"
                onSelect={onTabChange}>
                    <Nav.Link eventKey="artists">Artists</Nav.Link>
                    <Nav.Link eventKey="albums" >Albums</Nav.Link>
                    <Nav.Link eventKey="playlists" disabled>Playlists</Nav.Link>
                    <Nav.Link eventKey="queue" disabled>Queue</Nav.Link>
                </Nav>

                {tab === 'artists' && <ArtistList/>}
                {tab === 'albums' && <AlbumList/>}
            </div>
        </>
}