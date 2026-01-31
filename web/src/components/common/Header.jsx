import React from "react";

export default function Header({ title = "Melodix" }) {
  return (
    <header className="flex flex-col items-center justify-center mb-10 relative">
      {/* Decorative elements */}
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-10 left-1/3 w-48 h-48 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />
      
      {/* Logo and title */}
      <div className="flex items-center gap-4 relative z-10">
        {/* Animated logo */}
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 flex items-center justify-center shadow-lg glow-purple">
            <svg 
              viewBox="0 0 24 24" 
              className="w-8 h-8 text-white"
              fill="currentColor"
            >
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
            </svg>
          </div>
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 blur-xl opacity-50 animate-pulse" />
        </div>
        
        <div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">
            <span className="text-gradient">{title}</span>
          </h1>
          <p className="text-sm text-gray-400 tracking-widest uppercase mt-1">
            Premium Music Experience
          </p>
        </div>
      </div>
    </header>
  );
}
