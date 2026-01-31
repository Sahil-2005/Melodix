import React from "react";
import { Play, Pause, SkipForward, SkipBack } from "lucide-react";

export default function PlayerControls({
  isPlaying,
  onPlayPause,
  onNext,
  onPrevious,
  disabled = false,
}) {
  return (
    <div className="flex justify-center gap-4 mt-4">
      <button
        className="btn btn-outline"
        onClick={onPrevious}
        disabled={disabled}
      >
        <SkipBack size={24} />
      </button>
      <button
        className="btn btn-outline"
        onClick={onPlayPause}
        disabled={disabled}
      >
        {isPlaying ? <Pause size={24} /> : <Play size={24} />}
      </button>
      <button
        className="btn btn-outline"
        onClick={onNext}
        disabled={disabled}
      >
        <SkipForward size={24} />
      </button>
    </div>
  );
}
