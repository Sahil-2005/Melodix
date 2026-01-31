import React from "react";
import PlaylistItem from "./PlaylistItem";

export default function PlaylistList({
  playlists,
  currentPlaylist,
  onSelectPlaylist,
  onDeletePlaylist,
}) {
  const playlistNames = Object.keys(playlists);

  if (playlistNames.length === 0) {
    return (
      <div className="text-center py-4 text-gray-400">
        <p>No playlists yet. Create one above!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 mb-4">
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
