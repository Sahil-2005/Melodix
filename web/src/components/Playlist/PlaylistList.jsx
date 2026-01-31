import React from "react";
import PlaylistItem from "./PlaylistItem";
import { ListMusic } from "lucide-react";

export default function PlaylistList({
  playlists,
  currentPlaylist,
  onSelectPlaylist,
  onDeletePlaylist,
}) {
  const playlistNames = Object.keys(playlists);

  if (playlistNames.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center">
          <ListMusic size={28} className="text-gray-600" />
        </div>
        <p className="text-gray-500 mb-1">No playlists yet</p>
        <p className="text-sm text-gray-600">Create one to organize your music</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {playlistNames.map((name) => (
        <PlaylistItem
          key={name}
          name={name}
          isActive={currentPlaylist === name}
          songCount={playlists[name]?.length || 0}
          onSelect={() => onSelectPlaylist(name)}
          onDelete={() => onDeletePlaylist(name)}
        />
      ))}
    </div>
  );
}
