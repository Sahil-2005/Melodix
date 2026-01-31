import React, { useState } from "react";
import { Upload, Plus, Loader2 } from "lucide-react";

export default function FileUpload({ onUpload, disabled = false }) {
  const [isUploading, setIsUploading] = useState(false);

  const handleChange = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length > 0) {
      setIsUploading(true);
      try {
        await onUpload(files);
      } catch (error) {
        console.error("Upload error:", error);
      } finally {
        setIsUploading(false);
      }
    }
    // Reset input value to allow uploading same file again
    event.target.value = "";
  };

  const isDisabled = disabled || isUploading;

  return (
    <label className={`group relative inline-flex items-center gap-2 px-5 py-2.5 rounded-xl cursor-pointer transition-all duration-300 ${
      isDisabled 
        ? "opacity-50 cursor-not-allowed" 
        : "btn-premium hover:scale-105"
    }`}>
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 blur-lg opacity-0 group-hover:opacity-40 transition-opacity duration-300" />
      
      {isUploading ? (
        <>
          <Loader2 size={18} className="text-white relative z-10 animate-spin" />
          <span className="text-white font-medium relative z-10">Saving...</span>
        </>
      ) : (
        <>
          <Plus size={18} className="text-white relative z-10" />
          <span className="text-white font-medium relative z-10">Add Music</span>
        </>
      )}
      
      <input
        type="file"
        multiple
        accept="audio/*"
        onChange={handleChange}
        className="hidden"
        disabled={isDisabled}
      />
    </label>
  );
}
