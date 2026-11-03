import './NavBar.css';


import { Link } from "wouter";


export default function NavBar({active}: { active : string}) {
    function classes(t : string) {
        return t === active ? 'active-nav is-size-4' : 'nonactive is-size-5'
    }

    return (
        <nav className="curate">
            <Link className={classes('artists')} href="/artists">Artists</Link>
            <Link className={classes('albums')} href="/albums">Albums</Link>
            <Link className={classes('queue')} href="/queue">Queue</Link>
        </nav>
    );
}