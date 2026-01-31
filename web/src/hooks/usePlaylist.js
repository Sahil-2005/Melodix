import { useState, useCallback, useEffect } from "react";
import useLocalStorage from "./useLocalStorage";

export default function usePlaylist() {
  // Persist playlists to localStorage (only metadata, not blob URLs)
  const [savedPlaylists, setSavedPlaylists] = useLocalStorage("playlists", {});
  const [playlists, setPlaylists] = useState({});
  const [currentPlaylist, setCurrentPlaylist] = useLocalStorage("currentPlaylist", null);

  // Load playlists from localStorage on mount
  useEffect(() => {
    // Filter out songs with blob URLs (they won't work after page refresh)
    // Keep only songs from search (with regular URLs)
    const loadedPlaylists = {};
    Object.entries(savedPlaylists).forEach(([name, songs]) => {
      loadedPlaylists[name] = songs.filter(song => 
        song.isFromSearch || (song.url && !song.url.startsWith("blob:"))
      );
    });
    setPlaylists(loadedPlaylists);
  }, []);

  // Save playlists to localStorage whenever they change
  useEffect(() => {
    // Only save songs that can be restored (not blob URLs from local uploads)
    const playlistsToSave = {};
    Object.entries(playlists).forEach(([name, songs]) => {
      playlistsToSave[name] = songs.filter(song => 
        song.isFromSearch || (song.url && !song.url.startsWith("blob:"))
      );
    });
    setSavedPlaylists(playlistsToSave);
  }, [playlists, setSavedPlaylists]);

  const createPlaylist = useCallback((name) => {
    if (!name || playlists[name]) return false;
    
    setPlaylists((prev) => ({ ...prev, [name]: [] }));
    return true;
  }, [playlists]);

  const deletePlaylist = useCallback((name) => {
    setPlaylists((prev) => {
      const updated = { ...prev };
      delete updated[name];
      return updated;
    });

    if (currentPlaylist === name) {
      setCurrentPlaylist(null);
    }
  }, [currentPlaylist, setCurrentPlaylist]);

  const selectPlaylist = useCallback((name) => {
    setCurrentPlaylist(name);
  }, [setCurrentPlaylist]);

  const addSongsToPlaylist = useCallback((playlistName, songs) => {
    setPlaylists((prev) => ({
      ...prev,
      [playlistName]: [...(prev[playlistName] || []), ...songs],
    }));
  }, []);

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

  const removeSongFromPlaylist = useCallback((playlistName, songIndex) => {
    setPlaylists((prev) => {
      const updatedSongs = [...prev[playlistName]];
      updatedSongs.splice(songIndex, 1);
      return { ...prev, [playlistName]: updatedSongs };
    });
  }, []);

  const getCurrentPlaylistSongs = useCallback(() => {
    if (!currentPlaylist) return [];
    return playlists[currentPlaylist] || [];
  }, [currentPlaylist, playlists]);

  return {
    playlists,
    currentPlaylist,
    createPlaylist,
    deletePlaylist,
    selectPlaylist,
    addSongsToPlaylist,
    addSingleSongToPlaylist,
    removeSongFromPlaylist,
    getCurrentPlaylistSongs,
    setPlaylists,
  };
}
