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

function formatTime(seconds: number) {
    if (isNaN(seconds)) return "00:00"; // Handle unloaded audio
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}


const ANIMATION_MILLSEC = 250;
const SEEK_SECONDS = 10;

// How far for the end of the current track
// should we start buffering the next track.
const BUFFER_SECONDS = 60;


export default function Player2({ track, onEnd, onPrevious, onNext, getNext }: Player2Props) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(''); // string from formatTime
    const [progPercent, setProgPercent] = useState<number>(0);
    const [duration, setDuration] = useState(0.0);
    const [timeoutId, setTimeoutId] = useState<number>();

    const currentPlayer = useRef<HTMLAudioElement>(null);
    const nextPlayer = useRef<HTMLAudioElement>(null);
    const [nextTrack, setNextTrack] = useState<PlayerTrackData>();
    const [hasNext, setHasNext] = useState(true);
    const [tryBuffering, setTryBuffering] = useState(false);

    //-------------------------------------------------
    // Reactive functions
    //-------------------------------------------------

    useEffect(() => {
        // Don't have anything to do, but register an unmount
        // cleanup function.
        return () => {
            if (currentPlayer.current) {
                currentPlayer.current.pause;
            }
            if (timeoutId !== undefined) {
                clearTimeout(timeoutId);
            }
            if ("mediaSession" in navigator) {
                navigator.mediaSession.metadata = null;
            }
        }
    }, [])

    useEffect(() => {
        if (!currentPlayer.current)
            currentPlayer.current = new Audio();

        setHasNext(true);

        if (track) {
            if (track.id === nextTrack?.id && nextPlayer.current) {
                console.log("Swapping to preloaded track");

                // cut ties with the old player.
                currentPlayer.current.onplay = null;
                currentPlayer.current.onended = null;

                currentPlayer.current = nextPlayer.current;

                const player = currentPlayer.current;
                player.onplay = handleAnimation;
                player.onended = ended;
                setup_media_session(track);
                player.play();
                setDuration(player.duration);
                setIsPlaying(true);

                // clean up
                nextPlayer.current = null;
                setNextTrack(undefined);

            } else {
                console.log("Loading new track fresh.")
                const player = currentPlayer.current;
                player.src = track.src
                player.pause();
                player.oncanplay = can_play;
                player.onplay = handleAnimation;
            }
        } else {
            if ("mediaSession" in navigator) {
                navigator.mediaSession.metadata = null;
            }
            setProgPercent(0);
        }
    }, [track]);

    useEffect(() => {
        if (! tryBuffering) return;

        setTryBuffering(false);

        if (! hasNext || ! getNext || nextTrack) return;
        console.log("Looking into buffering");

        const next_track = getNext();
        if (! next_track) {
            console.log("Nothing to buffer");
            setHasNext(false);
            return;
        }

        setNextTrack(next_track);
        if (! nextPlayer.current) {
            console.log("Creating new nextPlayer")
            nextPlayer.current = new Audio();
        }

        const player = nextPlayer.current;
        player.autoplay = false;
        player.pause();
        player.src = next_track.src;
        console.log("Set up to buffer");

    }, [tryBuffering]);

    //-------------------------------------------------
    // HTMLAudioElement event handlers
    // These will probably need to change when we add the second device.
    //-------------------------------------------------

    function can_play(_: any) {
        // Appease the type gods
        if (!currentPlayer.current) {
            throw Error("INTERNAL : Current Player not defined in can_play");
        }
        assert(track, "INTERNAL : Current track is not defined in can_play");

        const player = currentPlayer.current;

        setDuration(player.duration);
        setIsPlaying(true);

        player.play();
        player.onended = ended;

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
        if (!currentPlayer.current) return;

        if (currentPlayer.current.paused) {
            console.log("Playing audio");
            currentPlayer.current.play();
            setIsPlaying(true);
            if ("mediaSession" in navigator) {
                navigator.mediaSession.playbackState = "playing";
            }

        } else {
            console.log("Pausing audio");
            currentPlayer.current.pause();
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

    function handleAnimation() {
        if (!track) return;
        if (!currentPlayer.current) return;

        const player = currentPlayer.current;

        if (player.paused) return;

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

        const id = setTimeout(handleAnimation, ANIMATION_MILLSEC);
        setTimeoutId(id);

        if (hasNext && getNext && (new_duration - current_time < BUFFER_SECONDS) && ! nextTrack)
           setTryBuffering(true);

    }


    function handleSeek10ButtonClick(forward: boolean) {
        if (!currentPlayer.current) return
        const player = currentPlayer.current;

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