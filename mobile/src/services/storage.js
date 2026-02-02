/**
 * Storage Service for Melodix Mobile
 * Uses AsyncStorage for metadata and expo-file-system for audio files
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';

// Storage keys
const STORAGE_KEYS = {
  PLAYLISTS: '@melodix_playlists',
  AUDIO_METADATA: '@melodix_audio_metadata',
  SETTINGS: '@melodix_settings',
  CURRENT_PLAYLIST: '@melodix_current_playlist',
};

// Audio files directory
const AUDIO_DIR = `${FileSystem.documentDirectory}melodix_audio/`;

class MelodixStorage {
  constructor() {
    this.initialized = false;
    this.initPromise = this.init();
  }

  /**
   * Initialize storage - ensure audio directory exists
   */
  async init() {
    try {
      const dirInfo = await FileSystem.getInfoAsync(AUDIO_DIR);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(AUDIO_DIR, { intermediates: true });
        console.log('Created audio directory:', AUDIO_DIR);
      }
      this.initialized = true;
      console.log('MelodixStorage initialized');
    } catch (error) {
      console.error('Failed to initialize storage:', error);
      throw error;
    }
  }

  /**
   * Ensure storage is initialized
   */
  async ensureReady() {
    if (!this.initialized) {
      await this.initPromise;
    }
  }

  /**
   * Generate unique ID for audio files
   */
  generateId() {
    return `audio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // ==================== AUDIO FILES ====================

  /**
   * Save an audio file to the document directory
   * @param {string} sourceUri - Source file URI (from document picker)
   * @param {Object} metadata - Audio metadata (name, artist, etc.)
   * @returns {Object} Audio record with local file path
   */
  async saveAudioFile(sourceUri, metadata = {}) {
    await this.ensureReady();

    const id = this.generateId();
    const extension = sourceUri.split('.').pop() || 'mp3';
    const fileName = `${id}.${extension}`;
    const destUri = `${AUDIO_DIR}${fileName}`;

    try {
      // Copy file to app's document directory
      await FileSystem.copyAsync({
        from: sourceUri,
        to: destUri,
      });

      const fileInfo = await FileSystem.getInfoAsync(destUri);

      const record = {
        id,
        localUri: destUri,
        fileName,
        name: metadata.name || 'Unknown Track',
        artist: metadata.artist || 'Unknown Artist',
        duration: metadata.duration || 0,
        size: fileInfo.size || 0,
        dateAdded: new Date().toISOString(),
        source: 'local',
        isOffline: true,
        originalName: metadata.originalName,
      };

      // Save metadata to AsyncStorage
      await this.saveAudioMetadata(id, record);

      console.log('Audio file saved:', id, record.name);
      return record;
    } catch (error) {
      console.error('Failed to save audio file:', error);
      throw error;
    }
  }

  /**
   * Download and save a remote audio file for offline playback
   * @param {string} remoteUrl - Remote audio URL
   * @param {Object} metadata - Audio metadata
   * @returns {Object} Audio record with local file path
   */
  async downloadAndSaveAudio(remoteUrl, metadata = {}) {
    await this.ensureReady();

    const id = this.generateId();
    const fileName = `${id}.mp3`;
    const destUri = `${AUDIO_DIR}${fileName}`;

    try {
      console.log('Downloading audio from:', remoteUrl);

      const downloadResult = await FileSystem.downloadAsync(remoteUrl, destUri);

      if (downloadResult.status !== 200) {
        throw new Error(`Download failed with status ${downloadResult.status}`);
      }

      const fileInfo = await FileSystem.getInfoAsync(destUri);

      const record = {
        id,
        localUri: destUri,
        fileName,
        name: metadata.name || 'Unknown Track',
        artist: metadata.artist || 'Unknown Artist',
        duration: metadata.duration || 0,
        size: fileInfo.size || 0,
        dateAdded: new Date().toISOString(),
        source: metadata.source || 'remote',
        isOffline: true,
        originalUrl: remoteUrl,
        image: metadata.image,
        album: metadata.album,
      };

      await this.saveAudioMetadata(id, record);

      console.log('Audio downloaded and saved:', id, record.name);
      return record;
    } catch (error) {
      console.error('Failed to download audio:', error);
      throw error;
    }
  }

  /**
   * Get audio file metadata by ID
   */
  async getAudioMetadata(id) {
    try {
      const allMetadata = await this.getAllAudioMetadata();
      return allMetadata[id] || null;
    } catch (error) {
      console.error('Failed to get audio metadata:', error);
      return null;
    }
  }

  /**
   * Save audio metadata
   */
  async saveAudioMetadata(id, metadata) {
    try {
      const allMetadata = await this.getAllAudioMetadata();
      allMetadata[id] = metadata;
      await AsyncStorage.setItem(STORAGE_KEYS.AUDIO_METADATA, JSON.stringify(allMetadata));
    } catch (error) {
      console.error('Failed to save audio metadata:', error);
      throw error;
    }
  }

  /**
   * Get all audio metadata
   */
  async getAllAudioMetadata() {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.AUDIO_METADATA);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Failed to get all audio metadata:', error);
      return {};
    }
  }

  /**
   * Delete an audio file
   */
  async deleteAudioFile(id) {
    await this.ensureReady();

    try {
      const metadata = await this.getAudioMetadata(id);
      if (metadata?.localUri) {
        const fileInfo = await FileSystem.getInfoAsync(metadata.localUri);
        if (fileInfo.exists) {
          await FileSystem.deleteAsync(metadata.localUri);
        }
      }

      // Remove metadata
      const allMetadata = await this.getAllAudioMetadata();
      delete allMetadata[id];
      await AsyncStorage.setItem(STORAGE_KEYS.AUDIO_METADATA, JSON.stringify(allMetadata));

      console.log('Audio file deleted:', id);
    } catch (error) {
      console.error('Failed to delete audio file:', error);
      throw error;
    }
  }

  /**
   * Check if audio file exists
   */
  async audioFileExists(id) {
    const metadata = await this.getAudioMetadata(id);
    if (!metadata?.localUri) return false;

    const fileInfo = await FileSystem.getInfoAsync(metadata.localUri);
    return fileInfo.exists;
  }

  // ==================== PLAYLISTS ====================

  /**
   * Get all playlists
   */
  async getAllPlaylists() {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.PLAYLISTS);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Failed to get playlists:', error);
      return {};
    }
  }

  /**
   * Save a playlist
   */
  async savePlaylist(name, songs = []) {
    try {
      const playlists = await this.getAllPlaylists();

      // Serialize songs - don't store full objects, just references
      const serializedSongs = songs.map(song => ({
        id: song.id,
        audioId: song.audioId || song.id,
        name: song.name,
        artist: song.artist,
        duration: song.duration,
        isOffline: song.isOffline || false,
        localUri: song.localUri,
        remoteUrl: song.remoteUrl || song.url,
        source: song.source,
        image: song.image,
        album: song.album,
        dateAdded: song.dateAdded,
      }));

      playlists[name] = {
        name,
        songs: serializedSongs,
        dateCreated: playlists[name]?.dateCreated || new Date().toISOString(),
        dateModified: new Date().toISOString(),
      };

      await AsyncStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(playlists));
      console.log('Playlist saved:', name, 'with', serializedSongs.length, 'songs');
    } catch (error) {
      console.error('Failed to save playlist:', error);
      throw error;
    }
  }

  /**
   * Delete a playlist
   */
  async deletePlaylist(name, deleteAudioFiles = false) {
    try {
      const playlists = await this.getAllPlaylists();

      if (deleteAudioFiles && playlists[name]?.songs) {
        for (const song of playlists[name].songs) {
          if (song.audioId && song.isOffline) {
            await this.deleteAudioFile(song.audioId);
          }
        }
      }

      delete playlists[name];
      await AsyncStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(playlists));
      console.log('Playlist deleted:', name);
    } catch (error) {
      console.error('Failed to delete playlist:', error);
      throw error;
    }
  }

  // ==================== SETTINGS ====================

  /**
   * Get a setting
   */
  async getSetting(key) {
    try {
      const settings = await this.getAllSettings();
      return settings[key];
    } catch (error) {
      console.error('Failed to get setting:', error);
      return null;
    }
  }

  /**
   * Save a setting
   */
  async saveSetting(key, value) {
    try {
      const settings = await this.getAllSettings();
      settings[key] = value;
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save setting:', error);
      throw error;
    }
  }

  /**
   * Get all settings
   */
  async getAllSettings() {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Failed to get settings:', error);
      return {};
    }
  }

  // ==================== UTILITIES ====================

  /**
   * Get storage statistics
   */
  async getStorageStats() {
    await this.ensureReady();

    try {
      const metadata = await this.getAllAudioMetadata();
      const playlists = await this.getAllPlaylists();

      let totalSize = 0;
      for (const audio of Object.values(metadata)) {
        totalSize += audio.size || 0;
      }

      return {
        audioFilesCount: Object.keys(metadata).length,
        playlistsCount: Object.keys(playlists).length,
        totalSize,
        totalSizeFormatted: this.formatBytes(totalSize),
        audioDirectory: AUDIO_DIR,
      };
    } catch (error) {
      console.error('Failed to get storage stats:', error);
      return null;
    }
  }

  /**
   * Clear all data
   */
  async clearAll() {
    try {
      // Delete all audio files
      const dirInfo = await FileSystem.getInfoAsync(AUDIO_DIR);
      if (dirInfo.exists) {
        await FileSystem.deleteAsync(AUDIO_DIR, { idempotent: true });
        await FileSystem.makeDirectoryAsync(AUDIO_DIR, { intermediates: true });
      }

      // Clear AsyncStorage
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.PLAYLISTS,
        STORAGE_KEYS.AUDIO_METADATA,
        STORAGE_KEYS.SETTINGS,
        STORAGE_KEYS.CURRENT_PLAYLIST,
      ]);

      console.log('All data cleared');
    } catch (error) {
      console.error('Failed to clear all data:', error);
      throw error;
    }
  }

  /**
   * Format bytes to human-readable string
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Create singleton instance
const melodixStorage = new MelodixStorage();

export default melodixStorage;
export { STORAGE_KEYS, AUDIO_DIR };
