import { useState, useRef, useEffect, useCallback } from "react";

export default function useAudioPlayer() {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  // Update progress as audio plays
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
        setCurrentTime(audio.currentTime);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  const play = useCallback((url) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (url) {
      audio.src = url;
    }
    audio.play();
    setIsPlaying(true);
  }, []);

  const pause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    setIsPlaying(false);
  }, []);

  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      audio.play();
      setIsPlaying(true);
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  }, []);

  const seek = useCallback((percentage) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;

    const newTime = (percentage / 100) * audio.duration;
    audio.currentTime = newTime;
    setProgress(percentage);
    setCurrentTime(newTime);
  }, []);

  const setOnEnded = useCallback((callback) => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.onended = callback;
  }, []);

  return {
    audioRef,
    isPlaying,
    progress,
    duration,
    currentTime,
    play,
    pause,
    togglePlayPause,
    seek,
    setOnEnded,
  };
}
