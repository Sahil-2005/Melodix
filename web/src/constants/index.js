// App information
export const APP_NAME = "Melodix";
export const APP_VERSION = "1.0.0";
export const APP_TAGLINE = "Premium Music Experience";

// Supported audio formats
export const SUPPORTED_AUDIO_FORMATS = [
  "audio/mpeg",      // .mp3
  "audio/wav",       // .wav
  "audio/ogg",       // .ogg
  "audio/flac",      // .flac
  "audio/aac",       // .aac
  "audio/mp4",       // .m4a
  "audio/webm",      // .webm
];

// Player settings
export const PLAYER_SETTINGS = {
  DEFAULT_VOLUME: 0.7,
  SEEK_STEP: 5, // seconds
  VOLUME_STEP: 0.1,
};

// Local storage keys (for future persistence)
export const STORAGE_KEYS = {
  PLAYLISTS: "musicPlayer_playlists",
  SETTINGS: "musicPlayer_settings",
  LAST_PLAYED: "musicPlayer_lastPlayed",
};

// Theme options (for future theming support)
export const THEMES = {
  DARK: "dark",
  LIGHT: "light",
  SYNTHWAVE: "synthwave",
  CYBERPUNK: "cyberpunk",
};
