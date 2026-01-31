# 🎵 Melodix

**Premium Music Experience**

A beautifully crafted music player with stunning visuals, smooth animations, and an intuitive interface. Built with modern web technologies for the ultimate listening experience.

![Melodix](https://img.shields.io/badge/Melodix-v1.0.0-purple?style=for-the-badge)
![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge)
![Tailwind](https://img.shields.io/badge/Tailwind-4-cyan?style=for-the-badge)

## ✨ Features

- 🎶 **Upload & Play** - Support for all major audio formats
- 📋 **Smart Playlists** - Create and manage your music collections
- 🎨 **Premium UI** - Glassmorphism design with smooth animations
- 🎵 **Vinyl Animation** - Beautiful spinning vinyl visualization
- ▶️ **Full Controls** - Play, pause, skip, seek with style
- 📱 **Responsive** - Perfect on desktop and mobile
- 🌙 **Dark Mode** - Easy on the eyes, always

## Tech Stack

- **React 19** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS 4** - Utility-first CSS
- **DaisyUI** - Component library
- **Lucide React** - Beautiful icons

## Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── common/          # Shared components (Header, FileUpload)
│   ├── Player/          # Audio player components
│   ├── Playlist/        # Playlist management components
│   └── Song/            # Song list components
├── hooks/               # Custom React hooks
│   ├── useAudioPlayer.js
│   └── usePlaylist.js
├── utils/               # Utility functions
│   ├── audioUtils.js
│   └── formatters.js
├── constants/           # App constants and config
├── App.jsx              # Main app component
├── App.css              # App-specific styles
├── index.css            # Global styles
└── main.jsx             # App entry point
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Future Roadmap

- [ ] Mobile app version (React Native)
- [ ] Persistent storage (localStorage/IndexedDB)
- [ ] Audio visualization
- [ ] Shuffle and repeat modes
- [ ] Volume control
- [ ] Keyboard shortcuts
- [ ] Theme customization
- [ ] Drag and drop song ordering
- [ ] Search functionality
- [ ] Import/export playlists

## License

MIT

