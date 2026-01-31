import React from "react";
import SongItem from "./SongItem";
import { Music, CloudUpload } from "lucide-react";

export default function SongList({
  songs,
  currentSongIndex,
  isPlaying,
  onPlaySong,
  onDeleteSong,
}) {
  if (!songs || songs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
          <CloudUpload size={32} className="text-purple-400" />
        </div>
        <p className="text-gray-400 mb-2">No tracks yet</p>
        <p className="text-sm text-gray-600">
          Upload your favorite music to get started
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-1 max-h-[400px] overflow-y-auto pr-2">
      {songs.map((song, index) => (
        <SongItem
          key={`${song.name}-${index}`}
          song={song}
          index={index}
          isActive={index === currentSongIndex}
          isPlaying={isPlaying && index === currentSongIndex}
          onPlay={() => onPlaySong(index)}
          onDelete={() => onDeleteSong(index)}
        />
      ))}
    </ul>
  );
}
