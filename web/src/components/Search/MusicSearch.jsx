import React, { useState, useCallback } from "react";
import { Search, Play, Plus, Download, Loader2, Music, ExternalLink, X, WifiOff, Check, Pause } from "lucide-react";

// Jamendo API - Free music API
// Using Vite proxy to bypass CORS issues in development
const JAMENDO_API_BASE = "/api/jamendo/v3.0";
const JAMENDO_CLIENT_ID = "b6747d04"; // Public client ID

const formatDuration = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export default function MusicSearch({ onAddToPlaylist, onSaveOffline, playlists, currentPlaylist }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [previewTrack, setPreviewTrack] = useState(null);
  const [previewAudio, setPreviewAudio] = useState(null);
  const [showPlaylistModal, setShowPlaylistModal] = useState(null);
  const [downloadingTracks, setDownloadingTracks] = useState(new Set());
  const [savedTracks, setSavedTracks] = useState(new Set());

  // Search Jamendo API for music
  const searchMusic = useCallback(async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Using Vite proxy to bypass CORS
      const response = await fetch(
        `${JAMENDO_API_BASE}/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=json&limit=20&search=${encodeURIComponent(searchQuery)}&include=musicinfo&audioformat=mp32`
      );
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.headers?.status === "success" && data.results) {
        const tracks = data.results.map(track => ({
          id: track.id,
          name: track.name,
          artist: track.artist_name,
          artistId: track.artist_id,
          duration: track.duration,
          image: track.image || `https://via.placeholder.com/200/1a1a2e/8b5cf6?text=${encodeURIComponent(track.name.charAt(0))}`,
          audio: track.audio, // MP3 streaming URL
          audioDownload: track.audiodownload || track.audio, // Download URL
          license: track.license_ccurl,
          source: "Jamendo",
          album: track.album_name,
          releaseDate: track.releasedate,
        }));
        
        setResults(tracks);
        
        if (tracks.length === 0) {
          setError("No results found. Try a different search term.");
        }
      } else {
        throw new Error(data.headers?.error_message || "Unknown API error");
      }
    } catch (err) {
      console.error("Search error:", err);
      
      // Provide helpful error messages
      if (err.message.includes("Failed to fetch")) {
        setError("Network error. Please check your internet connection.");
      } else {
        setError(`Failed to search: ${err.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get popular/featured tracks
  const getPopularTracks = useCallback(async (tag = "") => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        client_id: JAMENDO_CLIENT_ID,
        format: "json",
        limit: "20",
        include: "musicinfo",
        audioformat: "mp32",
        order: "popularity_week",
      });

      if (tag) {
        params.append("tags", tag.toLowerCase());
      }

      const response = await fetch(`${JAMENDO_API_BASE}/tracks/?${params}`);
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.headers?.status === "success" && data.results) {
        setResults(data.results.map(track => ({
          id: track.id,
          name: track.name,
          artist: track.artist_name,
          artistId: track.artist_id,
          duration: track.duration,
          image: track.image || `https://via.placeholder.com/200/1a1a2e/8b5cf6?text=${encodeURIComponent(track.name.charAt(0))}`,
          audio: track.audio,
          audioDownload: track.audiodownload || track.audio,
          license: track.license_ccurl,
          source: "Jamendo",
          album: track.album_name,
        })));
      }
    } catch (err) {
      console.error("Failed to get popular tracks:", err);
      setError("Failed to load popular tracks.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    searchMusic(query);
  };

  const handlePreview = (track) => {
    if (previewAudio) {
      previewAudio.pause();
    }

    if (previewTrack?.id === track.id) {
      setPreviewTrack(null);
      setPreviewAudio(null);
      return;
    }

    const audio = new Audio(track.audio);
    audio.play().catch(err => {
      console.error("Preview playback error:", err);
      setError("Failed to preview track. It may not be available in your region.");
    });
    setPreviewTrack(track);
    setPreviewAudio(audio);

    audio.onended = () => {
      setPreviewTrack(null);
      setPreviewAudio(null);
    };

    audio.onerror = () => {
      setPreviewTrack(null);
      setPreviewAudio(null);
    };
  };

  const handleAddToPlaylist = (track, playlistName) => {
    const song = {
      url: track.audio,
      name: track.name,
      artist: track.artist,
      duration: track.duration,
      image: track.image,
      source: track.source,
      isFromSearch: true,
      isOffline: false,
      jamendoId: track.id,
      license: track.license,
      album: track.album,
    };
    
    onAddToPlaylist(song, playlistName);
    setShowPlaylistModal(null);
  };

  // Save track for offline playback
  const handleSaveOffline = async (track, playlistName) => {
    if (downloadingTracks.has(track.id)) return;
    
    setDownloadingTracks(prev => new Set([...prev, track.id]));
    
    try {
      const song = {
        url: track.audioDownload || track.audio,
        name: track.name,
        artist: track.artist,
        duration: track.duration,
        image: track.image,
        source: track.source,
        isFromSearch: true,
        jamendoId: track.id,
        license: track.license,
        album: track.album,
      };
      
      if (onSaveOffline) {
        await onSaveOffline(song, playlistName);
        setSavedTracks(prev => new Set([...prev, track.id]));
      }
      
      setShowPlaylistModal(null);
    } catch (err) {
      console.error("Failed to save offline:", err);
      setError("Failed to save track offline. Please try again.");
    } finally {
      setDownloadingTracks(prev => {
        const newSet = new Set(prev);
        newSet.delete(track.id);
        return newSet;
      });
    }
  };

  const handleDownload = async (track) => {
    try {
      setDownloadingTracks(prev => new Set([...prev, `download_${track.id}`]));
      
      const response = await fetch(track.audioDownload || track.audio);
      if (!response.ok) throw new Error("Download failed");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${track.name} - ${track.artist}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error:", err);
      setError("Failed to download track. Please try again.");
    } finally {
      setDownloadingTracks(prev => {
        const newSet = new Set(prev);
        newSet.delete(`download_${track.id}`);
        return newSet;
      });
    }
  };

  const playlistNames = Object.keys(playlists);

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gradient mb-2">Discover Music</h2>
        <p className="text-gray-400">Search millions of free, legal tracks from Jamendo</p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for songs, artists..."
            className="w-full pl-12 pr-32 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all duration-300"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2.5 rounded-xl btn-premium text-white font-medium disabled:opacity-50 transition-all duration-300"
          >
            {isLoading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              "Search"
            )}
          </button>
        </div>
      </form>

      {/* Quick Search Tags */}
      <div className="flex flex-wrap justify-center gap-2">
        {["Chill", "Electronic", "Jazz", "Rock", "Pop", "Classical", "Hip-Hop", "Ambient"].map((tag) => (
          <button
            key={tag}
            onClick={() => {
              setQuery(tag);
              getPopularTracks(tag);
            }}
            className="px-4 py-2 rounded-full bg-white/5 text-sm text-gray-400 hover:text-white hover:bg-white/10 border border-white/10 transition-all duration-300"
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="text-center py-4 glass-card rounded-xl mx-auto max-w-md">
          <p className="text-red-400">{error}</p>
          <button 
            onClick={() => setError(null)} 
            className="mt-2 text-sm text-gray-500 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Search Results */}
      {results.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-300 mb-4">
            Search Results ({results.length})
          </h3>
          <div className="grid gap-3">
            {results.map((track) => (
              <div
                key={track.id}
                className={`group relative flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 ${
                  previewTrack?.id === track.id
                    ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30"
                    : "glass-card hover:bg-white/10"
                }`}
              >
                {/* Album Art */}
                <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                  <img
                    src={track.image}
                    alt={track.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = `https://via.placeholder.com/200/1a1a2e/8b5cf6?text=${encodeURIComponent(track.name.charAt(0))}`;
                    }}
                  />
                  <button
                    onClick={() => handlePreview(track)}
                    className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    {previewTrack?.id === track.id ? (
                      <Pause size={24} className="text-white" fill="white" />
                    ) : (
                      <Play size={24} className="text-white" fill="white" />
                    )}
                  </button>
                </div>

                {/* Track Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-white truncate">{track.name}</h4>
                  <p className="text-sm text-gray-400 truncate">{track.artist}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-xs text-gray-500">{formatDuration(track.duration)}</span>
                    <span className="text-xs text-gray-600">•</span>
                    <span className="text-xs text-purple-400">{track.source}</span>
                    {track.album && (
                      <>
                        <span className="text-xs text-gray-600">•</span>
                        <span className="text-xs text-gray-500 truncate max-w-[100px]">{track.album}</span>
                      </>
                    )}
                    {savedTracks.has(track.id) && (
                      <span className="inline-flex items-center gap-1 text-xs text-green-400">
                        <WifiOff size={10} />
                        Offline
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {/* Add to Playlist */}
                  <div className="relative">
                    <button
                      onClick={() => setShowPlaylistModal(showPlaylistModal === track.id ? null : track.id)}
                      className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:scale-105 transition-transform duration-200"
                      title="Add to playlist"
                    >
                      <Plus size={18} />
                    </button>

                    {/* Playlist Dropdown */}
                    {showPlaylistModal === track.id && (
                      <div className="absolute right-0 top-full mt-2 w-64 glass-card rounded-xl p-2 z-50 border border-white/10">
                        <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 mb-2">
                          <span className="text-sm font-medium text-gray-300">Add to Playlist</span>
                          <button
                            onClick={() => setShowPlaylistModal(null)}
                            className="text-gray-500 hover:text-white"
                          >
                            <X size={16} />
                          </button>
                        </div>
                        
                        {playlistNames.length === 0 ? (
                          <p className="text-sm text-gray-500 px-3 py-2">No playlists yet. Create one first!</p>
                        ) : (
                          <>
                            {/* Stream option */}
                            <div className="px-3 py-2 text-xs text-gray-500 uppercase tracking-wider">Stream</div>
                            {playlistNames.map((name) => (
                              <button
                                key={`stream-${name}`}
                                onClick={() => handleAddToPlaylist(track, name)}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-gray-300 hover:bg-white/10 transition-colors"
                              >
                                <Music size={16} className="text-purple-400" />
                                <span className="truncate flex-1">{name}</span>
                                <span className="text-xs text-gray-500">Stream</span>
                              </button>
                            ))}
                            
                            {/* Offline option */}
                            <div className="px-3 py-2 mt-2 text-xs text-gray-500 uppercase tracking-wider border-t border-white/10">Save Offline</div>
                            {playlistNames.map((name) => (
                              <button
                                key={`offline-${name}`}
                                onClick={() => handleSaveOffline(track, name)}
                                disabled={downloadingTracks.has(track.id) || savedTracks.has(track.id)}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-gray-300 hover:bg-white/10 transition-colors disabled:opacity-50"
                              >
                                {downloadingTracks.has(track.id) ? (
                                  <Loader2 size={16} className="text-cyan-400 animate-spin" />
                                ) : savedTracks.has(track.id) ? (
                                  <Check size={16} className="text-green-400" />
                                ) : (
                                  <WifiOff size={16} className="text-cyan-400" />
                                )}
                                <span className="truncate flex-1">{name}</span>
                                <span className="text-xs text-gray-500">
                                  {savedTracks.has(track.id) ? "Saved" : "Offline"}
                                </span>
                              </button>
                            ))}
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Download */}
                  <button
                    onClick={() => handleDownload(track)}
                    disabled={downloadingTracks.has(`download_${track.id}`)}
                    className="p-3 rounded-xl bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200 disabled:opacity-50"
                    title="Download MP3"
                  >
                    {downloadingTracks.has(`download_${track.id}`) ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Download size={18} />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && results.length === 0 && query && (
        <div className="text-center py-12">
          <Music size={48} className="mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400">No results found for "{query}"</p>
          <p className="text-sm text-gray-500 mt-1">Try a different search term or browse by genre</p>
        </div>
      )}

      {/* Initial State */}
      {!query && results.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
            <Search size={40} className="text-purple-400" />
          </div>
          <p className="text-gray-400 mb-2">Search for your favorite music</p>
          <p className="text-sm text-gray-500 mb-6">
            Discover millions of free, royalty-free tracks
          </p>
          <button
            onClick={() => getPopularTracks()}
            className="btn-premium px-6 py-3 rounded-xl text-white font-medium"
          >
            Browse Popular Tracks
          </button>
        </div>
      )}

      {/* Info Card */}
      <div className="glass-card rounded-2xl p-6 mt-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center flex-shrink-0">
            <ExternalLink size={20} className="text-cyan-400" />
          </div>
          <div>
            <h4 className="font-semibold text-white mb-1">About Music Search</h4>
            <p className="text-sm text-gray-400 leading-relaxed">
              Powered by <span className="text-purple-400">Jamendo</span> - all tracks are free for personal use under Creative Commons licenses. 
              <span className="text-cyan-400 ml-1">Save offline</span> to store tracks in your browser and play without internet.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
