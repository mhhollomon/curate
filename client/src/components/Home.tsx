import * as TabNav from '@radix-ui/themes/components/tab-nav';
import { Link } from 'wouter';

import ArtistList from './ArtistList';
import AlbumList from './AlbumList';
import Queue from '~/components/Queue';

export interface HomeScreenProps {
    tab : string
}
export default function HomeScreen({tab} : HomeScreenProps) {

    return <>
            <div className="container" >
                <TabNav.Root >
                    <TabNav.Link active={tab === "artists"}><Link href="/artists">Artists</Link></TabNav.Link>
                    <TabNav.Link active={tab === "albums"} ><Link href="/albums">Albums</Link></TabNav.Link>
                    <TabNav.Link active={tab === "playlists"}>Playlists</TabNav.Link>
                    <TabNav.Link active={tab === "queue"}><Link href="/queue">Queue</Link></TabNav.Link>
                </TabNav.Root>

                {tab === 'artists' && <ArtistList/>}
                {tab === 'albums' && <AlbumList/>}
                {tab === 'queue' && <Queue />}
            </div>
        </>
}