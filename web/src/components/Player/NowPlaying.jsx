import React from "react";
import PlayerControls from "./PlayerControls";
import ProgressBar from "./ProgressBar";
import { Music, WifiOff, Loader2, Globe } from "lucide-react";

export default function NowPlaying({
  currentSong,
  isPlaying,
  progress,
  duration,
  currentTime,
  onPlayPause,
  onNext,
  onPrevious,
  onSeek,
  isLoading,
}) {
  if (!currentSong) {
    return (
      <div className="glass-card rounded-3xl p-8 text-center relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10" />
        
        <div className="relative z-10">
          {/* Placeholder vinyl */}
          <div className="w-48 h-48 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center relative">
            <div className="absolute inset-4 rounded-full border-2 border-gray-700" />
            <div className="absolute inset-8 rounded-full border border-gray-700" />
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/50 to-pink-500/50 flex items-center justify-center">
              <Music className="w-6 h-6 text-gray-400" />
            </div>
          </div>
          
          <h2 className="text-xl font-semibold text-gray-400 mb-2">
            No Track Selected
          </h2>
          <p className="text-sm text-gray-500">
            Choose a song from your playlist to start listening
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-3xl p-8 relative overflow-hidden glow-purple">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-pink-500/10 to-cyan-500/20" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative z-10">
        {/* Now Playing label */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="flex gap-1">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className={`w-1 bg-gradient-to-t from-purple-500 to-pink-500 rounded-full music-bar ${!isPlaying ? 'opacity-30' : ''}`}
                style={{ height: '16px' }}
              />
            ))}
          </div>
          <span className="text-sm font-medium text-purple-400 tracking-wider uppercase">
            Now Playing
          </span>
          {/* Offline/Online indicator */}
          {currentSong.isOffline ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs">
              <WifiOff size={10} />
              Offline
            </span>
          ) : currentSong.isFromSearch && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-xs">
              <Globe size={10} />
              Stream
            </span>
          )}
        </div>
        
        {/* Vinyl record visualization */}
        <div className="relative w-56 h-56 mx-auto mb-8">
          {/* Glow effect */}
          <div className={`absolute inset-0 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 blur-2xl opacity-30 ${isPlaying ? 'animate-pulse' : ''}`} />
          
          {/* Loading overlay */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/50 rounded-full">
              <Loader2 size={48} className="text-purple-500 animate-spin" />
            </div>
          )}
          
          {/* Album art or Vinyl record */}
          {currentSong.image ? (
            <div className={`relative w-full h-full rounded-full overflow-hidden shadow-2xl ${isPlaying ? 'animate-spin-slow' : ''}`}>
              <img 
                src={currentSong.image} 
                alt={currentSong.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.classList.add('vinyl-fallback');
                }}
              />
              {/* Center hole overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-gray-900 shadow-inner" />
              </div>
              {/* Shine effect */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 via-transparent to-transparent" />
            </div>
          ) : (
            <div className={`relative w-full h-full rounded-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 shadow-2xl ${isPlaying ? 'animate-spin-slow' : ''}`}>
              {/* Grooves */}
              <div className="absolute inset-3 rounded-full border border-gray-700/50" />
              <div className="absolute inset-6 rounded-full border border-gray-700/50" />
              <div className="absolute inset-9 rounded-full border border-gray-700/50" />
              <div className="absolute inset-12 rounded-full border border-gray-700/50" />
              <div className="absolute inset-[3.75rem] rounded-full border border-gray-700/50" />
              
              {/* Center label */}
              <div className="absolute inset-[4.5rem] rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-gray-900" />
              </div>
              
              {/* Shine effect */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/10 via-transparent to-transparent" />
            </div>
          )}
          
          {/* Pulse rings when playing */}
          {isPlaying && !isLoading && (
            <>
              <div className="absolute inset-0 rounded-full border-2 border-purple-500/30 pulse-ring" />
              <div className="absolute inset-0 rounded-full border-2 border-pink-500/20 pulse-ring" style={{ animationDelay: '0.5s' }} />
            </>
          )}
        </div>
        
        {/* Song info */}
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-white truncate mb-1" title={currentSong.name}>
            {currentSong.name}
          </h3>
          <p className="text-sm text-gray-400">
            {currentSong.artist || "Your Library"}
            {currentSong.source && (
              <span className="text-gray-600"> • {currentSong.source}</span>
            )}
          </p>
        </div>
        
        {/* Progress bar */}
        <ProgressBar
          progress={progress}
          onSeek={onSeek}
          duration={duration}
          currentTime={currentTime}
        />
        
        {/* Controls */}
        <PlayerControls
          isPlaying={isPlaying}
          onPlayPause={onPlayPause}
          onNext={onNext}
          onPrevious={onPrevious}
          disabled={isLoading}
        />
      </div>
    </div>
  );
}
