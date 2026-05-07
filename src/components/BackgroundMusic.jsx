import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

// Set this to false if you want to hide and disable background music completely.
const ENABLE_BACKGROUND_MUSIC = true;

// Use "youtube" for the linked song, or "audio" for a local file in public/audio.
const MUSIC_SOURCE = "youtube";

// Replace this URL with another YouTube link if you want to change the song.
const YOUTUBE_MUSIC_URL = "https://youtu.be/9Zq79uu_o5E?si=Hz82hsTr6S12CYf0";

// Local fallback path. Put your own file at public/audio/ambient.mp3 and set MUSIC_SOURCE to "audio".
const BACKGROUND_MUSIC_URL = "/audio/ambient.mp3";

const DEFAULT_VOLUME = 0.25;

let youtubeApiPromise;

function getYouTubeVideoId(url) {
  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.hostname.includes("youtu.be")) {
      return parsedUrl.pathname.replace("/", "");
    }

    if (parsedUrl.searchParams.has("v")) {
      return parsedUrl.searchParams.get("v");
    }

    const embedMatch = parsedUrl.pathname.match(/\/embed\/([^/?]+)/);
    return embedMatch?.[1] ?? "";
  } catch {
    return "";
  }
}

function loadYouTubeApi() {
  if (window.YT?.Player) {
    return Promise.resolve(window.YT);
  }

  if (youtubeApiPromise) {
    return youtubeApiPromise;
  }

  youtubeApiPromise = new Promise((resolve, reject) => {
    const previousReadyHandler = window.onYouTubeIframeAPIReady;

    window.onYouTubeIframeAPIReady = () => {
      previousReadyHandler?.();
      resolve(window.YT);
    };

    const existingScript = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');

    if (existingScript) {
      existingScript.addEventListener("error", reject, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    script.onerror = reject;
    document.body.appendChild(script);
  });

  return youtubeApiPromise;
}

function BackgroundMusic() {
  const audioRef = useRef(null);
  const youtubeMountRef = useRef(null);
  const youtubePlayerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isAvailable, setIsAvailable] = useState(true);
  const [isPlayerReady, setIsPlayerReady] = useState(MUSIC_SOURCE !== "youtube");

  const youtubeVideoId = useMemo(() => getYouTubeVideoId(YOUTUBE_MUSIC_URL), []);
  const isYoutubeMusic = MUSIC_SOURCE === "youtube" && Boolean(youtubeVideoId);

  useEffect(() => {
    if (!ENABLE_BACKGROUND_MUSIC || isYoutubeMusic) {
      return;
    }

    if (!audioRef.current) {
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
  }, [isYoutubeMusic]);

  useEffect(() => {
    if (!ENABLE_BACKGROUND_MUSIC || !isYoutubeMusic || !youtubeMountRef.current) {
      return undefined;
    }

    let isCancelled = false;

    loadYouTubeApi()
      .then((YT) => {
        if (isCancelled || !youtubeMountRef.current) {
          return;
        }

        youtubePlayerRef.current = new YT.Player(youtubeMountRef.current, {
          width: "1",
          height: "1",
          videoId: youtubeVideoId,
          playerVars: {
            autoplay: 1,
            controls: 0,
            disablekb: 1,
            loop: 1,
            modestbranding: 1,
            playlist: youtubeVideoId,
            playsinline: 1,
            rel: 0,
          },
          events: {
            onReady: (event) => {
              if (isCancelled) {
                return;
              }

              event.target.setVolume(Math.round(DEFAULT_VOLUME * 100));
              event.target.mute();
              event.target.playVideo();
              setIsMuted(true);
              setIsPlayerReady(true);
              setIsAvailable(true);
            },
            onStateChange: (event) => {
              if (!window.YT?.PlayerState) {
                return;
              }

              setIsPlaying(event.data === window.YT.PlayerState.PLAYING);
            },
            onError: () => {
              setIsAvailable(false);
              setIsPlaying(false);
              setIsPlayerReady(false);
            },
          },
        });
      })
      .catch(() => {
        setIsAvailable(false);
        setIsPlayerReady(false);
      });

    return () => {
      isCancelled = true;
      youtubePlayerRef.current?.destroy?.();
      youtubePlayerRef.current = null;
    };
  }, [isYoutubeMusic, youtubeVideoId]);

  if (!ENABLE_BACKGROUND_MUSIC) {
    return null;
  }

  const togglePlay = async () => {
    if (!isAvailable || !isPlayerReady) {
      return;
    }

    if (isYoutubeMusic) {
      const player = youtubePlayerRef.current;
      const isCurrentlyPlaying = player?.getPlayerState?.() === window.YT?.PlayerState?.PLAYING;

      if (isCurrentlyPlaying) {
        player.pauseVideo();
        setIsPlaying(false);
        return;
      }

      player?.setVolume(Math.round(DEFAULT_VOLUME * 100));
      player?.unMute();
      player?.playVideo();
      setIsMuted(false);
      return;
    }

    if (!audioRef.current) {
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
    if (!isAvailable || !isPlayerReady) {
      return;
    }

    if (isYoutubeMusic) {
      const player = youtubePlayerRef.current;
      const nextMuted = !player?.isMuted?.();

      if (nextMuted) {
        player?.mute();
      } else {
        player?.setVolume(Math.round(DEFAULT_VOLUME * 100));
        player?.unMute();
        player?.playVideo();
      }

      setIsMuted(nextMuted);
      return;
    }

    if (!audioRef.current) {
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

  const unavailableTitle = isYoutubeMusic ? "YouTube music is loading" : "Add /audio/ambient.mp3";
  const buttonsDisabled = !isAvailable || !isPlayerReady;

  return (
    <div className={isAvailable ? "music-control" : "music-control unavailable"}>
      {isYoutubeMusic ? (
        <div ref={youtubeMountRef} className="youtube-music-player" aria-hidden="true" />
      ) : (
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
      )}

      <button
        type="button"
        onClick={togglePlay}
        disabled={buttonsDisabled}
        aria-label={isPlaying ? "Pause music" : "Play music"}
        title={buttonsDisabled ? unavailableTitle : isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? <Pause size={17} /> : <Play size={17} />}
      </button>
      <button
        type="button"
        onClick={toggleMute}
        disabled={buttonsDisabled}
        aria-label={isMuted ? "Unmute music" : "Mute music"}
        title={buttonsDisabled ? unavailableTitle : isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? <VolumeX size={17} /> : <Volume2 size={17} />}
      </button>
    </div>
  );
}

export default BackgroundMusic;
