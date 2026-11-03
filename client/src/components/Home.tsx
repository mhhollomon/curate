import ArtistList from './ArtistList';
import AlbumList from './AlbumList';
import NavBar from '~/components/NavBar';
import Queue from '~/components/Queue';

export interface HomeScreenProps {
    tab : string
}
export default function HomeScreen({tab} : HomeScreenProps) {


    return <>
            <NavBar active={tab} />

            {tab === 'artists' && <ArtistList/>}
            {tab === 'albums' && <AlbumList/>}
            {tab === 'queue' && <Queue />}

        </>;
}