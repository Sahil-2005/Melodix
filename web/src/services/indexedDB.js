/**
 * IndexedDB Service for Melodix
 * Handles persistent storage of audio files and playlist data
 */

const DB_NAME = "melodix_db";
const DB_VERSION = 1;

// Store names
const STORES = {
  AUDIO_FILES: "audioFiles",
  PLAYLISTS: "playlists",
  SETTINGS: "settings",
};

class MelodixDB {
  constructor() {
    this.db = null;
    this.dbReady = this.initDB();
  }

  /**
   * Initialize the IndexedDB database
   */
  async initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error("Failed to open IndexedDB:", request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log("IndexedDB initialized successfully");
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Audio files store - stores blob data with metadata
        if (!db.objectStoreNames.contains(STORES.AUDIO_FILES)) {
          const audioStore = db.createObjectStore(STORES.AUDIO_FILES, {
            keyPath: "id",
          });
          audioStore.createIndex("name", "name", { unique: false });
          audioStore.createIndex("dateAdded", "dateAdded", { unique: false });
        }

        // Playlists store - stores playlist metadata and song references
        if (!db.objectStoreNames.contains(STORES.PLAYLISTS)) {
          const playlistStore = db.createObjectStore(STORES.PLAYLISTS, {
            keyPath: "name",
          });
          playlistStore.createIndex("dateCreated", "dateCreated", { unique: false });
        }

        // Settings store - stores app settings
        if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
          db.createObjectStore(STORES.SETTINGS, { keyPath: "key" });
        }
      };
    });
  }

  /**
   * Ensure database is ready before operations
   */
  async ensureReady() {
    if (!this.db) {
      await this.dbReady;
    }
    return this.db;
  }

  /**
   * Generate a unique ID for audio files
   */
  generateId() {
    return `audio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // ==================== AUDIO FILES ====================

  /**
   * Save an audio file (blob) to IndexedDB
   * @param {File|Blob} file - The audio file to save
   * @param {Object} metadata - Additional metadata (name, artist, etc.)
   * @returns {Object} The saved audio file record with ID
   */
  async saveAudioFile(file, metadata = {}) {
    await this.ensureReady();

    const id = this.generateId();
    const record = {
      id,
      blob: file,
      name: metadata.name || file.name || "Unknown Track",
      originalName: metadata.originalName || file.name,
      artist: metadata.artist || "Unknown Artist",
      duration: metadata.duration || 0,
      size: file.size,
      type: file.type,
      dateAdded: new Date().toISOString(),
      source: metadata.source || "local",
      isOffline: true,
      ...metadata,
    };

    console.log("Saving audio file to IndexedDB:", id, record.name, "size:", record.size);

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORES.AUDIO_FILES], "readwrite");
      const store = transaction.objectStore(STORES.AUDIO_FILES);
      const request = store.put(record);

      request.onsuccess = () => {
        console.log("Audio file saved successfully:", id);
        resolve(record);
      };
      request.onerror = () => {
        console.error("Failed to save audio file:", request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Get an audio file by ID
   * @param {string} id - The audio file ID
   * @returns {Object|null} The audio file record with blob
   */
  async getAudioFile(id) {
    await this.ensureReady();

    console.log("Getting audio file from IndexedDB:", id);

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORES.AUDIO_FILES], "readonly");
      const store = transaction.objectStore(STORES.AUDIO_FILES);
      const request = store.get(id);

      request.onsuccess = () => {
        const result = request.result || null;
        console.log("Audio file retrieval:", id, result ? `found (${result.size} bytes)` : "NOT FOUND");
        resolve(result);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get all audio files
   * @returns {Array} All audio file records
   */
  async getAllAudioFiles() {
    await this.ensureReady();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORES.AUDIO_FILES], "readonly");
      const store = transaction.objectStore(STORES.AUDIO_FILES);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Delete an audio file by ID
   * @param {string} id - The audio file ID
   */
  async deleteAudioFile(id) {
    await this.ensureReady();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORES.AUDIO_FILES], "readwrite");
      const store = transaction.objectStore(STORES.AUDIO_FILES);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Create a playable URL from a stored audio file
   * @param {string} id - The audio file ID
   * @returns {string|null} Object URL for the audio blob
   */
  async getAudioUrl(id) {
    const record = await this.getAudioFile(id);
    if (record && record.blob) {
      return URL.createObjectURL(record.blob);
    }
    return null;
  }

  // ==================== PLAYLISTS ====================

  /**
   * Save a playlist
   * @param {string} name - Playlist name
   * @param {Array} songs - Array of song objects
   */
  async savePlaylist(name, songs = []) {
    await this.ensureReady();

    // Get existing playlist to preserve dateCreated
    const existing = await this.getPlaylist(name);

    const record = {
      name,
      songs: songs.map((song) => {
        // Ensure we preserve all important fields
        const savedSong = {
          ...song,
          // Don't store blob URLs, only references
          url: song.isOffline ? null : song.url,
          audioId: song.audioId || null,
          isOffline: song.isOffline || false,
        };
        console.log("Saving song to IndexedDB:", savedSong.name, "audioId:", savedSong.audioId, "isOffline:", savedSong.isOffline);
        return savedSong;
      }),
      dateCreated: existing?.dateCreated || new Date().toISOString(),
      dateModified: new Date().toISOString(),
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORES.PLAYLISTS], "readwrite");
      const store = transaction.objectStore(STORES.PLAYLISTS);
      const request = store.put(record);

      request.onsuccess = () => {
        console.log("Playlist saved to IndexedDB:", name, "with", record.songs.length, "songs");
        resolve(record);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get a playlist by name
   * @param {string} name - Playlist name
   * @returns {Object|null} The playlist record
   */
  async getPlaylist(name) {
    await this.ensureReady();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORES.PLAYLISTS], "readonly");
      const store = transaction.objectStore(STORES.PLAYLISTS);
      const request = store.get(name);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get all playlists
   * @returns {Object} Playlists as { name: songs[] } object
   */
  async getAllPlaylists() {
    await this.ensureReady();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORES.PLAYLISTS], "readonly");
      const store = transaction.objectStore(STORES.PLAYLISTS);
      const request = store.getAll();

      request.onsuccess = () => {
        const playlists = {};
        (request.result || []).forEach((record) => {
          playlists[record.name] = record.songs;
        });
        resolve(playlists);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Delete a playlist
   * @param {string} name - Playlist name
   */
  async deletePlaylist(name) {
    await this.ensureReady();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORES.PLAYLISTS], "readwrite");
      const store = transaction.objectStore(STORES.PLAYLISTS);
      const request = store.delete(name);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // ==================== SETTINGS ====================

  /**
   * Save a setting
   * @param {string} key - Setting key
   * @param {any} value - Setting value
   */
  async saveSetting(key, value) {
    await this.ensureReady();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORES.SETTINGS], "readwrite");
      const store = transaction.objectStore(STORES.SETTINGS);
      const request = store.put({ key, value });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get a setting
   * @param {string} key - Setting key
   * @param {any} defaultValue - Default value if not found
   * @returns {any} The setting value
   */
  async getSetting(key, defaultValue = null) {
    await this.ensureReady();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORES.SETTINGS], "readonly");
      const store = transaction.objectStore(STORES.SETTINGS);
      const request = store.get(key);

      request.onsuccess = () => {
        resolve(request.result ? request.result.value : defaultValue);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // ==================== UTILITIES ====================

  /**
   * Download a remote audio file and save to IndexedDB
   * @param {string} url - The remote audio URL
   * @param {Object} metadata - Song metadata
   * @returns {Object} The saved audio file record
   */
  async downloadAndSave(url, metadata = {}) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to download: ${response.status}`);
      }

      const blob = await response.blob();
      return await this.saveAudioFile(blob, {
        ...metadata,
        source: "download",
        originalUrl: url,
      });
    } catch (error) {
      console.error("Failed to download and save audio:", error);
      throw error;
    }
  }

  /**
   * Clear all data from the database
   */
  async clearAll() {
    await this.ensureReady();

    const stores = [STORES.AUDIO_FILES, STORES.PLAYLISTS, STORES.SETTINGS];

    for (const storeName of stores) {
      await new Promise((resolve, reject) => {
        const transaction = this.db.transaction([storeName], "readwrite");
        const store = transaction.objectStore(storeName);
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }
  }

  /**
   * Get storage usage statistics
   * @returns {Object} Storage stats
   */
  async getStorageStats() {
    const audioFiles = await this.getAllAudioFiles();
    const playlists = await this.getAllPlaylists();

    const totalSize = audioFiles.reduce((sum, file) => sum + (file.size || 0), 0);

    return {
      audioFilesCount: audioFiles.length,
      playlistsCount: Object.keys(playlists).length,
      totalSize,
      totalSizeFormatted: this.formatBytes(totalSize),
    };
  }

  /**
   * Format bytes to human-readable string
   */
  formatBytes(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }
}

// Create singleton instance
const melodixDB = new MelodixDB();

export default melodixDB;
export { STORES };
