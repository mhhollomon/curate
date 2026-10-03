import { useEffect, useRef, useState } from 'react';
import { Howl } from 'howler';

export interface PlayerProps {
    src : string | null;
    name : string;
    onEnd : () => void
}

export default function Player({ src, name, onEnd } : PlayerProps)  {
  const soundRef = useRef<Howl>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (src === null) {
        return
    }
    console.log("PLAYER source = ", src)
    // Initialize the Howl instance
    soundRef.current = new Howl({
      src: [src],
      html5: true, // Enables streaming for larger files
      format : 'webm',
      autoplay : true,
      onplay: () => setIsPlaying(true),
      onpause: () => setIsPlaying(false),
      onstop: () => setIsPlaying(false),
      onend: () => {setIsPlaying(false), onEnd()},
    });

    // Clean up and unload the sound when the component unmounts
    return () => {
      if (soundRef.current) {
        console.log("Cleaning up howl")
        soundRef.current.unload();
      }
    };
  }, [src]);

  const handlePlayPause = () => {
    if (!soundRef.current) return;

    if (soundRef.current.playing()) {
      soundRef.current.pause();
    } else {
      soundRef.current.play();
    }
  };

  const handleStop = () => {
    if (soundRef.current) {
      soundRef.current.stop();
    }
  };

  return (
    <div className="mt-2" style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h3>Audio Player</h3>
      <button onClick={handlePlayPause}>
        {isPlaying ? 'Pause' : 'Play'}
      </button>
      <button onClick={handleStop} style={{ marginLeft: '10px' }}>
        Stop
      </button>
      <div>
        <span className="fs-6">{name}</span>
      </div>
    </div>
  );
};