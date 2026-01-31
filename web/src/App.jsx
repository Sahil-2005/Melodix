import React, { useState, useEffect, useCallback } from "react";
import {
  Header,
  FileUpload,
  PlaylistForm,
  PlaylistList,
  SongList,
  NowPlaying,
  Navbar,
  MusicSearch,
} from "./components";
import { useAudioPlayer, usePlaylist } from "./hooks";
import { Loader2, WifiOff, AlertCircle, HardDrive } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [currentSongIndex, setCurrentSongIndex] = useState(null);
  const [unassignedSongs, setUnassignedSongs] = useState([]);
  const [storageStats, setStorageStats] = useState(null);

  const {
    audioRef,
    isPlaying,
    progress,
    duration,
    currentTime,
    error: audioError,
    isLoading: audioLoading,
    play,
    togglePlayPause,
    seek,
    setOnEnded,
    clearError,
  } = useAudioPlayer();

  const {
    playlists,
    currentPlaylist,
    isLoading: playlistLoading,
    createPlaylist,
    deletePlaylist,
    selectPlaylist,
    addSongsToPlaylist,
    addSingleSongToPlaylist,
    addAudioFile,
    saveForOffline,
    removeSongFromPlaylist,
    getCurrentPlaylistSongs,
    getStorageStats,
  } = usePlaylist();

  // Get current songs (from playlist or unassigned)
  const currentSongs = currentPlaylist
    ? getCurrentPlaylistSongs()
    : unassignedSongs;

  // Get current song object
  const currentSong =
    currentSongIndex !== null ? currentSongs[currentSongIndex] : null;

  // Load storage stats periodically
  useEffect(() => {
    const loadStats = async () => {
      const stats = await getStorageStats();
      setStorageStats(stats);
    };
    loadStats();
    
    // Refresh stats every 30 seconds
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, [getStorageStats, playlists]);

  // Handle file upload - saves to IndexedDB
  const handleFileUpload = useCallback(
    async (files) => {
      for (const file of files) {
        try {
          const song = await addAudioFile(file, currentPlaylist);
          if (!currentPlaylist) {
            setUnassignedSongs((prev) => [...prev, song]);
          }
        } catch (error) {
          console.error("Failed to add file:", error);
        }
      }
    },
    [currentPlaylist, addAudioFile]
  );

  // Handle playlist creation
  const handleCreatePlaylist = useCallback(() => {
    if (createPlaylist(newPlaylistName)) {
      setNewPlaylistName("");
    }
  }, [newPlaylistName, createPlaylist]);

  // Handle playlist deletion
  const handleDeletePlaylist = useCallback(
    (name) => {
      deletePlaylist(name);
      if (currentPlaylist === name) {
        setCurrentSongIndex(null);
      }
    },
    [deletePlaylist, currentPlaylist]
  );

  // Handle playlist selection
  const handleSelectPlaylist = useCallback(
    (name) => {
      selectPlaylist(name);
      setCurrentSongIndex(null);
    },
    [selectPlaylist]
  );

  // Play a song by index
  const playSong = useCallback(
    async (index) => {
      if (currentSongs[index]) {
        setCurrentSongIndex(index);
        // Pass the full song object to handle both blob and URL sources
        await play(currentSongs[index]);
      }
    },
    [currentSongs, play]
  );

  // Play next song
  const playNext = useCallback(() => {
    if (currentSongs.length === 0) return;
    const nextIndex = ((currentSongIndex ?? -1) + 1) % currentSongs.length;
    playSong(nextIndex);
  }, [currentSongs, currentSongIndex, playSong]);

  // Play previous song
  const playPrevious = useCallback(() => {
    if (currentSongs.length === 0) return;
    const prevIndex =
      ((currentSongIndex ?? 0) - 1 + currentSongs.length) % currentSongs.length;
    playSong(prevIndex);
  }, [currentSongs, currentSongIndex, playSong]);

  // Handle song deletion
  const handleDeleteSong = useCallback(
    (index) => {
      if (currentPlaylist) {
        removeSongFromPlaylist(currentPlaylist, index);
      } else {
        setUnassignedSongs((prev) => {
          const updated = [...prev];
          updated.splice(index, 1);
          return updated;
        });
      }

      // Adjust current song index if needed
      if (currentSongIndex === index) {
        if (currentSongs.length > 1) {
          playNext();
        } else {
          setCurrentSongIndex(null);
        }
      } else if (currentSongIndex !== null && index < currentSongIndex) {
        setCurrentSongIndex((prev) => prev - 1);
      }
    },
    [
      currentPlaylist,
      removeSongFromPlaylist,
      currentSongIndex,
      currentSongs.length,
      playNext,
    ]
  );

  // Handle seek
  const handleSeek = useCallback(
    (e) => {
      seek(Number(e.target.value));
    },
    [seek]
  );

  // Set up auto-play next on song end
  useEffect(() => {
    setOnEnded(playNext);
  }, [setOnEnded, playNext]);

  // Handle adding song from search
  const handleAddFromSearch = useCallback(
    (song, playlistName) => {
      addSingleSongToPlaylist(song, playlistName);
    },
    [addSingleSongToPlaylist]
  );

  // Handle saving song for offline from search
  const handleSaveOffline = useCallback(
    async (song, playlistName) => {
      return await saveForOffline(song, playlistName);
    },
    [saveForOffline]
  );

  // Render Home/Library content
  const renderLibraryContent = () => {
    if (playlistLoading) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 size={48} className="mx-auto text-purple-500 animate-spin mb-4" />
            <p className="text-gray-400">Loading your library...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Panel - Playlists & Songs */}
        <div className="flex-1 space-y-6">
          {/* Storage Stats Banner */}
          {storageStats && storageStats.audioFilesCount > 0 && (
            <div className="glass-card rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                  <HardDrive size={20} className="text-cyan-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-300">Offline Storage</p>
                  <p className="text-xs text-gray-500">
                    {storageStats.audioFilesCount} files • {storageStats.totalSizeFormatted}
                  </p>
                </div>
              </div>
              <WifiOff size={16} className="text-green-400" />
            </div>
          )}

          {/* Audio Error Banner */}
          {audioError && (
            <div className="glass-card rounded-xl p-4 border border-red-500/30 bg-red-500/10">
              <div className="flex items-center gap-3">
                <AlertCircle size={20} className="text-red-400" />
                <div className="flex-1">
                  <p className="text-sm text-red-300">{audioError}</p>
                </div>
                <button
                  onClick={clearError}
                  className="text-xs text-gray-400 hover:text-white"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {/* Playlist Management */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gradient">Your Playlists</h2>
              <span className="text-sm text-gray-500">{Object.keys(playlists).length} playlists</span>
            </div>
            <PlaylistForm
              playlistName={newPlaylistName}
              onChange={setNewPlaylistName}
              onSubmit={handleCreatePlaylist}
            />
            <div className="mt-4">
              <PlaylistList
                playlists={playlists}
                currentPlaylist={currentPlaylist}
                onSelectPlaylist={handleSelectPlaylist}
                onDeletePlaylist={handleDeletePlaylist}
              />
            </div>
          </div>

          {/* Songs List */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gradient">
                  {currentPlaylist ? currentPlaylist : "All Tracks"}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {currentSongs.length} {currentSongs.length === 1 ? 'track' : 'tracks'}
                </p>
              </div>
              <FileUpload onUpload={handleFileUpload} />
            </div>
            <SongList
              songs={currentSongs}
              currentSongIndex={currentSongIndex}
              isPlaying={isPlaying}
              onPlaySong={playSong}
              onDeleteSong={handleDeleteSong}
            />
          </div>
        </div>

        {/* Right Panel - Now Playing */}
        <div className="lg:w-[420px]">
          <div className="lg:sticky lg:top-24">
            <NowPlaying
              currentSong={currentSong}
              isPlaying={isPlaying}
              progress={progress}
              duration={duration}
              currentTime={currentTime}
              onPlayPause={togglePlayPause}
              onNext={playNext}
              onPrevious={playPrevious}
              onSeek={handleSeek}
              isLoading={audioLoading}
            />
            
            {/* Quick stats */}
            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="glass-card rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-gradient">{currentSongs.length}</p>
                <p className="text-xs text-gray-500 mt-1">Tracks</p>
              </div>
              <div className="glass-card rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-gradient">{Object.keys(playlists).length}</p>
                <p className="text-xs text-gray-500 mt-1">Playlists</p>
              </div>
              <div className="glass-card rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-gradient">
                  {currentSongs.filter(s => s.isOffline).length}
                </p>
                <p className="text-xs text-gray-500 mt-1">Offline</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render Search content
  const renderSearchContent = () => (
    <div className="max-w-4xl mx-auto">
      <MusicSearch
        onAddToPlaylist={handleAddFromSearch}
        onSaveOffline={handleSaveOffline}
        playlists={playlists}
        currentPlaylist={currentPlaylist}
      />
    </div>
  );

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case "search":
        return renderSearchContent();
      case "library":
      case "home":
      default:
        return renderLibraryContent();
    }
  };

  return (
    <div className="min-h-screen bg-melodix text-white noise-overlay">
      {/* Navbar */}
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Background decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/5 rounded-full blur-3xl" />
      </div>
      
      <div className="relative z-10 container mx-auto px-4 pt-24 pb-24 md:pb-12">
        {activeTab === "home" && <Header title="Melodix" />}
        
        {renderContent()}
        
        {/* Footer */}
        <footer className="mt-16 text-center">
          <p className="text-sm text-gray-600">
            Made with <span className="text-pink-500">♥</span> by Melodix Team
          </p>
        </footer>
      </div>

      {/* Mini Player (visible when not on home and song is playing) */}
      {activeTab !== "home" && currentSong && (
        <div className="fixed bottom-16 md:bottom-0 left-0 right-0 z-40 glass-card border-t border-white/10">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center gap-4">
              {/* Song info */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                  {isPlaying ? (
                    <div className="flex gap-0.5 items-end h-4">
                      {[...Array(3)].map((_, i) => (
                        <div
                          key={i}
                          className="w-1 bg-white rounded-full music-bar"
                          style={{ height: "12px" }}
                        />
                      ))}
                    </div>
                  ) : (
                    <span className="text-white text-lg">♪</span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-white truncate">{currentSong.name}</p>
                  <p className="text-xs text-gray-400 truncate">{currentSong.artist || "Your Library"}</p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={playPrevious}
                  className="p-2 rounded-lg text-gray-400 hover:text-white transition-colors"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                    <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
                  </svg>
                </button>
                <button
                  onClick={togglePlayPause}
                  className="p-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                >
                  {isPlaying ? (
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  )}
                </button>
                <button
                  onClick={playNext}
                  className="p-2 rounded-lg text-gray-400 hover:text-white transition-colors"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                    <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
                  </svg>
                </button>
              </div>

              {/* Progress */}
              <div className="hidden md:block w-48">
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden audio element */}
      <audio ref={audioRef} className="hidden" />
    </div>
  );
}
