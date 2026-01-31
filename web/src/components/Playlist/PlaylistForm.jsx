import React from "react";
import { Plus } from "lucide-react";

export default function PlaylistForm({ playlistName, onChange, onSubmit }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
      <input
        type="text"
        placeholder="New Playlist Name"
        value={playlistName}
        onChange={(e) => onChange(e.target.value)}
        className="input input-bordered flex-1"
      />
      <button type="submit" className="btn btn-success">
        <Plus size={20} />
      </button>
    </form>
  );
}
