import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';

import HomeScreen from './components/Home';
import Album from './components/Album';

import { Route, Redirect } from 'wouter';

export default function App() {
    return (<>
        <Route path="/" >
            <Redirect to="/artists" />
        </Route>
        <Route path="/artists" >
            <HomeScreen tab="artists" />
        </Route>
        <Route path="/albums" >
            <HomeScreen tab="albums" />
        </Route>
        <Route path="/album/:album_id">
            {params => <Album album_id={params.album_id}/>}
        </Route>
    </>)
}
