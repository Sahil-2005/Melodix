import React, { useState, useCallback } from "react";
import { Search, Play, Plus, Download, Loader2, Music, ExternalLink, X } from "lucide-react";

// Free music API - using Jamendo (free music for personal use)
// You can also integrate: Spotify API, SoundCloud API, or YouTube Music API
const JAMENDO_CLIENT_ID = "your_client_id"; // Get free at https://devportal.jamendo.com/

// Mock data for demo (replace with real API when you have credentials)
const MOCK_SEARCH_RESULTS = [
  {
    id: "1",
    name: "Chill Vibes",
    artist: "Ambient Dreams",
    duration: 245,
    image: "https://picsum.photos/seed/music1/200",
    audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    source: "Free Music Archive",
  },
  {
    id: "2",
    name: "Electric Dreams",
    artist: "Synthwave Masters",
    duration: 312,
    image: "https://picsum.photos/seed/music2/200",
    audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    source: "Free Music Archive",
  },
  {
    id: "3",
    name: "Midnight Jazz",
    artist: "Smooth Operators",
    duration: 198,
    image: "https://picsum.photos/seed/music3/200",
    audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    source: "Free Music Archive",
  },
  {
    id: "4",
    name: "Ocean Waves",
    artist: "Nature Sounds",
    duration: 420,
    image: "https://picsum.photos/seed/music4/200",
    audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    source: "Free Music Archive",
  },
  {
    id: "5",
    name: "Lo-Fi Study",
    artist: "Chill Beats",
    duration: 267,
    image: "https://picsum.photos/seed/music5/200",
    audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    source: "Free Music Archive",
  },
  {
    id: "6",
    name: "Rock Anthem",
    artist: "Guitar Heroes",
    duration: 285,
    image: "https://picsum.photos/seed/music6/200",
    audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    source: "Free Music Archive",
  },
];

const formatDuration = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export default function MusicSearch({ onAddToPlaylist, playlists, currentPlaylist }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [previewTrack, setPreviewTrack] = useState(null);
  const [previewAudio, setPreviewAudio] = useState(null);
  const [showPlaylistModal, setShowPlaylistModal] = useState(null);

  // Search function - using mock data for demo
  // Replace with real API call when you have credentials
  const searchMusic = useCallback(async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Filter mock results based on query
      const filtered = MOCK_SEARCH_RESULTS.filter(
        (track) =>
          track.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          track.artist.toLowerCase().includes(searchQuery.toLowerCase())
      );

      // If no exact matches, show all mock results
      setResults(filtered.length > 0 ? filtered : MOCK_SEARCH_RESULTS);

      /* 
      // Real Jamendo API call (uncomment when you have credentials):
      const response = await fetch(
        `https://api.jamendo.com/v3.0/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=json&limit=20&search=${encodeURIComponent(searchQuery)}&include=musicinfo`
      );
      const data = await response.json();
      
      if (data.results) {
        setResults(data.results.map(track => ({
          id: track.id,
          name: track.name,
          artist: track.artist_name,
          duration: track.duration,
          image: track.image,
          audio: track.audio,
          source: "Jamendo"
        })));
      }
      */
    } catch (err) {
      setError("Failed to search music. Please try again.");
      console.error("Search error:", err);
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
    audio.play();
    setPreviewTrack(track);
    setPreviewAudio(audio);

    audio.onended = () => {
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
    };
    
    onAddToPlaylist(song, playlistName);
    setShowPlaylistModal(null);
  };

  const handleDownload = async (track) => {
    try {
      const response = await fetch(track.audio);
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
    }
  };

  const playlistNames = Object.keys(playlists);

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gradient mb-2">Discover Music</h2>
        <p className="text-gray-400">Search for free music and add it to your playlists</p>
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
        {["Chill", "Electronic", "Jazz", "Rock", "Lo-Fi", "Ambient"].map((tag) => (
          <button
            key={tag}
            onClick={() => {
              setQuery(tag);
              searchMusic(tag);
            }}
            className="px-4 py-2 rounded-full bg-white/5 text-sm text-gray-400 hover:text-white hover:bg-white/10 border border-white/10 transition-all duration-300"
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="text-center py-4">
          <p className="text-red-400">{error}</p>
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
                      e.target.src = `https://via.placeholder.com/200/1a1a2e/8b5cf6?text=${track.name.charAt(0)}`;
                    }}
                  />
                  <button
                    onClick={() => handlePreview(track)}
                    className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    {previewTrack?.id === track.id ? (
                      <div className="flex gap-1">
                        {[...Array(3)].map((_, i) => (
                          <div
                            key={i}
                            className="w-1 bg-white rounded-full music-bar"
                            style={{ height: "16px" }}
                          />
                        ))}
                      </div>
                    ) : (
                      <Play size={24} className="text-white" fill="white" />
                    )}
                  </button>
                </div>

                {/* Track Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-white truncate">{track.name}</h4>
                  <p className="text-sm text-gray-400 truncate">{track.artist}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">{formatDuration(track.duration)}</span>
                    <span className="text-xs text-gray-600">•</span>
                    <span className="text-xs text-purple-400">{track.source}</span>
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
                      <div className="absolute right-0 top-full mt-2 w-56 glass-card rounded-xl p-2 z-50 border border-white/10">
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
                          <p className="text-sm text-gray-500 px-3 py-2">No playlists yet</p>
                        ) : (
                          playlistNames.map((name) => (
                            <button
                              key={name}
                              onClick={() => handleAddToPlaylist(track, name)}
                              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-gray-300 hover:bg-white/10 transition-colors"
                            >
                              <Music size={16} className="text-purple-400" />
                              <span className="truncate">{name}</span>
                            </button>
                          ))
                        )}
                        {currentPlaylist && !playlistNames.includes(currentPlaylist) && (
                          <button
                            onClick={() => handleAddToPlaylist(track, currentPlaylist)}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-purple-400 hover:bg-white/10 transition-colors"
                          >
                            <Plus size={16} />
                            <span>Add to "{currentPlaylist}"</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Download */}
                  <button
                    onClick={() => handleDownload(track)}
                    className="p-3 rounded-xl bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200"
                    title="Download"
                  >
                    <Download size={18} />
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
          <p className="text-sm text-gray-500 mt-1">Try a different search term</p>
        </div>
      )}

      {/* Initial State */}
      {!query && results.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
            <Search size={40} className="text-purple-400" />
          </div>
          <p className="text-gray-400 mb-2">Search for your favorite music</p>
          <p className="text-sm text-gray-500">
            Discover millions of free tracks to add to your library
          </p>
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
              This search uses free, royalty-free music sources. All tracks are licensed for personal use. 
              For production or commercial use, please check the individual track licenses.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
