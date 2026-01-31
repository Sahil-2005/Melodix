import React from "react";
import { Trash2, Play, Pause } from "lucide-react";

export default function SongItem({
  song,
  index,
  isActive,
  isPlaying,
  onPlay,
  onDelete,
}) {
  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete();
  };

  return (
    <li
      className={`group relative flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all duration-300 song-item-premium ${
        isActive
          ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/20"
          : "hover:bg-white/5 border border-transparent"
      }`}
      onClick={onPlay}
    >
      {/* Track number / Play indicator */}
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
        isActive 
          ? "bg-gradient-to-br from-purple-500 to-pink-500" 
          : "bg-white/5 group-hover:bg-white/10"
      }`}>
        {isActive && isPlaying ? (
          <div className="flex gap-0.5 items-end h-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-1 bg-white rounded-full music-bar"
                style={{ height: '12px' }}
              />
            ))}
          </div>
        ) : isActive ? (
          <Pause size={16} className="text-white" fill="currentColor" />
        ) : (
          <span className="text-sm text-gray-500 group-hover:hidden">{index + 1}</span>
        )}
        {!isActive && (
          <Play size={16} className="text-white hidden group-hover:block" fill="currentColor" />
        )}
      </div>
      
      {/* Song info */}
      <div className="flex-1 min-w-0">
        <p className={`font-medium truncate ${isActive ? "text-white" : "text-gray-300 group-hover:text-white"} transition-colors duration-200`} title={song.name}>
          {song.name}
        </p>
        <p className="text-xs text-gray-500 truncate">
          {song.originalName || "Unknown artist"}
        </p>
      </div>
      
      {/* Duration placeholder */}
      <span className="text-sm text-gray-500 hidden sm:block">--:--</span>
      
      {/* Delete button */}
      <button
        className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-all duration-200"
        onClick={handleDelete}
        title="Remove song"
      >
        <Trash2 size={16} />
      </button>
      
      {/* Active glow */}
      {isActive && (
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 pointer-events-none" />
      )}
    </li>
  );
}
