import React from "react";

export default function ProgressBar({ progress, onSeek, duration, currentTime }) {
  const formatTime = (seconds) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full mt-4">
      <input
        type="range"
        value={progress || 0}
        onChange={onSeek}
        className="range range-primary w-full"
        min="0"
        max="100"
      />
      <div className="flex justify-between text-sm text-gray-400 mt-1">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
}
