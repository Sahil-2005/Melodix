import React from "react";
import PlayerControls from "./PlayerControls";
import ProgressBar from "./ProgressBar";

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
}) {
  if (!currentSong) {
    return (
      <div className="bg-base-100 p-6 rounded-xl w-full text-center shadow-lg">
        <h2 className="text-xl font-semibold text-gray-400">
          Select a song to play
        </h2>
      </div>
    );
  }

  return (
    <div className="bg-base-100 p-6 rounded-xl w-full text-center shadow-lg">
      <h2 className="text-xl font-semibold mb-2 text-primary">Now Playing</h2>
      <p className="text-lg truncate" title={currentSong.name}>
        {currentSong.name}
      </p>
      <ProgressBar
        progress={progress}
        onSeek={onSeek}
        duration={duration}
        currentTime={currentTime}
      />
      <PlayerControls
        isPlaying={isPlaying}
        onPlayPause={onPlayPause}
        onNext={onNext}
        onPrevious={onPrevious}
      />
    </div>
  );
}
