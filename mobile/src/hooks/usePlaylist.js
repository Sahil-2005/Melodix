/**
 * usePlaylist Hook for Melodix Mobile
 * Manages playlists with AsyncStorage and expo-file-system persistence
 */

import { useState, useCallback, useEffect } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import melodixStorage from '../services/storage';

export default function usePlaylist() {
  const [playlists, setPlaylists] = useState({});
  const [currentPlaylist, setCurrentPlaylist] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  /**
   * Load playlists from storage on mount
   */
  useEffect(() => {
    loadPlaylists();
  }, []);

  /**
   * Load all playlists from storage
   */
  const loadPlaylists = useCallback(async () => {
    try {
      setIsLoading(true);
      const savedPlaylists = await melodixStorage.getAllPlaylists();
      
      console.log('Loaded playlists:', Object.keys(savedPlaylists));

      // Convert to state format
      const playlistsState = {};
      for (const [name, playlist] of Object.entries(savedPlaylists)) {
        // Restore song objects with proper URIs
        const songs = await Promise.all(
          (playlist.songs || []).map(async (song) => {
            if (song.isOffline && song.audioId) {
              // Verify local file still exists
              const exists = await melodixStorage.audioFileExists(song.audioId);
              if (!exists) {
                console.warn('Audio file missing for:', song.name);
                return null;
              }
              // Get updated metadata
              const metadata = await melodixStorage.getAudioMetadata(song.audioId);
              return {
                ...song,
                localUri: metadata?.localUri || song.localUri,
              };
            }
            return song;
          })
        );

        // Filter out null (missing files)
        playlistsState[name] = songs.filter(Boolean);
      }

      setPlaylists(playlistsState);

      // Restore current playlist selection
      const lastPlaylist = await melodixStorage.getSetting('currentPlaylist');
      if (lastPlaylist && playlistsState[lastPlaylist]) {
        setCurrentPlaylist(lastPlaylist);
      }
    } catch (error) {
      console.error('Failed to load playlists:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  /**
   * Pull-to-refresh handler
   */
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPlaylists();
  }, [loadPlaylists]);

  /**
   * Save playlists to storage whenever they change
   */
  useEffect(() => {
    if (isLoading) return;

    const savePlaylists = async () => {
      try {
        for (const [name, songs] of Object.entries(playlists)) {
          await melodixStorage.savePlaylist(name, songs);
        }
        console.log('Playlists saved');
      } catch (error) {
        console.error('Failed to save playlists:', error);
      }
    };

    // Debounce save
    const timeoutId = setTimeout(savePlaylists, 500);
    return () => clearTimeout(timeoutId);
  }, [playlists, isLoading]);

  /**
   * Save current playlist selection
   */
  useEffect(() => {
    if (isLoading) return;
    melodixStorage.saveSetting('currentPlaylist', currentPlaylist);
  }, [currentPlaylist, isLoading]);

  /**
   * Create a new playlist
   */
  const createPlaylist = useCallback((name) => {
    if (!name || playlists[name]) return false;

    setPlaylists((prev) => ({ ...prev, [name]: [] }));
    console.log('Playlist created:', name);
    return true;
  }, [playlists]);

  /**
   * Delete a playlist
   */
  const deletePlaylist = useCallback(async (name, deleteAudioFiles = false) => {
    try {
      if (deleteAudioFiles) {
        const songs = playlists[name] || [];
        for (const song of songs) {
          if (song.audioId && song.isOffline) {
            await melodixStorage.deleteAudioFile(song.audioId);
          }
        }
      }

      await melodixStorage.deletePlaylist(name);

      setPlaylists((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });

      if (currentPlaylist === name) {
        setCurrentPlaylist(null);
      }

      console.log('Playlist deleted:', name);
    } catch (error) {
      console.error('Failed to delete playlist:', error);
    }
  }, [currentPlaylist, playlists]);

  /**
   * Select a playlist as current
   */
  const selectPlaylist = useCallback((name) => {
    setCurrentPlaylist(name);
  }, []);

  /**
   * Add a song to a playlist
   */
  const addSongToPlaylist = useCallback((song, playlistName) => {
    setPlaylists((prev) => {
      const existingPlaylist = prev[playlistName] || [];
      return {
        ...prev,
        [playlistName]: [...existingPlaylist, song],
      };
    });
    console.log('Song added to playlist:', song.name, '->', playlistName);
  }, []);

  /**
   * Remove a song from a playlist
   */
  const removeSongFromPlaylist = useCallback((playlistName, songIndex) => {
    setPlaylists((prev) => {
      const songs = [...(prev[playlistName] || [])];
      songs.splice(songIndex, 1);
      return { ...prev, [playlistName]: songs };
    });
  }, []);

  /**
   * Pick and add audio file from device
   */
  const pickAndAddAudioFile = useCallback(async (playlistName) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
        multiple: true,
      });

      if (result.canceled) {
        console.log('Document picker cancelled');
        return null;
      }

      const addedSongs = [];

      for (const file of result.assets) {
        console.log('Processing file:', file.name, file.uri);

        // Extract name without extension
        const name = file.name?.replace(/\.[^/.]+$/, '') || 'Unknown Track';

        // Save to app's document directory
        const audioRecord = await melodixStorage.saveAudioFile(file.uri, {
          name,
          artist: 'Local File',
          originalName: file.name,
        });

        const song = {
          id: audioRecord.id,
          audioId: audioRecord.id,
          localUri: audioRecord.localUri,
          name: audioRecord.name,
          artist: audioRecord.artist,
          duration: audioRecord.duration,
          isOffline: true,
          source: 'local',
          dateAdded: audioRecord.dateAdded,
        };

        // Add to playlist
        if (playlistName) {
          addSongToPlaylist(song, playlistName);
        }

        addedSongs.push(song);
      }

      console.log('Added', addedSongs.length, 'songs');
      return addedSongs;
    } catch (error) {
      console.error('Failed to pick audio file:', error);
      throw error;
    }
  }, [addSongToPlaylist]);

  /**
   * Download and save a remote song for offline playback
   */
  const saveForOffline = useCallback(async (song, playlistName) => {
    if (song.isOffline && song.audioId) {
      console.log('Song already saved offline');
      return song;
    }

    try {
      const url = song.remoteUrl || song.url;
      if (!url) {
        throw new Error('No URL to download');
      }

      const audioRecord = await melodixStorage.downloadAndSaveAudio(url, {
        name: song.name,
        artist: song.artist,
        duration: song.duration,
        image: song.image,
        album: song.album,
        source: song.source,
      });

      const offlineSong = {
        ...song,
        id: audioRecord.id,
        audioId: audioRecord.id,
        localUri: audioRecord.localUri,
        isOffline: true,
        savedAt: new Date().toISOString(),
      };

      // Update song in playlist if specified
      if (playlistName && playlists[playlistName]) {
        setPlaylists((prev) => ({
          ...prev,
          [playlistName]: prev[playlistName].map((s) =>
            s.id === song.id || s.name === song.name ? offlineSong : s
          ),
        }));
      }

      return offlineSong;
    } catch (error) {
      console.error('Failed to save for offline:', error);
      throw error;
    }
  }, [playlists]);

  /**
   * Add a remote song (from search) to a playlist
   */
  const addRemoteSongToPlaylist = useCallback((track, playlistName) => {
    const song = {
      id: track.id || `remote_${Date.now()}`,
      name: track.name,
      artist: track.artist,
      duration: track.duration,
      remoteUrl: track.remoteUrl || track.audio || track.url,
      image: track.image,
      album: track.album,
      source: track.source || 'remote',
      isOffline: false,
      isFromSearch: true,
      dateAdded: new Date().toISOString(),
    };

    addSongToPlaylist(song, playlistName);
    return song;
  }, [addSongToPlaylist]);

  /**
   * Get songs from current playlist
   */
  const getCurrentPlaylistSongs = useCallback(() => {
    if (!currentPlaylist) return [];
    return playlists[currentPlaylist] || [];
  }, [currentPlaylist, playlists]);

  /**
   * Get storage statistics
   */
  const getStorageStats = useCallback(async () => {
    return await melodixStorage.getStorageStats();
  }, []);

  /**
   * Clear all data
   */
  const clearAllData = useCallback(async () => {
    await melodixStorage.clearAll();
    setPlaylists({});
    setCurrentPlaylist(null);
  }, []);

  return {
    // State
    playlists,
    currentPlaylist,
    isLoading,
    refreshing,

    // Playlist Actions
    createPlaylist,
    deletePlaylist,
    selectPlaylist,
    
    // Song Actions
    addSongToPlaylist,
    removeSongFromPlaylist,
    pickAndAddAudioFile,
    saveForOffline,
    addRemoteSongToPlaylist,
    
    // Utilities
    getCurrentPlaylistSongs,
    getStorageStats,
    clearAllData,
    onRefresh,
    loadPlaylists,
  };
}
