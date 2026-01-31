import React from "react";

export default function ProgressBar({ progress, onSeek, duration, currentTime }) {
  const formatTime = (seconds) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full">
      {/* Custom progress bar */}
      <div className="relative group">
        <input
          type="range"
          value={progress || 0}
          onChange={onSeek}
          className="w-full cursor-pointer"
          min="0"
          max="100"
        />
        {/* Progress fill overlay */}
        <div 
          className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full pointer-events-none -translate-y-1/2"
          style={{ width: `${progress || 0}%` }}
        />
      </div>
      
      {/* Time display */}
      <div className="flex justify-between text-xs text-gray-400 mt-2 font-medium">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
}
