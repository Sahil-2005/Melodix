import { useState, useRef, useEffect, useCallback } from "react";
import melodixDB from "../services/indexedDB";

export default function useAudioPlayer() {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentSongData, setCurrentSongData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolumeState] = useState(1);

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
      setIsLoading(false);
      setError(null);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    const handleError = async (e) => {
      console.error("Audio playback error:", e);
      setIsLoading(false);
      
      // Check if it's a blob URL that expired
      if (currentSongData?.audioId && currentSongData?.isOffline) {
        try {
          // Try to refresh the blob URL from IndexedDB
          const newUrl = await melodixDB.getAudioUrl(currentSongData.audioId);
          if (newUrl) {
            console.log("Refreshing expired blob URL");
            audio.src = newUrl;
            audio.play();
            return;
          }
        } catch (err) {
          console.error("Failed to refresh audio URL:", err);
        }
      }
      
      setError("Failed to play audio. The file may be missing or corrupted.");
    };

    const handleWaiting = () => {
      setIsLoading(true);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
    };

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);
    audio.addEventListener("waiting", handleWaiting);
    audio.addEventListener("canplay", handleCanPlay);

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("waiting", handleWaiting);
      audio.removeEventListener("canplay", handleCanPlay);
    };
  }, [currentSongData]);

  /**
   * Play audio from URL or song object
   * Handles both blob URLs (IndexedDB) and remote URLs
   */
  const play = useCallback(async (urlOrSong) => {
    const audio = audioRef.current;
    if (!audio) return;

    setError(null);
    setIsLoading(true);

    try {
      let url = urlOrSong;
      let songData = null;

      // If it's a song object, extract URL and store metadata
      if (typeof urlOrSong === "object" && urlOrSong !== null) {
        songData = urlOrSong;
        
        // For offline songs, ensure we have a valid blob URL
        if (urlOrSong.audioId && urlOrSong.isOffline) {
          // Get fresh blob URL from IndexedDB
          const blobUrl = await melodixDB.getAudioUrl(urlOrSong.audioId);
          if (blobUrl) {
            url = blobUrl;
          } else {
            throw new Error("Audio file not found in storage");
          }
        } else {
          url = urlOrSong.url;
        }
        
        setCurrentSongData(songData);
      }

      if (url && typeof url === "string") {
        // Revoke previous blob URL if it exists
        if (audio.src && audio.src.startsWith("blob:") && audio.src !== url) {
          URL.revokeObjectURL(audio.src);
        }
        
        audio.src = url;
        await audio.play();
        setIsPlaying(true);
      }
    } catch (err) {
      console.error("Failed to play audio:", err);
      setError(err.message || "Failed to play audio");
      setIsLoading(false);
    }
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
      audio.play().then(() => setIsPlaying(true)).catch(console.error);
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

  const setVolume = useCallback((value) => {
    const audio = audioRef.current;
    if (!audio) return;

    const normalizedValue = Math.max(0, Math.min(1, value));
    audio.volume = normalizedValue;
    setVolumeState(normalizedValue);
  }, []);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    audio.currentTime = 0;
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    audioRef,
    isPlaying,
    progress,
    duration,
    currentTime,
    currentSongData,
    error,
    isLoading,
    volume,
    play,
    pause,
    togglePlayPause,
    seek,
    setOnEnded,
    setVolume,
    stop,
    clearError,
  };
}
