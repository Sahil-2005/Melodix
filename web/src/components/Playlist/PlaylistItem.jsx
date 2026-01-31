import React from "react";
import { Trash2, Music, ListMusic } from "lucide-react";

export default function PlaylistItem({
  name,
  isActive,
  songCount,
  onSelect,
  onDelete,
}) {
  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete();
  };

  return (
    <div
      className={`group relative flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-300 ${
        isActive
          ? "bg-gradient-to-r from-purple-500/30 to-pink-500/30 border border-purple-500/30"
          : "bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10"
      }`}
      onClick={onSelect}
    >
      {/* Playlist icon */}
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
        isActive 
          ? "bg-gradient-to-br from-purple-500 to-pink-500" 
          : "bg-white/10 group-hover:bg-white/20"
      } transition-all duration-300`}>
        <ListMusic size={20} className="text-white" />
      </div>
      
      {/* Playlist info */}
      <div className="flex-1 min-w-0">
        <p className={`font-semibold truncate ${isActive ? "text-white" : "text-gray-200"}`}>
          {name}
        </p>
        <p className="text-sm text-gray-500 flex items-center gap-1">
          <Music size={12} />
          {songCount} {songCount === 1 ? "track" : "tracks"}
        </p>
      </div>
      
      {/* Delete button */}
      <button
        className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-all duration-200"
        onClick={handleDelete}
        title="Delete playlist"
      >
        <Trash2 size={18} />
      </button>
      
      {/* Active indicator */}
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-r-full" />
      )}
    </div>
  );
}
