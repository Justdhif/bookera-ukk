"use client";

import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useEffect,
} from "react";

interface AudioContextType {
  isMusicEnabled: boolean;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  toggleMusic: () => void;
  togglePlayPause: () => void;
  setVolume: (volume: number) => void;
  formatTime: (seconds: number) => string;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

const musicTrack = {
  id: "chill-music",
  name: "Chill Vibes - Lofi Girl",
  file: "/audios/chill-music.mp3",
  duration: "1:10:39",
};

let globalAudioInstance: HTMLAudioElement | null = null;

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [isMusicEnabled, setIsMusicEnabled] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(20);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!globalAudioInstance) {
      globalAudioInstance = new Audio(musicTrack.file);
      globalAudioInstance.loop = true;
      globalAudioInstance.volume = volume / 100;

      globalAudioInstance.addEventListener("loadedmetadata", () => {
        if (globalAudioInstance) {
          setDuration(globalAudioInstance.duration);
        }
      });

      globalAudioInstance.addEventListener("timeupdate", () => {
        if (globalAudioInstance) {
          setCurrentTime(globalAudioInstance.currentTime);
        }
      });

      globalAudioInstance.addEventListener("ended", () => {
        setIsPlaying(false);
        setCurrentTime(0);
      });

      globalAudioInstance.addEventListener("play", () => {
        setIsPlaying(true);
      });

      globalAudioInstance.addEventListener("pause", () => {
        setIsPlaying(false);
      });
    }

    audioRef.current = globalAudioInstance;

    if (globalAudioInstance) {
      globalAudioInstance.volume = volume / 100;
    }

    return () => {
      if (audioRef.current) {
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (globalAudioInstance) {
      globalAudioInstance.volume = volume / 100;
    }
  }, [volume]);

  const toggleMusic = () => {
    if (!globalAudioInstance) return;

    if (isMusicEnabled) {
      globalAudioInstance.pause();
      setIsMusicEnabled(false);
      setIsPlaying(false);
    } else {
      globalAudioInstance.volume = volume / 100;
      globalAudioInstance
        .play()
        .then(() => {
          setIsMusicEnabled(true);
          setIsPlaying(true);
        })
        .catch((error) => {
          console.error("Audio playback failed:", error);
        });
    }
  };

  const togglePlayPause = () => {
    if (!globalAudioInstance || !isMusicEnabled) return;

    if (isPlaying) {
      globalAudioInstance.pause();
    } else {
      globalAudioInstance.play().catch((error) => {
        console.error("Audio playback failed:", error);
      });
    }
  };

  const setVolume = (value: number) => {
    setVolumeState(value);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <AudioContext.Provider
      value={{
        isMusicEnabled,
        isPlaying,
        volume,
        currentTime,
        duration,
        toggleMusic,
        togglePlayPause,
        setVolume,
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
