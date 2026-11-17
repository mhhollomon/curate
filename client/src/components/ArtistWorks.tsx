import * as rad from 'radashi';

import { useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { queueListAtom } from "~/atoms";
import Player2, { type PlayerTrackData } from './Player2'
import { useProtectedData } from "~/lib/hook";
import type { ArtistWorks } from "~/types/artist";
import type { QueueItem } from "~/types/queue_item";
import type { Track } from "~/types/track";
import { formatTime } from "~/lib/utils";
import Flex from "~/framework/components/flex";
import QueuePopupMenu from "~/components/QueuePopupMenu";
import SuccessPopup from "~/components/SuccessPopup";
import PlayIcon from "~/components/PlayIcon";
import { arrow_down, arrow_up } from "~/icons";
import Icon from "~/framework/components/Icon";
import { type Album } from '~/types/album';
import { GCell, Grid, GRow } from '~/components/Grid';

export interface ArtistWorksProps {
    artist_id: string;
}

export default function ArtistWorks({ artist_id }: ArtistWorksProps) {
    const [artistWorks, setArtistWorks] = useState<ArtistWorks | undefined>(undefined)
    const [currentTrack, setCurrentTrack] = useState<PlayerTrackData>();

    const [albumSort, setAlbumSort] = useState('up');
    const [albumList, setAlbumList] = useState<Album[]|undefined>();

    const [singleSort, setSingleSort] = useState('up');
    const [singleList, setSingleList] = useState<Track[]|undefined>();

    const setQueueList = useSetAtom(queueListAtom)

    const [showQueue, setShowQueue] = useState(false);
    const [queueMsg, setQueueMsg] = useState<string>('');

    useProtectedData({
        url: `/api/artist/${artist_id}`,
        data_proc: (data) => {
            setArtistWorks(data);
            setAlbumList(data.albums);
            setSingleList(data.singles);
        }
    });


    useEffect(() => {
        if (!albumList || albumList.length < 1 ) return;

        const new_list = rad.alphabetical(albumList, (r) => r.sort_name, albumSort === 'up' ? 'asc' : 'desc');
        setAlbumList(new_list);


    }, [albumSort]);

    useEffect(() => {
        if (!singleList || singleList.length < 1 ) return;

        const new_list = rad.alphabetical(singleList, (r) => r.sort_name, singleSort === 'up' ? 'asc' : 'desc');
        setSingleList(new_list);


    }, [singleSort]);



    function playTrack(t: Track) {
        setCurrentTrack(track2player_data(t));
    }

    function flipAlbumSort() {
        setAlbumSort((old) => old === 'up' ? 'down' : 'up' );
    }

    function flipSingleSort() {
        setSingleSort((old) => old === 'up' ? 'down' : 'up' );
    }


    function handleStop() {
        setCurrentTrack(undefined);
    }

    function add_single_to_queue(t: Track) {
        const new_item = {
            track_name: t.name,
            track_id: t.id,
            artist_name: artistWorks?.artist.name || '',
            artist_id: artistWorks?.artist.id || '',
            duration: t.duration,
        }
        setQueueList('add', new_item);
        setShowQueue(true);
        setQueueMsg('Single added to queue');
    }

    function onOpenChange(open: boolean) {
        setShowQueue(open);
    }

    function track2player_data(t: Track): PlayerTrackData {
        return {
            'id': t.id,
            'src': `/api/play/${t.id}`,
            'artist': artistWorks?.artist.name || '',
            'cover': undefined,
            'album': undefined,
            'name': t.name
        };
    }

    async function add_album_to_queue(album_id: string) {
        console.log(`- Adding album ${album_id} to Queue`)

        const data = await fetch(`/api/album/${album_id}`)
            .then(response => response.json());

        const new_items: QueueItem[] = []
        data.tracks.map((t: any) => {
            const new_item = {
                track_name: t.name,
                track_id: t.id,
                artist_name: data.artist.name || '',
                artist_id: data.artist.id || '',
                cover_id: data.album.cover,
                album_name: data.album.name,
                album_id: data.album.id,
                duration: t.duration,
            }
            new_items.push(new_item)
        })
        setQueueList('add', new_items);
        setShowQueue(true);
        setQueueMsg('Album added to queue');
        setTimeout(() => {
            console.log('timeout expired');
            setShowQueue(false);
        }, 2500);
    }

    async function onEnd() {
        setCurrentTrack(undefined);
    }

    const sortIcon = albumSort === 'up' ?  arrow_up : arrow_down;
    const singleIcon = singleSort === 'up' ?  arrow_up : arrow_down;


    return (<>
        <Flex dir="column" className="justify-content-center align-items-center">
            <SuccessPopup show={showQueue} message={queueMsg} onOpenChange={onOpenChange} />

            <div className="artistBlock">
                <span className="fs-3">{artistWorks?.artist.name}</span>
            </div>

            <Player2 track={currentTrack}
                onEnd={onEnd}
                onPrevious={undefined} onNext={undefined} />

            {singleList && singleList.length > 0 &&
                <Grid columns={4} colspec="3em 5em 1fr 3em" className="striped">
                    <GRow header className="py-3 bd-bottom-2">
                        <GCell span={4} className='txt-center'>
                            <Flex className="justify-content-between">
                                <button className="btn vrnt-danger" disabled={!currentTrack} onClick={handleStop}>Stop</button>
                                <div className="fs-4 clickable" onClick={() => flipSingleSort()}>Singles<Icon size="0.75em" icon={singleIcon}/></div>
                                <div className="mx-5">&nbsp;</div>
                            </Flex>
                        </GCell>
                    </GRow>
                {singleList.map(s => (
                    <GRow className={ 'ps-2 py-2 bd-bottom-1' + (s.id === currentTrack?.id ? 'bg-mid' : '')} key={s.id + '-s'}>
                        <GCell className="album-tracks-play-cell">{s.id === currentTrack?.id ?
                            '>>>' :
                            <a className='album-tracks-play-link' onClick={() => playTrack(s)}><PlayIcon /></a>}
                        </GCell>
                        <GCell className="album-tracks-time-cell">{formatTime(s.duration)}</GCell>
                        <GCell><a className="bare-link" onClick={() => playTrack(s)}>{s.name}</a></GCell>
                        <GCell>
                            <QueuePopupMenu>
                                <a className="bare-link hover-underline" onClick={() => add_single_to_queue(s)}>Add Single to Queue</a>
                            </QueuePopupMenu>
                        </GCell>
                    </GRow>))}
                </Grid>
            }


            {albumList && albumList.length > 0 &&
                <Grid columns={3} colspec="35px 1fr 3em" className="striped">
                    <GRow header className="py-3 bd-bottom-2">
                        <GCell span={3} className="txt-center fs-4 clickable" onClick={() => flipAlbumSort()}>Albums<Icon size="0.75em" icon={sortIcon}/></GCell>
                    </GRow>
                    {albumList.map(a => {
                        return (
                            <GRow className='ps-2 py-2 bd-bottom-1' key={a.id + '-a'}>
                                {a.cover ? <GCell><img src={`/api/cover/thumb/${a.cover}`} width={30} height={30} /></GCell> : <GCell><span>&nbsp;</span></GCell>}
                                <GCell><Link className="bare-link" href={`/album/${a.id}`}>{a.name}</Link></GCell>
                                <GCell>
                                    <QueuePopupMenu>
                                        <a className="bare-link hover-underline" onClick={() => add_album_to_queue(a.id)}>Add Album to Queue</a>
                                    </QueuePopupMenu>
                                </GCell>
                            </GRow>
                        )
                    }
                    )}
                </Grid>
            }

        </Flex>

    </>)
}