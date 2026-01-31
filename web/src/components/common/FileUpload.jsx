import React from "react";
import { Upload, Plus } from "lucide-react";

export default function FileUpload({ onUpload, disabled = false }) {
  const handleChange = (event) => {
    const files = Array.from(event.target.files);
    if (files.length > 0) {
      onUpload(files);
    }
    // Reset input value to allow uploading same file again
    event.target.value = "";
  };

  return (
    <label className={`group relative inline-flex items-center gap-2 px-5 py-2.5 rounded-xl cursor-pointer transition-all duration-300 ${
      disabled 
        ? "opacity-50 cursor-not-allowed" 
        : "btn-premium hover:scale-105"
    }`}>
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 blur-lg opacity-0 group-hover:opacity-40 transition-opacity duration-300" />
      
      <Plus size={18} className="text-white relative z-10" />
      <span className="text-white font-medium relative z-10">Add Music</span>
      
      <input
        type="file"
        multiple
        accept="audio/*"
        onChange={handleChange}
        className="hidden"
        disabled={disabled}
      />
    </label>
  );
}
