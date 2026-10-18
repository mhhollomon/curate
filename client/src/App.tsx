import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';

import HomeScreen from '~/components/Home';
import Album from '~/components/Album';

import { Route, Redirect, useLocation } from 'wouter';
import Login from './components/Login';
import { useEffect, useState } from 'react';
import ArtistWorks from '~/components/ArtistWorks';

export default function App() {
    const [location, navigate] = useLocation()
    const [rerouted, setRerouted] = useState(false)

    useEffect(() => {
        console.log("--- Hash effect")
        console.log("location =", location)
        console.log("window location = ", window.location)
        const hash = window.location.hash;
        console.log("--- raw hash = ", hash)
        if (hash !== "" ) {
            let loc = hash.replace(/^#\/?/, '');
            loc = '/' + loc;
            console.log(`--- new loc = ${loc}`);
            navigate(loc, {replace : true})
        }

        setRerouted(true)

    }, [])
    return (rerouted && <>
        <Route path="/login" >
            <Login msg="Please Login"/>
        </Route>
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
        <Route path="/artist/:artist_id">
            {params => <ArtistWorks artist_id={params.artist_id}/>}
        </Route>
        <Route path="/queue">
            <HomeScreen tab="queue" />
        </Route>

    </>)
}
