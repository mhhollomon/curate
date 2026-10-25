import { useEffect, useRef, useState } from "react";
import { Button, ProgressBar } from 'react-bootstrap';
//import { Howl, Howler } from 'howler';


import './Player.css'
import { play_fill, pause_fill, rewind_fill, fast_forward_fill } from '~/icons'
import { assert } from "radashi";
import * as rad from 'radashi';

export interface PlayerTrackData {
    id: string; // Track ID - mostly for the use by parent.
    src: string; // url
    name: string;
    artist: string;
    album?: string;
    cover?: string; // url
}

export interface Player2Props {
    track?: PlayerTrackData,
    onEnd?: () => void; // Finished with current track
    onPrevious?: () => void; // UI button
    onNext?: () => void; // UI button

    // If defined, the player will try to buffer the next track
    // shortly before the current track ends.
    getNext?: () => (PlayerTrackData | null);
}

interface  RunData {
    nextTrack : PlayerTrackData | null;
    hasNext : boolean;
    currTime : number; // seconds
    duration : number;

}

function formatTime(seconds: number) {
    if (isNaN(seconds)) return "00:00"; // Handle unloaded audio
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}


const SEEK_SECONDS = 10;

// How far from the end of the current track
// should we start buffering the next track.
const BUFFER_SECONDS = 30;

const PRELOAD = false;


export default function Player2({ track, onEnd, onPrevious, onNext, getNext }: Player2Props) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(''); // string from formatTime
    const [progPercent, setProgPercent] = useState<number>(0);
    const [duration, setDuration] = useState(0.0);
    // Not used in the rendering, but it is used to decouple the
    // preload logic from the animation flow.
    const [tryBuffering, setTryBuffering] = useState(false);

    const players = useRef<HTMLAudioElement[]>([]);
    const runData = useRef<RunData>({
        'nextTrack' : null,
        'hasNext' : true,
        'currTime' : 0,
        'duration' : 0
    })

    // Silence
    const audioElem = useRef<HTMLAudioElement>(null);
    const playerDiv = useRef<HTMLDivElement>(null);

    //-------------------------------------------------
    // Reactive functions
    //-------------------------------------------------

    useEffect(() => {

        return () => {
            console.log("---- CLEANUP ---")

            clean_players();

            if ("mediaSession" in navigator) {
                navigator.mediaSession.metadata = null;
            }
        }
    }, [])

    useEffect(() => {
        console.log(`track changed to: '${track?.id || 'undefined'}'`)

        setHasNext(true);

        if (track) {
            if (track.id === nextTrack()?.id) {
                console.log(`Swapping to preloaded track ${track.id}`);
                const old_player = players.current.shift();
                assert(old_player);

                // turn off the old player.
                console.log("Turning off player", old_player.id);
                // if (! isNaN(timeoutId.current)) {
                //     clearTimeout(timeoutId.current);
                //     timeoutId.current = NaN;
                // }
                destroy_player(old_player);


                const player = getCurrentPlayer();
                assert(player);

                console.log("Swapping to player", player);
                player.ontimeupdate = handleTimeUpdate;
                player.onended = ended;
                setup_media_session(track);
                player.play();
                //audioElem.current?.play();
                setDuration(player.duration);
                if (runData.current) {
                    runData.current.duration = player.duration;
                }
                setIsPlaying(true);

                // clean up
                setNextTrack(null);


            } else {
                console.log(`Loading track ${track.id} fresh in new player`)
                clean_players();
                const player = create_player(track.src);
                add_player(player);

                player.oncanplay = can_play;
                player.ontimeupdate = handleTimeUpdate;
            }
        } else {
            if ("mediaSession" in navigator) {
                navigator.mediaSession.metadata = null;
            }
            setProgPercent(0);
        }
    }, [track]);

    useEffect(() => {
        console.log("tryBuffering effect", tryBuffering);
        if (! tryBuffering) return;

        setTryBuffering(false);

        const nt = nextTrack();

        if (nt) {
            console.log("tryBuffering : nextTrack already set =", nt.id);
            return;
        }

        if (! hasNext() || ! getNext ) return;
        console.log("Looking into buffering");

        const next_track = getNext();
        if (! next_track) {
            console.log("Nothing to buffer");
            setHasNext(false);
            return;
        }

        setNextTrack(next_track);

        const player = create_player(next_track.src);
        assert(player);
        add_player(player);

        console.log("Set up to buffer in player");

    }, [tryBuffering]);


    //-------------------------------------------------
    // HTMLAudioElement event handlers
    // These will probably need to change when we add the second device.
    //-------------------------------------------------
    function event_handler( e : any) {
        console.log("---+++ Got event", e);
    }

    function can_play(_: any) {
        // Appease the type gods
        const player = getCurrentPlayer();
        assert(player);
        assert(track, "INTERNAL : Current track is not defined in can_play");

        player.oncanplay = null;

        setDuration(player.duration);
        if (runData.current) {
            runData.current.duration = player.duration;
        }
        setIsPlaying(true);

        player.onended = ended;
        player.play();

        // Set up the MediaSession
        // Initialize  (maybe)
        if ("mediaSession" in navigator) {
            setup_media_session(track);
            navigator.mediaSession.setPositionState({
                duration: player.duration,
                position: 0.0,
            });
            // Not true, but will be in a millisecond
            navigator.mediaSession.playbackState = "playing";
        }
    }

    function ended(e: any) {
        console.log(`--ended fired @ ${runData.current?.currTime} of ${runData.current?.duration} for player`, e.target);
        audioElem.current?.pause();

        if (onEnd) onEnd();
    }

    function handleTimeUpdate(e : Event) {
        const player = e.target as HTMLAudioElement;
        if (player.src !== getCurrentPlayer()?.src) {
            console.error("Recieved TimeChange event from other than current player:", player);
            return;
        }


        //console.log("HandleAnimation: on player", player.id)
        if (player.paused) {
            console.log("HandleAnimation: player paused", player);
            return;
        }

        const new_duration = player.duration;
        const current_time = player.currentTime;

        if (runData.current) {
            runData.current.currTime = current_time;
        }

        const fill_percent = Math.max(0, Math.min(100, (current_time / new_duration) * 100.0));

        setProgPercent(fill_percent);
        setCurrentTime(formatTime(current_time));

        if ("mediaSession" in navigator) {
            navigator.mediaSession.setPositionState({
                duration: new_duration,
                position: current_time,
            });
        }


        if (PRELOAD && hasNext() && getNext && (new_duration - current_time < BUFFER_SECONDS) && ! nextTrack())
           setTryBuffering(true);

    }


    //-------------------------------------------------
    // Utility functions
    //-------------------------------------------------

    function getNextState() : RunData {
        return runData.current;
    }

    function setHasNext(v : boolean) {
        getNextState().hasNext = v;
    }

    function hasNext() {
        return getNextState().hasNext;
    }

    function setNextTrack(t : PlayerTrackData | null) {
        getNextState().nextTrack = t;
    }

    function nextTrack() : PlayerTrackData | null {
        return getNextState().nextTrack;
    }

    function getCurrentPlayer() : HTMLAudioElement | null {
        return rad.first(players.current);
    }

    function create_player(src : string) : HTMLAudioElement {
        const a = new Audio(src);
        a.autoplay = false;
        a.loop = false;
        a.volume = 0.90;
        a.preload = "auto";
        a.onerror = event_handler;
        a.onwaiting = event_handler;
        a.onabort = event_handler;

        a.pause();
        playerDiv.current?.appendChild(a);

        return a;
    }

    function destroy_player(player : HTMLAudioElement) : void {
        player.pause();
        player.onended = null;
        player.oncanplay = null;
        player.onplay = null;
        player.ontimeupdate = null;
        player.muted = true;
        player.remove();

    }

    function clean_players() : void {
        while (players.current.length > 0) {
            const [player] = players.current.splice(0, 1);
            destroy_player(player);
        }
    }

    function add_player(player : HTMLAudioElement) {
        players.current.push(player);
    }


    function setup_media_session(t : PlayerTrackData) {
        if (!("mediaSession" in navigator)) return;
        console.log("Setting up mediaSession");
        navigator.mediaSession.metadata = new MediaMetadata({
            title: t.name,
            artist: t.artist,
            album: t.album,
            ...(t.cover ?
                {
                    artwork: [
                        {
                            src: t.cover,
                            sizes: "128x128",
                            type: "image/webp",
                        },
                    ]
                } : {})
        });
        navigator.mediaSession.setActionHandler('play', handlePlayPauseButtonClick);
        navigator.mediaSession.setActionHandler('pause', handlePlayPauseButtonClick);


    }

    //-------------------------------------------------
    // UI event handlers
    //-------------------------------------------------

    function handlePlayPauseButtonClick() {
        const player = getCurrentPlayer();
        assert(player);

        if (player.paused) {
            console.log("Playing audio");
            player.play();
            //audioElem.current?.play();

            setIsPlaying(true);
            if ("mediaSession" in navigator) {
                navigator.mediaSession.playbackState = "playing";
            }

        } else {
            console.log("Pausing audio");
            player.pause();
            //audioElem.current?.pause();

            setIsPlaying(false);
            if ("mediaSession" in navigator) {
                navigator.mediaSession.playbackState = "paused";
            }
        }
    };

    function handlePreviousButtonClick() {
        if (onPrevious) onPrevious();
    }

    function handleNextButtonClick() {
        if (onNext) onNext();
    }



    function handleSeek10ButtonClick(forward: boolean) {
        const player = getCurrentPlayer();
        assert(player);

        const delta = SEEK_SECONDS * (forward ? +1 : -1);

        player.currentTime = player.currentTime + delta;
    }

    //-------------------------------------------------
    // UI definition
    //-------------------------------------------------

    return (
        <div className="audio-player mt-2">
            {/* Can't use the MediaSession except if your playing via an audio element. So, lets play silence. */}
            <div id="players" hidden aria-hidden ref={playerDiv}>
                <audio autoPlay={false} loop={true} ref={audioElem} src="/api/silence"></audio>
            </div>
            <ProgressBar now={progPercent} min={0} max={100} />
            {track &&
                <div className="time-display">
                    <span>{currentTime}</span>
                    <a style={{ cursor: 'pointer' }} onClick={() => handleSeek10ButtonClick(false)}>-</a>
                    <a style={{ cursor: 'pointer' }} onClick={() => handleSeek10ButtonClick(true)}>+</a>
                    <span>{formatTime(duration)}</span>
                </div>
            }

            <div className="mb-2">
                <span className="fs-6">{track?.name || ''}</span>
            </div>

            {track && <div className='d-flex gap-1 justify-content-center'>
                {onPrevious && <Button onClick={handlePreviousButtonClick}>{rewind_fill} Prev</Button>}
                <Button onClick={handlePlayPauseButtonClick}>
                    {isPlaying ? <>{pause_fill} Pause</> : <>{play_fill} Play</>}</Button>
                {onNext && <Button onClick={handleNextButtonClick}>{fast_forward_fill} Next</Button>}
            </div>
            }
        </div>
    );


};