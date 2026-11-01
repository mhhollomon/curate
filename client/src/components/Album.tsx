import './Album.css'

import { useEffect, useState, type ReactNode } from "react"
import * as Table from "@radix-ui/themes/components/table"
import { Flex } from "@radix-ui/themes/components/flex";
import { Box } from "@radix-ui/themes/components/box";

import { type respAlbumAlbum, type respAlbumArtist, type respAlbumTrack } from '~/responses'
import Player2, { type PlayerTrackData } from './Player2'
import Toggle from './Toggle'

import { play_btn_fill } from '~/icons'

import { useProtectedData } from "~/lib/hook"
import { formatTime } from "~/lib/utils";


export interface AlbumProps {
    album_id: string
}

function Span({children, className } : { children : ReactNode, className? : string }) {
    return <Box as="span" className={className}>{children}</Box>
}

export default function Album({ album_id }: AlbumProps) {

    const [trackList, setTrackList] = useState<respAlbumTrack[]>([]);
    const [artist, setArtist] = useState<respAlbumArtist>()
    const [album, setAlbum] = useState<respAlbumAlbum>();;
    const [coverId, setCoverId] = useState<string>();
    const [autoPlay, setAutoPlay] = useState<boolean>(false);
    const [loopAlbum, setLoopAlbum] = useState<boolean>(false);

    const [currentTrack, setCurrentTrack] = useState<PlayerTrackData>();

    useProtectedData({
        url : '/api/album/' + album_id,
        data_proc : (data) => {
            const tracks = data.tracks
            if (tracks.length > 0) {
                setTrackList(tracks)
            }

            setArtist(data.artist as respAlbumArtist)

            setAlbum(data.album as respAlbumAlbum)

            console.log(JSON.stringify(data.album))
        }
    })


    useEffect(() => {
        if (album === undefined || album.cover === null) return;
        setCoverId(album.cover)
    }, [album])



    function playTrack(t: respAlbumTrack | undefined) {
        if (! t) {
            setCurrentTrack(undefined);
        } else {
            setCurrentTrack(track2player_data(t));
        }

    }

    function track2player_data(t: respAlbumTrack) : PlayerTrackData {
        return { 'id': t.id,
                'src' : `/api/play/${t.id}`,
                'artist' : artist?.name || '',
                'cover' : `/api/cover/media/${coverId}`,
                'album' : album?.name,
                'name': t.name };
    }


    function compute_next_track(delta: number = 1) : respAlbumTrack | undefined {

        let index = trackList.findIndex((t) => t.id === currentTrack?.id)
        const old_index = index

        index += delta
        index = index >= trackList.length ? 0 : index
        index = index < 0 ? trackList.length - 1 : index

        if (!loopAlbum && index != old_index + delta) {
            // we reached the "end"
            console.log("compute_next_track : returning undefined.")
            return undefined;
        }

        const t = trackList[index];
        console.log("compute_next_track : returning id =", t.id)

        return t;
    }

    function onPlayEnd() {
        console.log("Playback ended")
        if (autoPlay) {
            const t = compute_next_track(1);
            playTrack(t);
            if (t === undefined)
                setAutoPlay(false);
        } else {
            playTrack(undefined);
        }
    }

    function onAutoPlay() {
        if (! autoPlay && ! currentTrack) {
            // Start the album if not curently playing something.
            const t = trackList[0];
            playTrack(t);

        }

        setAutoPlay(! autoPlay)
    }

    function onNext() {
        if (autoPlay) {
            const t = compute_next_track(1);
            playTrack(t);
        } else {
            playTrack(undefined)
        }

    }

    function onPrevious() {
        if (autoPlay) {
            const t = compute_next_track(-1);
            playTrack(t);
        } else {
            playTrack(undefined)
        }

    }

    function changeLoop() {
        setLoopAlbum(! loopAlbum)
    }


    return (<>

        <Flex direction="column" justify="center" align="center">
            <Box className="coverBlock">
                {coverId && <img src={`/api/cover/full/${coverId}`} width={300} height={300} />}
            </Box>
            <div>
                <Span className="fw-bold fs-4">{album?.name}</Span>
            </div>

            <div className="artistBlock">
                <Span>{artist?.name}</Span>
            </div>

            <Player2 track={currentTrack}
                onEnd={onPlayEnd}
                onPrevious={onPrevious}
                onNext={onNext} />

            <Table.Root>
                <Table.Header>
                    <Table.Row>
                        <Table.ColumnHeaderCell colSpan={3}><Flex gap="2" justify="center">
                            <Toggle state={autoPlay} title="Auto" onStateChange={onAutoPlay} />
                            <Toggle title="Loop" state={loopAlbum} onStateChange={changeLoop} />

                        </Flex>
                        </Table.ColumnHeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {trackList && trackList.map(a => <Table.Row key={a.id}>
                        <Table.Cell style={{ width: '2rem' }}>{a.id === currentTrack?.id ? '>>>' : <a onClick={() => playTrack(a)}>{play_btn_fill}</a>}</Table.Cell>
                        <Table.Cell style={{ width: '5rem' }}>{formatTime(a.duration)}</Table.Cell>
                        <Table.Cell><a onClick={() => playTrack(a)}>{a.name}</a></Table.Cell>
                    </Table.Row>)}
                </Table.Body>
            </Table.Root>

        </Flex>

    </>)

}