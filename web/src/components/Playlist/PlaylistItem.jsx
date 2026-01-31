import React from "react";
import { Trash2, Music } from "lucide-react";

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
      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 ${
        isActive
          ? "bg-primary text-primary-content"
          : "bg-base-200 hover:bg-base-300"
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center gap-3">
        <Music size={20} />
        <div>
          <p className="font-medium">{name}</p>
          <p className="text-sm opacity-70">{songCount} songs</p>
        </div>
      </div>
      <button
        className="btn btn-ghost btn-sm"
        onClick={handleDelete}
        title="Delete playlist"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}
