import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";

// Set this to false if you want to hide and disable background music completely.
const ENABLE_BACKGROUND_MUSIC = true;

// Replace this file with your own soft ambient music at public/audio/ambient.mp3.
const BACKGROUND_MUSIC_URL = "/audio/ambient.mp3";

const DEFAULT_VOLUME = 0.25;

function BackgroundMusic() {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isAvailable, setIsAvailable] = useState(true);

  useEffect(() => {
    if (!ENABLE_BACKGROUND_MUSIC || !audioRef.current) {
      return;
    }

    const audio = audioRef.current;
    audio.volume = DEFAULT_VOLUME;
    audio.muted = true;

    const attemptAutoplay = async () => {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
    };

    attemptAutoplay();
  }, []);

  if (!ENABLE_BACKGROUND_MUSIC) {
    return null;
  }

  const togglePlay = async () => {
    if (!audioRef.current || !isAvailable) {
      return;
    }

    const audio = audioRef.current;

    if (audio.paused) {
      try {
        audio.muted = false;
        setIsMuted(false);
        await audio.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
      return;
    }

    audio.pause();
    setIsPlaying(false);
  };

  const toggleMute = async () => {
    if (!audioRef.current || !isAvailable) {
      return;
    }

    const audio = audioRef.current;
    const nextMuted = !audio.muted;
    audio.muted = nextMuted;
    setIsMuted(nextMuted);

    if (audio.paused) {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
    }
  };

  return (
    <div className={isAvailable ? "music-control" : "music-control unavailable"}>
      <audio
        ref={audioRef}
        src={BACKGROUND_MUSIC_URL}
        loop
        muted
        playsInline
        preload="auto"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onError={() => {
          setIsAvailable(false);
          setIsPlaying(false);
        }}
      />
      <button
        type="button"
        onClick={togglePlay}
        disabled={!isAvailable}
        aria-label={isPlaying ? "Pause music" : "Play music"}
        title={isAvailable ? (isPlaying ? "Pause" : "Play") : "Add /audio/ambient.mp3"}
      >
        {isPlaying ? <Pause size={17} /> : <Play size={17} />}
      </button>
      <button
        type="button"
        onClick={toggleMute}
        disabled={!isAvailable}
        aria-label={isMuted ? "Unmute music" : "Mute music"}
        title={isAvailable ? (isMuted ? "Unmute" : "Mute") : "Add /audio/ambient.mp3"}
      >
        {isMuted ? <VolumeX size={17} /> : <Volume2 size={17} />}
      </button>
    </div>
  );
}

export default BackgroundMusic;
