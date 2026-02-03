# 🎵 Melodix

<div align="center">

**Premium Music Player Experience**

A beautifully crafted cross-platform music player with stunning visuals, smooth animations, and an intuitive interface. Built with modern web and mobile technologies for the ultimate listening experience.

[![GitHub](https://img.shields.io/badge/GitHub-Melodix-181717?style=for-the-badge&logo=github)](https://github.com/Sahil-2005/Melodix)
![Version](https://img.shields.io/badge/Version-1.0.0-purple?style=for-the-badge)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![Expo](https://img.shields.io/badge/Expo-54-000020?style=for-the-badge&logo=expo)

</div>

---

## 📱 Platforms

Melodix is available on multiple platforms:

| Platform | Technology | Status |
|----------|------------|--------|
| 🌐 Web | React 19 + Vite | ✅ Ready |
| 📱 Mobile | React Native + Expo | ✅ Ready |

---

## ✨ Features

### Core Features
- 🎶 **Upload & Play** - Support for all major audio formats (MP3, WAV, AAC, etc.)
- 📋 **Smart Playlists** - Create, manage, and organize your music collections
- 🔍 **Music Search** - Search and discover music easily
- 💾 **Offline Support** - Save songs locally for offline playback
- 🎵 **Full Playback Controls** - Play, pause, skip, seek, shuffle, and repeat

### Design & UI
- 🎨 **Premium UI** - Glassmorphism design with smooth animations
- 🎵 **Vinyl Animation** - Beautiful spinning vinyl visualization (Web)
- 📱 **Responsive Design** - Perfect experience on desktop, tablet, and mobile
- 🌙 **Dark Mode** - Easy on the eyes, always
- ✨ **Smooth Animations** - Polished transitions and interactions

### Storage & Data
- 💽 **IndexedDB Storage** - Efficient local storage for web
- 📦 **AsyncStorage** - Persistent storage for mobile
- 📊 **Storage Statistics** - Track your music library size

---

## 🛠️ Tech Stack

### Web Application (`/web`)

| Technology | Purpose |
|------------|---------|
| React 19 | UI Framework |
| Vite 6 | Build Tool & Dev Server |
| Tailwind CSS 4 | Utility-first Styling |
| DaisyUI 5 | UI Component Library |
| Lucide React | Icon Library |
| IndexedDB | Local Storage |

### Mobile Application (`/mobile`)

| Technology | Purpose |
|------------|---------|
| React Native 0.81 | Mobile Framework |
| Expo 54 | Development Platform |
| Expo AV | Audio Playback |
| Expo Document Picker | File Selection |
| Expo Linear Gradient | UI Gradients |
| AsyncStorage | Persistent Storage |

---

## 📁 Project Structure

```
melodix/
├── web/                          # Web Application
│   ├── src/
│   │   ├── components/           # React Components
│   │   │   ├── common/           # Shared (Header, FileUpload)
│   │   │   ├── Layout/           # Layout (Navbar)
│   │   │   ├── Player/           # Audio Player UI
│   │   │   ├── Playlist/         # Playlist Management
│   │   │   ├── Search/           # Music Search
│   │   │   └── Song/             # Song List & Items
│   │   ├── hooks/                # Custom React Hooks
│   │   │   ├── useAudioPlayer.js # Audio playback logic
│   │   │   ├── usePlaylist.js    # Playlist management
│   │   │   └── useLocalStorage.js# LocalStorage hook
│   │   ├── services/             # Backend Services
│   │   │   └── indexedDB.js      # IndexedDB operations
│   │   ├── utils/                # Utility Functions
│   │   │   ├── audioUtils.js     # Audio helpers
│   │   │   └── formatters.js     # Data formatters
│   │   ├── constants/            # App Constants
│   │   ├── App.jsx               # Main App Component
│   │   └── main.jsx              # Entry Point
│   └── package.json
│
├── mobile/                       # Mobile Application
│   ├── src/
│   │   ├── components/           # React Native Components
│   │   │   ├── Header.js         # App Header
│   │   │   ├── MusicPlayer.js    # Player Controls
│   │   │   ├── MusicSearch.js    # Search Feature
│   │   │   ├── PlaylistSelector.js # Playlist UI
│   │   │   └── SongItem.js       # Song List Item
│   │   ├── hooks/                # Custom Hooks
│   │   │   ├── useAudioPlayer.js # Audio playback
│   │   │   └── usePlaylist.js    # Playlist management
│   │   ├── services/             # Services
│   │   │   └── storage.js        # AsyncStorage operations
│   │   └── constants/            # Theme & Constants
│   │       └── theme.js          # Colors, Fonts, Spacing
│   ├── App.js                    # Main App Component
│   └── package.json
│
└── README.md                     # This file
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Expo CLI** (for mobile development)

### Web Application

```bash
# Navigate to web directory
cd web

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The web app will be available at `http://localhost:5173`

### Mobile Application

```bash
# Navigate to mobile directory
cd mobile

# Install dependencies
npm install

# Start Expo development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on Web (Expo Web)
npm run web
```

Scan the QR code with Expo Go app on your device to test the mobile app.

---

## 📸 Screenshots

### Web Application
- 🎵 Modern glassmorphism design
- 🎨 Beautiful vinyl animation while playing
- 📋 Intuitive playlist management
- 🔍 Quick music search

### Mobile Application
- 📱 Native mobile experience
- 🎵 Full playback controls
- 📋 Easy playlist navigation
- 🔍 Search and discover music

---

## 🎯 Usage

1. **Upload Music** - Click the upload button to add your audio files
2. **Create Playlists** - Organize your music into custom playlists
3. **Play Music** - Select a song to start playback
4. **Control Playback** - Use the player controls for play/pause, skip, seek
5. **Search** - Use the search feature to find songs quickly
6. **Offline Mode** - Save songs for offline listening

---

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👨‍💻 Author

**Sahil**

- GitHub: [@Sahil-2005](https://github.com/Sahil-2005)
- Repository: [Melodix](https://github.com/Sahil-2005/Melodix)

---

<div align="center">

**Made with ❤️ and 🎵**

⭐ Star this repo if you like it!

</div>
