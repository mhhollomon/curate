import { useEffect, useRef, useState } from "react";
import { Button, ProgressBar } from 'react-bootstrap';

import './Player.css'
import { play_fill, pause_fill, rewind_fill, fast_forward_fill } from '~/icons'
import { assert } from "radashi";

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

interface  NextTrackState {
    track : PlayerTrackData | null;
    hasNext : boolean;

}

function formatTime(seconds: number) {
    if (isNaN(seconds)) return "00:00"; // Handle unloaded audio
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}


const ANIMATION_MILLSEC = 400;
const SEEK_SECONDS = 10;

// How far for the end of the current track
// should we start buffering the next track.
const BUFFER_SECONDS = 30;


export default function Player2({ track, onEnd, onPrevious, onNext, getNext }: Player2Props) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(''); // string from formatTime
    const [progPercent, setProgPercent] = useState<number>(0);
    const [duration, setDuration] = useState(0.0);
    const timeoutId = useRef<number>(NaN);

    const playerA = useRef<HTMLAudioElement>(new Audio());
    const playerB = useRef<HTMLAudioElement>(new Audio());

    const [currentPlayer, setCurrentPlayer] = useState<string>("A");
    const [tryBuffering, setTryBuffering] = useState(false);

    const nextState = useRef<NextTrackState>({'track' : null, 'hasNext' : true})

    //-------------------------------------------------
    // Reactive functions
    //-------------------------------------------------

    useEffect(() => {
        // Don't have anything to do, but register an unmount
        // cleanup function.
        playerA.current.preload = "auto";
        playerA.current.id = "A";
        playerB.current.preload = "auto";
        playerB.current.id = "B";

        return () => {
            console.log("---- CLEANUP ---")
            if ("mediaSession" in navigator) {
                navigator.mediaSession.metadata = null;
            }
            if (! isNaN(timeoutId.current)) {
                clearTimeout(timeoutId.current);
                timeoutId.current = NaN;
            }
        }
    }, [])

    useEffect(() => {

        setHasNext(true);

        if (track) {
            if (track.id === nextTrack()?.id) {
                console.log(`Swapping to preloaded track ${track.id}`);
                const old_player = getCurrentPlayer();
                assert(old_player);

                // turn off the old player.
                console.log("Turning off player", old_player.id);
                old_player.onplay = null;
                old_player.onended = null;
                if (! isNaN(timeoutId.current)) {
                    clearTimeout(timeoutId.current);
                    timeoutId.current = NaN;
                }


                const player = getNextPlayer();
                assert(player);

                console.log("Swapping to player", player.id);
                player.onplay = () => handleAnimation(player.id);
                player.onended = ended;
                player.onerror = event_handler;
                player.onstalled = event_handler;
                player.onwaiting = event_handler;
                setup_media_session(track);
                player.play();
                setDuration(player.duration);
                setIsPlaying(true);

                // clean up
                setNextTrack(null);

                setCurrentPlayer(currentPlayer === "A" ? "B" : "A")

            } else {
                console.log(`Loading track ${track.id} fresh in player ${currentPlayer}`)
                const player = getCurrentPlayer();
                assert(player);
                player.src = track.src
                player.pause();
                player.oncanplay = can_play;
                player.onplay = () => handleAnimation(player.id);
            }
        } else {
            if ("mediaSession" in navigator) {
                navigator.mediaSession.metadata = null;
            }
            setProgPercent(0);
        }
    }, [track]);

    useEffect(() => {
        console.log("tryBuffering effect");
        if (! tryBuffering) return;

        setTryBuffering(false);

        const nt = nextTrack();

        if (nt) {
            console.log("tryBuffering : nextTrack set =", nt.id);
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

        const player = getNextPlayer();
        assert(player);

        player.autoplay = false;
        player.pause();
        player.src = next_track.src;
        console.log("Set up to buffer in player", player.id);

    }, [tryBuffering]);

    useEffect(() => {
        if (!isPlaying) return;

        handleAnimation(currentPlayer);

    }, [isPlaying]);

    //-------------------------------------------------
    // HTMLAudioElement event handlers
    // These will probably need to change when we add the second device.
    //-------------------------------------------------
    function event_handler(e : any) {
        console.log("--- Got event type", e.type)
    }

    function can_play(_: any) {
        // Appease the type gods
        const player = getCurrentPlayer();
        assert(player);
        assert(track, "INTERNAL : Current track is not defined in can_play");

        console.log("can_play: working with player", player.id)
        setDuration(player.duration);
        setIsPlaying(true);
        player.oncanplay = null;

        player.onended = ended;
        player.onerror = event_handler;
        player.onstalled = event_handler;
        player.onwaiting = event_handler;
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

    function ended(_: any) {
        if (onEnd) onEnd();
    }

    //-------------------------------------------------
    // Utility functions
    //-------------------------------------------------

    function getNextState() : NextTrackState {
        return nextState.current;
    }

    function setHasNext(v : boolean) {
        getNextState().hasNext = v;
    }

    function hasNext() {
        return getNextState().hasNext;
    }

    function setNextTrack(t : PlayerTrackData | null) {
        getNextState().track = t;
    }

    function nextTrack() : PlayerTrackData | null {
        return getNextState().track;
    }

    function getCurrentPlayer() : HTMLAudioElement | null {
        return currentPlayer == "A" ? playerA.current : playerB.current;
    }

    function getNextPlayer() : HTMLAudioElement | null {
        return currentPlayer == "A" ? playerB.current : playerA.current;
    }

    function getPlayer(id : string) : HTMLAudioElement {
        return id === "A" ? playerA.current : playerB.current;
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
            setIsPlaying(true);
            if ("mediaSession" in navigator) {
                navigator.mediaSession.playbackState = "playing";
            }

        } else {
            console.log("Pausing audio");
            player.pause();
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

    function handleAnimation(player_id : string | undefined) {
        const player = player_id ? getPlayer(player_id) : getCurrentPlayer();
        assert(player);

        //console.log("HandleAnimation: on player", player.id)
        if (player.paused) {
            console.log("HandleAnimation: player paused");
            timeoutId.current = NaN;
            return;
        }

        const new_duration = player.duration;
        const current_time = player.currentTime;

        const fill_percent = Math.max(0, Math.min(100, Math.round((current_time / new_duration) * 100.0)));

        setProgPercent(fill_percent);
        setCurrentTime(formatTime(current_time));

        if ("mediaSession" in navigator) {
            navigator.mediaSession.setPositionState({
                duration: new_duration,
                position: current_time,
            });
        }

        timeoutId.current = setTimeout(() => handleAnimation(player_id), ANIMATION_MILLSEC);


        if (hasNext() && getNext && (new_duration - current_time < BUFFER_SECONDS) && ! nextTrack())
           setTryBuffering(true);

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
            <ProgressBar now={progPercent} />
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