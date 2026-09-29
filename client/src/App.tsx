import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';

import { Tab, Tabs } from 'react-bootstrap'

import ArtistList from './components/ArtistList';
import AlbumList from './components/AlbumList';

function App() {

    return <>
        <div>
            <Tabs defaultActiveKey="artists">
                <Tab eventKey="artists" title="Artists">
                    <ArtistList/>
                </Tab>
                <Tab eventKey="album" title="Albums">
                    <AlbumList/>
                </Tab>
            </Tabs>
        </div>
    </>
}

export default App
