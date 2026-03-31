"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

export const musicTracks = [
  {
    id: "sinar-matahari",
    name: "Sinar Matahari",
    file: "/audios/sinar-matahari.mp3",
  },
  {
    id: "chill-music",
    name: "Chill Vibes - Lofi Girl",
    file: "/audios/chill-music.mp3",
  },
];

interface AudioContextType {
  isMusicEnabled: boolean;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  currentTrackId: string;
  tracks: typeof musicTracks;
  toggleMusic: () => void;
  togglePlayPause: () => void;
  setVolume: (volume: number) => void;
  switchTrack: (trackId: string) => void;
  formatTime: (seconds: number) => string;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

const audioInstances: Map<string, HTMLAudioElement> = new Map();
const savedPositions: Map<string, number> = new Map();

let _currentTrackId = "sinar-matahari";
let _isMusicEnabled = false;
let _volume = 20;

function getOrCreate(trackId: string): HTMLAudioElement {
  if (!audioInstances.has(trackId)) {
    const track = musicTracks.find((t) => t.id === trackId);
    if (!track) throw new Error(`Unknown track: ${trackId}`);
    const audio = new Audio(track.file);
    audio.loop = true;
    audio.volume = _volume / 100;
    audioInstances.set(trackId, audio);
  }
  return audioInstances.get(trackId)!;
}

function startAudio(
  audio: HTMLAudioElement,
  onSuccess: () => void,
) {
  audio
    .play()
    .then(() => {
      onSuccess();
    })
    .catch(() => {
      const events = ["click", "keydown", "touchstart"] as const;
      const unlock = () => {
        audio
          .play()
          .then(() => {
            onSuccess();
            events.forEach((e) =>
              document.removeEventListener(e, unlock),
            );
          })
          .catch(() => {});
      };
      events.forEach((e) =>
        document.addEventListener(e, unlock, { once: true }),
      );
    });
}

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [isMusicEnabled, setIsMusicEnabled] = useState(_isMusicEnabled);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(_volume);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTrackId, setCurrentTrackId] = useState(_currentTrackId);

  const attachListeners = useCallback((audio: HTMLAudioElement) => {
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onMetadata = () => setDuration(audio.duration);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onMetadata);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onMetadata);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  useEffect(() => {
    musicTracks.forEach((t) => getOrCreate(t.id));

    const defaultAudio = getOrCreate(_currentTrackId);
    const cleanup = attachListeners(defaultAudio);

    if (defaultAudio.duration) setDuration(defaultAudio.duration);
    setCurrentTime(defaultAudio.currentTime);
    setIsPlaying(!defaultAudio.paused && _isMusicEnabled);

    return cleanup;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (currentTrackId === _currentTrackId) return;
    const audio = getOrCreate(currentTrackId);
    const cleanup = attachListeners(audio);
    if (audio.duration) setDuration(audio.duration);
    setCurrentTime(audio.currentTime);
    return cleanup;
  }, [currentTrackId, attachListeners]);

  useEffect(() => {
    _volume = volume;
    audioInstances.forEach((a) => {
      a.volume = volume / 100;
    });
  }, [volume]);

  const toggleMusic = useCallback(() => {
    const audio = getOrCreate(currentTrackId);

    if (isMusicEnabled) {
      audio.pause();
      _isMusicEnabled = false;
      setIsMusicEnabled(false);
      setIsPlaying(false);
    } else {
      audio.volume = volume / 100;
      startAudio(audio, () => {
        _isMusicEnabled = true;
        setIsMusicEnabled(true);
        setIsPlaying(true);
      });
    }
  }, [currentTrackId, isMusicEnabled, volume]);

  const togglePlayPause = useCallback(() => {
    if (!isMusicEnabled) return;
    const audio = getOrCreate(currentTrackId);

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch((err) => console.error("Audio playback failed:", err));
    }
  }, [currentTrackId, isMusicEnabled, isPlaying]);

  const switchTrack = useCallback(
    (trackId: string) => {
      if (trackId === currentTrackId) return;

      const currentAudio = getOrCreate(currentTrackId);
      savedPositions.set(currentTrackId, currentAudio.currentTime);
      currentAudio.pause();

      _currentTrackId = trackId;
      setCurrentTrackId(trackId);

      const newAudio = getOrCreate(trackId);
      newAudio.volume = volume / 100;
      const restored = savedPositions.get(trackId) ?? 0;
      newAudio.currentTime = restored;
      setCurrentTime(restored);
      setDuration(newAudio.duration || 0);

      if (isMusicEnabled) {
        newAudio
          .play()
          .catch((err) => console.error("Audio playback failed:", err));
      }
    },
    [currentTrackId, isMusicEnabled, volume],
  );

  const setVolume = useCallback((value: number) => {
    setVolumeState(value);
  }, []);

  const formatTime = useCallback((seconds: number) => {
    if (!isFinite(seconds) || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, []);

  return (
    <AudioContext.Provider
      value={{
        isMusicEnabled,
        isPlaying,
        volume,
        currentTime,
        duration,
        currentTrackId,
        tracks: musicTracks,
        toggleMusic,
        togglePlayPause,
        setVolume,
        switchTrack,
        formatTime,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
}
