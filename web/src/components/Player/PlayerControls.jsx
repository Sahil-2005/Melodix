import React from "react";
import { Play, Pause, SkipForward, SkipBack, Shuffle, Repeat } from "lucide-react";

export default function PlayerControls({
  isPlaying,
  onPlayPause,
  onNext,
  onPrevious,
  disabled = false,
}) {
  return (
    <div className="flex items-center justify-center gap-6 mt-6">
      {/* Shuffle button */}
      <button
        className="text-gray-500 hover:text-white transition-colors duration-200"
        disabled={disabled}
      >
        <Shuffle size={18} />
      </button>
      
      {/* Previous */}
      <button
        className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300 hover:scale-110 disabled:opacity-50"
        onClick={onPrevious}
        disabled={disabled}
      >
        <SkipBack size={20} className="text-white" fill="currentColor" />
      </button>
      
      {/* Play/Pause - Main button */}
      <button
        className="w-16 h-16 rounded-full btn-premium flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg disabled:opacity-50 relative group"
        onClick={onPlayPause}
        disabled={disabled}
      >
        {/* Glow effect on hover */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
        {isPlaying ? (
          <Pause size={28} className="text-white relative z-10" fill="currentColor" />
        ) : (
          <Play size={28} className="text-white relative z-10 ml-1" fill="currentColor" />
        )}
      </button>
      
      {/* Next */}
      <button
        className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300 hover:scale-110 disabled:opacity-50"
        onClick={onNext}
        disabled={disabled}
      >
        <SkipForward size={20} className="text-white" fill="currentColor" />
      </button>
      
      {/* Repeat button */}
      <button
        className="text-gray-500 hover:text-white transition-colors duration-200"
        disabled={disabled}
      >
        <Repeat size={18} />
      </button>
    </div>
  );
}
