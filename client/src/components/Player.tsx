import { useEffect, useRef, useState } from 'react';
import { Howl } from 'howler';
import { Button, ProgressBar } from 'react-bootstrap';

import './Player.css'
import { play_fill, pause_fill, rewind_fill, fast_forward_fill } from '~/icons'

export interface PlayerProps {
    src: string | null;
    name: string;
    onEnd: () => void;
    onPrevious?: () => void;
    onNext?: () => void;
}

function formatTime(seconds: number) {
    if (isNaN(seconds)) return "00:00"; // Handle unloaded audio
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export default function Player({ src, name, onEnd, onPrevious, onNext }: PlayerProps) {
    const soundRef = useRef<Howl>(null);
    const animationId = useRef<number>(undefined);

    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0.0);
    const [currentTime, setCurrentTime] = useState(''); // string from formatTime
    const [buttonCaption, setButtonCaption] = useState<string>()
    const [progPercent, setProgPercent] = useState<number>(0)

    useEffect(() => {
        if (src === null) {
            setButtonCaption(undefined)
            setCurrentTime('')
            setProgPercent(0)
            return
        }
        console.log("PLAYER source = ", src)
        // Initialize the Howl instance
        soundRef.current = new Howl({
            src: [src],

            // Enables streaming for larger files
            html5: true,

            // server currently only sends webm files
            format: 'webm',

            // This may need to change. But good for now.
            autoplay: true,

            onplay: handlePlayEvent,
            onpause: () => setIsPlaying(false),
            onstop: () => setIsPlaying(false),
            onend: handleEndEvent,
            onload: handleLoadEvent,
            onseek: () => animateProgressBar('onseek')
        });

        // Clean up and unload the sound when the component unmounts
        return () => {
            if (animationId.current) {
                console.log("Canceling animation")
                cancelAnimationFrame(animationId.current)
            }
            if (soundRef.current) {
                console.log("Cleaning up howl")
                soundRef.current.unload();
            }
        };
    }, [src]);

    function animateProgressBar(id: number|string) {

        if (id === 'onseek') {
            console.log("animate (from onseek)")
        }

        // howler seems to return false for playing() right after a seek, but
        // doesn't then give a play event. So we need to cature the onseek
        // related event.
        if (soundRef.current && (soundRef.current.playing() || (id === 'onseek'))) {

            const newCurrentTime = soundRef.current.seek();

            // Can't use the state `duration` - need to query the howl instance
            // directly. Not sure why.
            const fill_percent = Math.max(0, Math.min(100, Math.round(newCurrentTime / soundRef.current.duration() * 100.0)));

            setProgPercent(fill_percent)
            setCurrentTime(formatTime(newCurrentTime));

            animationId.current = requestAnimationFrame(animateProgressBar)

        } else {
            console.log(`animate --- else leg - id = ${id}`)
        }
    }

    function handlePlayEvent() {
        console.log("Got play event");
        setIsPlaying(true);
        animationId.current = requestAnimationFrame(animateProgressBar)
        console.log(`--- setting up animation ${animationId.current}`)

    }

    function handleEndEvent() {
        setIsPlaying(false);
        onEnd();
    }

    function handleLoadEvent() {
        if (soundRef.current) {
            setDuration(soundRef.current.duration())
            setButtonCaption('pause')
        }
    }

    function handlePlayPauseButtonClick() {
        if (!soundRef.current) return;

        if (soundRef.current.playing()) {
            console.log("Pausing howl")
            soundRef.current.pause();
            setButtonCaption('play')
        } else {
            console.log("Playing howl")
            soundRef.current.play();
            setButtonCaption('pause')
        }
    };

    function handlePreviousButtonClick() {
        if (soundRef.current) {
            soundRef.current.stop();
        }

        if (onPrevious) onPrevious();

    }

    function handleNextButtonClick() {
        if (soundRef.current) {
            soundRef.current.stop();
        }

        if (onNext) onNext();

    }

    function handleSeek10ButtonClick(forward : boolean) {
        if (!soundRef.current) return

        const delta = 10 * (forward ? +1 : -1)

        soundRef.current.seek(soundRef.current.seek() + delta)
    }

    return (
        <div className="audio-player mt-2">
            <ProgressBar now={progPercent} />
            { currentTime &&
            <div className="time-display">
                <span>{currentTime}</span>
                <a onClick={() => handleSeek10ButtonClick(false)}>-</a>
                <a onClick={() => handleSeek10ButtonClick(true)}>+</a>
                <span>{formatTime(duration)}</span>
            </div>
            }

            <div className="mb-2">
                <span className="fs-6">{name}</span>
            </div>

            {buttonCaption && <div className='d-flex gap-1 justify-content-center'>
                {onPrevious && <Button onClick={handlePreviousButtonClick}>{rewind_fill} Prev</Button>}
                <Button onClick={handlePlayPauseButtonClick}>
                    {isPlaying ? <>{pause_fill} Pause</> : <>{play_fill} Play</>}</Button>
                {onNext && <Button onClick={handleNextButtonClick}>{fast_forward_fill} Next</Button>}
            </div>
            }
        </div>
    );
};