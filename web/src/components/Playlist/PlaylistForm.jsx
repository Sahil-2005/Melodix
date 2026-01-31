import React from "react";
import { Plus } from "lucide-react";

export default function PlaylistForm({ playlistName, onChange, onSubmit }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <div className="relative flex-1">
        <input
          type="text"
          placeholder="Create new playlist..."
          value={playlistName}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all duration-300"
        />
      </div>
      <button
        type="submit"
        className="px-4 py-3 rounded-xl btn-premium text-white font-medium flex items-center gap-2 hover:scale-105 transition-transform duration-200"
      >
        <Plus size={20} />
        <span className="hidden sm:inline">Create</span>
      </button>
    </form>
  );
}
