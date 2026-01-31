import { useState, useCallback, useEffect } from "react";
import melodixDB from "../services/indexedDB";

/**
 * Hook for managing playlists with IndexedDB persistence
 * Handles both offline (stored) and streaming (URL-based) songs
 */
export default function usePlaylist() {
  const [playlists, setPlaylists] = useState({});
  const [currentPlaylist, setCurrentPlaylist] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load playlists from IndexedDB on mount
  useEffect(() => {
    const loadPlaylists = async () => {
      try {
        setIsLoading(true);
        const savedPlaylists = await melodixDB.getAllPlaylists();
        
        console.log("Loaded playlists from IndexedDB:", savedPlaylists);
        
        // Restore blob URLs for offline songs
        const playlistsWithUrls = {};
        for (const [name, songs] of Object.entries(savedPlaylists)) {
          console.log(`Processing playlist "${name}" with ${songs?.length || 0} songs`);
          
          if (!songs || !Array.isArray(songs)) {
            playlistsWithUrls[name] = [];
            continue;
          }
          
          playlistsWithUrls[name] = await Promise.all(
            songs.map(async (song) => {
              console.log("Processing song:", song.name, "audioId:", song.audioId, "isOffline:", song.isOffline);
              
              if (song.audioId && song.isOffline) {
                // Get blob URL for offline songs
                const blobUrl = await melodixDB.getAudioUrl(song.audioId);
                console.log("Restored blob URL for:", song.name, blobUrl ? "success" : "failed");
                if (blobUrl) {
                  return { ...song, url: blobUrl };
                }
                // If blob URL couldn't be created, the audio file might be missing
                console.warn("Audio file missing for song:", song.name);
                return null;
              }
              return song;
            })
          );
          
          // Filter out null entries (songs with missing audio files)
          playlistsWithUrls[name] = playlistsWithUrls[name].filter(song => song !== null);
        }
        
        console.log("Final playlists with URLs:", playlistsWithUrls);
        setPlaylists(playlistsWithUrls);
        
        // Load last selected playlist
        const lastPlaylist = await melodixDB.getSetting("currentPlaylist");
        if (lastPlaylist && playlistsWithUrls[lastPlaylist]) {
          setCurrentPlaylist(lastPlaylist);
        }
      } catch (error) {
        console.error("Failed to load playlists:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPlaylists();
  }, []);

  // Save playlists to IndexedDB whenever they change
  useEffect(() => {
    if (isLoading) return;

    const savePlaylists = async () => {
      try {
        for (const [name, songs] of Object.entries(playlists)) {
          console.log(`Saving playlist "${name}" with ${songs.length} songs:`, songs.map(s => ({
            name: s.name,
            audioId: s.audioId,
            isOffline: s.isOffline
          })));
          // Save playlist metadata (without blob URLs)
          await melodixDB.savePlaylist(name, songs);
        }
      } catch (error) {
        console.error("Failed to save playlists:", error);
      }
    };

    savePlaylists();
  }, [playlists, isLoading]);

  // Save current playlist selection
  useEffect(() => {
    if (isLoading) return;
    melodixDB.saveSetting("currentPlaylist", currentPlaylist);
  }, [currentPlaylist, isLoading]);

  /**
   * Create a new playlist
   */
  const createPlaylist = useCallback((name) => {
    if (!name || playlists[name]) return false;
    
    setPlaylists((prev) => ({ ...prev, [name]: [] }));
    return true;
  }, [playlists]);

  /**
   * Delete a playlist and optionally its audio files
   */
  const deletePlaylist = useCallback(async (name, deleteAudioFiles = false) => {
    if (deleteAudioFiles) {
      // Delete associated audio files from IndexedDB
      const songs = playlists[name] || [];
      for (const song of songs) {
        if (song.audioId) {
          await melodixDB.deleteAudioFile(song.audioId);
        }
      }
    }
    
    await melodixDB.deletePlaylist(name);
    
    setPlaylists((prev) => {
      const updated = { ...prev };
      delete updated[name];
      return updated;
    });

    if (currentPlaylist === name) {
      setCurrentPlaylist(null);
    }
  }, [currentPlaylist, playlists]);

  /**
   * Select a playlist as current
   */
  const selectPlaylist = useCallback((name) => {
    setCurrentPlaylist(name);
  }, []);

  /**
   * Add multiple songs to a playlist
   */
  const addSongsToPlaylist = useCallback((playlistName, songs) => {
    setPlaylists((prev) => ({
      ...prev,
      [playlistName]: [...(prev[playlistName] || []), ...songs],
    }));
  }, []);

  /**
   * Add a single song to a playlist (creates playlist if needed)
   */
  const addSingleSongToPlaylist = useCallback((song, playlistName) => {
    if (!playlistName || !playlists[playlistName]) {
      // Create playlist if it doesn't exist
      setPlaylists((prev) => ({
        ...prev,
        [playlistName]: [song],
      }));
    } else {
      setPlaylists((prev) => ({
        ...prev,
        [playlistName]: [...prev[playlistName], song],
      }));
    }
  }, [playlists]);

  /**
   * Add an audio file (from upload) - saves to IndexedDB
   */
  const addAudioFile = useCallback(async (file, playlistName, metadata = {}) => {
    try {
      // Save the audio blob to IndexedDB
      const audioRecord = await melodixDB.saveAudioFile(file, {
        name: metadata.name || file.name.replace(/\.[^/.]+$/, ""),
        artist: metadata.artist || "Local File",
        originalName: file.name,
        ...metadata,
      });

      // Create a blob URL for playback
      const blobUrl = await melodixDB.getAudioUrl(audioRecord.id);

      // Create song object with reference to stored audio
      const song = {
        id: audioRecord.id,
        audioId: audioRecord.id,
        url: blobUrl,
        name: audioRecord.name,
        artist: audioRecord.artist,
        duration: audioRecord.duration,
        isOffline: true,
        source: "local",
        dateAdded: audioRecord.dateAdded,
      };

      // Add to playlist
      if (playlistName) {
        addSingleSongToPlaylist(song, playlistName);
      }

      return song;
    } catch (error) {
      console.error("Failed to add audio file:", error);
      throw error;
    }
  }, [addSingleSongToPlaylist]);

  /**
   * Download and save a streaming song for offline playback
   */
  const saveForOffline = useCallback(async (song, playlistName) => {
    if (song.isOffline && song.audioId) {
      console.log("Song is already saved offline");
      return song;
    }

    try {
      // Download the audio and save to IndexedDB
      const audioRecord = await melodixDB.downloadAndSave(song.url, {
        name: song.name,
        artist: song.artist,
        duration: song.duration,
        image: song.image,
        originalUrl: song.url,
        source: song.source,
      });

      // Create blob URL for playback
      const blobUrl = await melodixDB.getAudioUrl(audioRecord.id);

      // Create updated song object
      const offlineSong = {
        ...song,
        id: audioRecord.id,
        audioId: audioRecord.id,
        url: blobUrl,
        isOffline: true,
        savedAt: new Date().toISOString(),
      };

      // Update song in playlist if specified
      if (playlistName && playlists[playlistName]) {
        setPlaylists((prev) => ({
          ...prev,
          [playlistName]: prev[playlistName].map((s) =>
            s.url === song.url || s.id === song.id ? offlineSong : s
          ),
        }));
      }

      return offlineSong;
    } catch (error) {
      console.error("Failed to save song for offline:", error);
      throw error;
    }
  }, [playlists]);

  /**
   * Remove a song from a playlist
   */
  const removeSongFromPlaylist = useCallback(async (playlistName, songIndex, deleteAudioFile = false) => {
    const song = playlists[playlistName]?.[songIndex];
    
    if (deleteAudioFile && song?.audioId) {
      await melodixDB.deleteAudioFile(song.audioId);
    }

    // Revoke blob URL to prevent memory leak
    if (song?.url?.startsWith("blob:")) {
      URL.revokeObjectURL(song.url);
    }

    setPlaylists((prev) => {
      const updatedSongs = [...prev[playlistName]];
      updatedSongs.splice(songIndex, 1);
      return { ...prev, [playlistName]: updatedSongs };
    });
  }, [playlists]);

  /**
   * Get songs from current playlist
   */
  const getCurrentPlaylistSongs = useCallback(() => {
    if (!currentPlaylist) return [];
    return playlists[currentPlaylist] || [];
  }, [currentPlaylist, playlists]);

  /**
   * Refresh blob URL for a song (useful if URL expired)
   */
  const refreshSongUrl = useCallback(async (song) => {
    if (song.audioId && song.isOffline) {
      const newUrl = await melodixDB.getAudioUrl(song.audioId);
      return { ...song, url: newUrl };
    }
    return song;
  }, []);

  /**
   * Get storage statistics
   */
  const getStorageStats = useCallback(async () => {
    return await melodixDB.getStorageStats();
  }, []);

  /**
   * Clear all data
   */
  const clearAllData = useCallback(async () => {
    await melodixDB.clearAll();
    setPlaylists({});
    setCurrentPlaylist(null);
  }, []);

  return {
    playlists,
    currentPlaylist,
    isLoading,
    createPlaylist,
    deletePlaylist,
    selectPlaylist,
    addSongsToPlaylist,
    addSingleSongToPlaylist,
    addAudioFile,
    saveForOffline,
    removeSongFromPlaylist,
    getCurrentPlaylistSongs,
    refreshSongUrl,
    getStorageStats,
    clearAllData,
    setPlaylists,
  };
}
