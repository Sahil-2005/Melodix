/**
 * useAudioPlayer Hook for Melodix Mobile
 * Uses expo-av for audio playback
 * Handles local files, remote streams, and bundled assets
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { Audio } from 'expo-av';
import melodixStorage from '../services/storage';

// Audio mode configuration
const AUDIO_MODE = {
  allowsRecordingIOS: false,
  staysActiveInBackground: true,
  playsInSilentModeIOS: true,
  shouldDuckAndroid: true,
  playThroughEarpieceAndroid: false,
};

export default function useAudioPlayer() {
  const soundRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [error, setError] = useState(null);
  const [currentSource, setCurrentSource] = useState(null);
  
  const onEndedCallback = useRef(null);
  const positionUpdateInterval = useRef(null);

  /**
   * Configure audio mode on mount
   */
  useEffect(() => {
    const configureAudio = async () => {
      try {
        await Audio.setAudioModeAsync(AUDIO_MODE);
        console.log('Audio mode configured');
      } catch (err) {
        console.error('Failed to configure audio mode:', err);
      }
    };

    configureAudio();

    // Cleanup on unmount
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
      if (positionUpdateInterval.current) {
        clearInterval(positionUpdateInterval.current);
      }
    };
  }, []);

  /**
   * Handle playback status updates
   */
  const onPlaybackStatusUpdate = useCallback((status) => {
    if (status.isLoaded) {
      setIsPlaying(status.isPlaying);
      setDuration(status.durationMillis / 1000 || 0);
      setCurrentTime(status.positionMillis / 1000 || 0);
      
      if (status.durationMillis > 0) {
        setProgress((status.positionMillis / status.durationMillis) * 100);
      }

      // Handle playback finished
      if (status.didJustFinish && !status.isLooping) {
        console.log('Playback finished');
        setIsPlaying(false);
        setProgress(0);
        setCurrentTime(0);
        
        if (onEndedCallback.current) {
          onEndedCallback.current();
        }
      }
    }

    if (status.error) {
      console.error('Playback error:', status.error);
      setError(status.error);
      setIsPlaying(false);
    }
  }, []);

  /**
   * Load and play audio from various sources
   * @param {Object|string} source - Can be:
   *   - Song object with localUri or remoteUrl
   *   - Direct URL string
   *   - Local file URI string
   */
  const play = useCallback(async (source) => {
    try {
      setIsLoading(true);
      setError(null);

      // Debug: log the source object
      console.log('Play called with source:', JSON.stringify(source, null, 2));

      // Unload previous sound
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      let audioSource;
      let sourceType = 'unknown';

      // Determine source type and create appropriate source object
      if (typeof source === 'string') {
        // Direct URL or URI string
        if (source.startsWith('file://') || source.startsWith('/')) {
          sourceType = 'local';
          audioSource = { uri: source };
        } else if (source.startsWith('http')) {
          sourceType = 'remote';
          audioSource = { uri: source };
        } else {
          throw new Error('Invalid audio source');
        }
      } else if (source && typeof source === 'object') {
        // Song object
        if (source.localUri) {
          // Local file (offline)
          sourceType = 'local';
          audioSource = { uri: source.localUri };
        } else if (source.remoteUrl || source.url) {
          // Remote stream
          sourceType = 'remote';
          audioSource = { uri: source.remoteUrl || source.url };
        } else if (source.audioId && source.isOffline) {
          // Need to get local URI from storage
          sourceType = 'local';
          const metadata = await melodixStorage.getAudioMetadata(source.audioId);
          if (metadata?.localUri) {
            audioSource = { uri: metadata.localUri };
          } else {
            throw new Error('Audio file not found in storage');
          }
        } else {
          throw new Error('Invalid song object - no playable source');
        }
      } else {
        throw new Error('Invalid audio source type');
      }

      console.log(`Loading audio (${sourceType}):`, audioSource.uri?.substring(0, 50));
      setCurrentSource({ ...source, sourceType });

      // Create and load the sound
      const { sound } = await Audio.Sound.createAsync(
        audioSource,
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );

      soundRef.current = sound;
      setIsPlaying(true);
      console.log('Audio loaded and playing');

    } catch (err) {
      console.error('Failed to play audio:', err);
      setError(err.message || 'Failed to play audio');
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
    }
  }, [onPlaybackStatusUpdate]);

  /**
   * Pause playback
   */
  const pause = useCallback(async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.pauseAsync();
        setIsPlaying(false);
      }
    } catch (err) {
      console.error('Failed to pause:', err);
    }
  }, []);

  /**
   * Resume playback
   */
  const resume = useCallback(async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.playAsync();
        setIsPlaying(true);
      }
    } catch (err) {
      console.error('Failed to resume:', err);
    }
  }, []);

  /**
   * Toggle play/pause
   */
  const togglePlayPause = useCallback(async () => {
    if (isPlaying) {
      await pause();
    } else {
      await resume();
    }
  }, [isPlaying, pause, resume]);

  /**
   * Seek to position
   * @param {number} seconds - Position in seconds
   */
  const seek = useCallback(async (seconds) => {
    try {
      if (soundRef.current) {
        const positionMillis = seconds * 1000;
        await soundRef.current.setPositionAsync(positionMillis);
        setCurrentTime(seconds);
      }
    } catch (err) {
      console.error('Failed to seek:', err);
    }
  }, []);

  /**
   * Seek by percentage (0-100)
   */
  const seekByPercent = useCallback(async (percent) => {
    if (duration > 0) {
      const seconds = (percent / 100) * duration;
      await seek(seconds);
    }
  }, [duration, seek]);

  /**
   * Stop playback
   */
  const stop = useCallback(async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.setPositionAsync(0);
        setIsPlaying(false);
        setCurrentTime(0);
        setProgress(0);
      }
    } catch (err) {
      console.error('Failed to stop:', err);
    }
  }, []);

  /**
   * Set callback for when playback ends
   */
  const setOnEnded = useCallback((callback) => {
    onEndedCallback.current = callback;
  }, []);

  /**
   * Set volume (0-1)
   */
  const setVolume = useCallback(async (volume) => {
    try {
      if (soundRef.current) {
        await soundRef.current.setVolumeAsync(Math.max(0, Math.min(1, volume)));
      }
    } catch (err) {
      console.error('Failed to set volume:', err);
    }
  }, []);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Format time in mm:ss
   */
  const formatTime = useCallback((seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    // State
    isPlaying,
    isLoading,
    progress,
    duration,
    currentTime,
    error,
    currentSource,
    
    // Actions
    play,
    pause,
    resume,
    togglePlayPause,
    seek,
    seekByPercent,
    stop,
    setVolume,
    setOnEnded,
    clearError,
    
    // Utilities
    formatTime,
  };
}
