import React, { useState, useCallback, useEffect, useRef } from "react";
import { Search, Play, Plus, Download, Loader2, Music, ExternalLink, X, WifiOff, Check, Pause, Volume2, AlertTriangle } from "lucide-react";

// iTunes Search API - Very reliable, no rate limits, 30-second previews
// Note: iTunes API has CORS enabled, but we use proxy for consistency
const ITUNES_API_BASE = "/api/itunes";

// Jamendo API as fallback (may hit rate limits)
const JAMENDO_API_BASE = "/api/jamendo/v3.0";
const JAMENDO_CLIENT_ID = "b6747d04";

const formatDuration = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export default function MusicSearch({ 
  onAddToPlaylist, 
  onSaveOffline, 
  onPlaySong,           // New: Play song in main player
  currentlyPlaying,     // New: Currently playing song info
  isPlaying,            // New: Is main player playing
  playlists, 
  currentPlaylist 
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [previewTrack, setPreviewTrack] = useState(null);
  const [previewAudio, setPreviewAudio] = useState(null);
  const [showPlaylistModal, setShowPlaylistModal] = useState(null);
  const [downloadingTracks, setDownloadingTracks] = useState(new Set());
  const [savedTracks, setSavedTracks] = useState(new Set());
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowPlaylistModal(null);
      }
    };

    if (showPlaylistModal) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showPlaylistModal]);

  // Stop preview when main player starts
  useEffect(() => {
    if (isPlaying && previewAudio) {
      previewAudio.pause();
      setPreviewTrack(null);
      setPreviewAudio(null);
    }
  }, [isPlaying, previewAudio]);

  // Search iTunes API for music (primary - very reliable)
  const searchMusic = useCallback(async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Use iTunes Search API (very reliable, no rate limits)
      const response = await fetch(
        `${ITUNES_API_BASE}/search?term=${encodeURIComponent(searchQuery)}&media=music&entity=song&limit=25`
      );
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const tracks = data.results
          .filter(track => track.previewUrl) // Only include tracks with previews
          .map(track => ({
            id: `itunes_${track.trackId}`,
            name: track.trackName,
            artist: track.artistName,
            artistId: track.artistId,
            duration: Math.floor(track.trackTimeMillis / 1000), // Convert ms to seconds
            image: track.artworkUrl100?.replace('100x100', '200x200') || track.artworkUrl60,
            audio: track.previewUrl, // 30 second preview URL
            audioDownload: track.previewUrl,
            source: "iTunes",
            album: track.collectionName,
            genre: track.primaryGenreName,
            releaseDate: track.releaseDate,
            isPreviewOnly: true, // iTunes provides ~30s previews
          }));
        
        if (tracks.length > 0) {
          setResults(tracks);
          return;
        }
      }
      
      // No results found
      setError("No results found. Try a different search term.");
    } catch (err) {
      console.error("Search error:", err);
      
      if (err.message.includes("Failed to fetch")) {
        setError("Network error. Please check your internet connection.");
      } else {
        setError(`Failed to search: ${err.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get popular/featured tracks using iTunes
  const getPopularTracks = useCallback(async (tag = "") => {
    setIsLoading(true);
    setError(null);

    try {
      // Use iTunes search with genre or popular terms
      const searchTerm = tag || "top hits 2024";
      const response = await fetch(
        `${ITUNES_API_BASE}/search?term=${encodeURIComponent(searchTerm)}&media=music&entity=song&limit=25`
      );
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const tracks = data.results
          .filter(track => track.previewUrl)
          .map(track => ({
            id: `itunes_${track.trackId}`,
            name: track.trackName,
            artist: track.artistName,
            artistId: track.artistId,
            duration: Math.floor(track.trackTimeMillis / 1000),
            image: track.artworkUrl100?.replace('100x100', '200x200') || track.artworkUrl60,
            audio: track.previewUrl,
            audioDownload: track.previewUrl,
            source: "iTunes",
            album: track.collectionName,
            genre: track.primaryGenreName,
            isPreviewOnly: true,
          }));
        
        if (tracks.length > 0) {
          setResults(tracks);
          return;
        }
      }
      
      setError("No popular tracks available. Try searching for something specific.");
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

  // Play track in main player (not preview)
  const handlePlayInMainPlayer = (track) => {
    // Stop any preview first
    if (previewAudio) {
      previewAudio.pause();
      setPreviewTrack(null);
      setPreviewAudio(null);
    }

    const song = {
      url: track.audio,
      name: track.name,
      artist: track.artist,
      duration: track.duration,
      image: track.image,
      source: track.source,
      type: 'remote',          // Mark as remote URL (won't break on refresh)
      isFromSearch: true,
      isOffline: false,
      jamendoId: track.id,
      license: track.license,
      album: track.album,
    };
    
    if (onPlaySong) {
      onPlaySong(song);
    }
  };

  // Check if this track is currently playing in main player
  const isTrackPlaying = (track) => {
    return isPlaying && currentlyPlaying?.jamendoId === track.id;
  };

  const handleAddToPlaylist = (track, playlistName) => {
    const song = {
      url: track.audio,
      name: track.name,
      artist: track.artist,
      duration: track.duration,
      image: track.image,
      source: track.source,
      type: 'remote',          // Mark as remote URL (persists correctly)
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
          <div className="grid gap-3 overflow-visible">
            {results.map((track) => (
              <div
                key={track.id}
                className={`group relative flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 overflow-visible ${
                  isTrackPlaying(track)
                    ? "bg-gradient-to-r from-green-500/20 to-cyan-500/20 border border-green-500/30"
                    : previewTrack?.id === track.id
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
                  {/* Play in Main Player button */}
                  <button
                    onClick={() => handlePlayInMainPlayer(track)}
                    className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
                      isTrackPlaying(track) 
                        ? "bg-black/50 opacity-100" 
                        : "bg-black/50 opacity-0 group-hover:opacity-100"
                    }`}
                    title="Play in main player"
                  >
                    {isTrackPlaying(track) ? (
                      <Volume2 size={24} className="text-green-400 animate-pulse" />
                    ) : (
                      <Play size={24} className="text-white" fill="white" />
                    )}
                  </button>
                </div>

                {/* Track Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-white truncate">{track.name}</h4>
                    {isTrackPlaying(track) && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/20 text-xs text-green-400">
                        <Volume2 size={10} className="animate-pulse" />
                        Playing
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 truncate">{track.artist}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-xs text-gray-500">{formatDuration(track.duration)}</span>
                    <span className="text-xs text-gray-600">•</span>
                    <span className={`text-xs ${track.source === "iTunes" ? "text-pink-400" : "text-purple-400"}`}>{track.source}</span>
                    {track.isPreviewOnly && (
                      <>
                        <span className="text-xs text-gray-600">•</span>
                        <span className="inline-flex items-center gap-1 text-xs text-yellow-400">
                          <AlertTriangle size={10} />
                          30s preview
                        </span>
                      </>
                    )}
                    {track.genre && (
                      <>
                        <span className="text-xs text-gray-600">•</span>
                        <span className="text-xs text-cyan-400">{track.genre}</span>
                      </>
                    )}
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
                  {/* Preview Button */}
                  <button
                    onClick={() => handlePreview(track)}
                    className={`p-3 rounded-xl transition-all duration-200 ${
                      previewTrack?.id === track.id
                        ? "bg-purple-500/30 text-purple-300"
                        : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                    }`}
                    title={previewTrack?.id === track.id ? "Stop preview" : "Quick preview"}
                  >
                    {previewTrack?.id === track.id ? (
                      <Pause size={18} />
                    ) : (
                      <Volume2 size={18} />
                    )}
                  </button>
                  {/* Add to Playlist */}
                  <div className="relative" ref={showPlaylistModal === track.id ? dropdownRef : null}>
                    <button
                      onClick={() => setShowPlaylistModal(showPlaylistModal === track.id ? null : track.id)}
                      className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:scale-105 transition-transform duration-200"
                      title="Add to playlist"
                    >
                      <Plus size={18} />
                    </button>

                    {/* Playlist Dropdown */}
                    {showPlaylistModal === track.id && (
                      <div className="fixed inset-0 z-[99]" onClick={() => setShowPlaylistModal(null)} />
                    )}
                    {showPlaylistModal === track.id && (
                      <div className="absolute right-0 bottom-full mb-2 w-64 rounded-xl p-2 z-[100] border border-white/20 bg-gray-900/95 backdrop-blur-xl shadow-2xl shadow-black/50 max-h-80 overflow-y-auto">
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
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0">
            <Music size={20} className="text-pink-400" />
          </div>
          <div>
            <h4 className="font-semibold text-white mb-1">About Music Search</h4>
            <p className="text-sm text-gray-400 leading-relaxed">
              Powered by <span className="text-pink-400">iTunes</span>. 
              All tracks are <span className="text-yellow-400">~30 second previews</span>. 
              <span className="text-cyan-400 ml-1">Upload your own MP3 files</span> from the library tab for full-length playback.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
