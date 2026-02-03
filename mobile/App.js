/**
 * Melodix Mobile - Main App Component
 * Premium Music Player with offline support
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Text,
  Alert,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

// Hooks
import usePlaylist from './src/hooks/usePlaylist';
import useAudioPlayer from './src/hooks/useAudioPlayer';

// Components
import Header from './src/components/Header';
import PlaylistSelector from './src/components/PlaylistSelector';
import SongItem from './src/components/SongItem';
import MusicPlayer from './src/components/MusicPlayer';
import MusicSearch from './src/components/MusicSearch';

// Theme
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from './src/constants/theme';

// Tab Views
const TAB_LIBRARY = 'library';
const TAB_SEARCH = 'search';

export default function App() {
  // State
  const [activeTab, setActiveTab] = useState(TAB_LIBRARY);
  const [currentSongIndex, setCurrentSongIndex] = useState(-1);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);

  // Hooks
  const {
    playlists,
    currentPlaylist,
    isLoading,
    refreshing,
    createPlaylist,
    deletePlaylist,
    selectPlaylist,
    addSongToPlaylist,
    removeSongFromPlaylist,
    pickAndAddAudioFile,
    addRemoteSongToPlaylist,
    getCurrentPlaylistSongs,
    onRefresh,
  } = usePlaylist();

  const {
    isPlaying,
    duration,
    currentTime,
    play,
    pause,
    resume,
    seek,
    togglePlayPause,
    setOnEnded,
  } = useAudioPlayer();

  // Current playlist songs
  const songs = getCurrentPlaylistSongs();
  const currentSong = currentSongIndex >= 0 ? songs[currentSongIndex] : null;

  // Refs to avoid stale closures in callbacks
  const songsRef = React.useRef(songs);
  const currentSongIndexRef = React.useRef(currentSongIndex);
  const shuffleRef = React.useRef(shuffle);
  const repeatRef = React.useRef(repeat);

  // Keep refs updated
  React.useEffect(() => {
    songsRef.current = songs;
  }, [songs]);

  React.useEffect(() => {
    currentSongIndexRef.current = currentSongIndex;
  }, [currentSongIndex]);

  React.useEffect(() => {
    shuffleRef.current = shuffle;
  }, [shuffle]);

  React.useEffect(() => {
    repeatRef.current = repeat;
  }, [repeat]);

  /**
   * Auto-create default playlist if none exists
   */
  useEffect(() => {
    if (!isLoading && Object.keys(playlists).length === 0) {
      createPlaylist('My Music');
      selectPlaylist('My Music');
    }
  }, [isLoading, playlists, createPlaylist, selectPlaylist]);

  /**
   * Play a specific song
   */
  const handlePlaySong = useCallback(async (song, index) => {
    try {
      setCurrentSongIndex(index);
      await play(song);
    } catch (error) {
      console.error('Failed to play song:', error);
      Alert.alert('Playback Error', 'Failed to play this song. Please try again.');
    }
  }, [play]);

  /**
   * Handle song ended - play next (using refs to avoid re-render loops)
   */
  useEffect(() => {
    setOnEnded(() => {
      const currentSongs = songsRef.current;
      const currentIdx = currentSongIndexRef.current;
      
      if (repeatRef.current) {
        // Replay current song
        const song = currentSongs[currentIdx];
        if (song) {
          play(song);
        }
      } else if (currentSongs.length > 0) {
        // Play next song
        let nextIndex;
        if (shuffleRef.current) {
          do {
            nextIndex = Math.floor(Math.random() * currentSongs.length);
          } while (nextIndex === currentIdx && currentSongs.length > 1);
        } else {
          nextIndex = (currentIdx + 1) % currentSongs.length;
        }
        
        const nextSong = currentSongs[nextIndex];
        if (nextSong) {
          setCurrentSongIndex(nextIndex);
          play(nextSong);
        }
      }
    });
  }, [setOnEnded, play]);

  /**
   * Toggle play/pause
   */
  const handlePlayPause = useCallback(async () => {
    if (currentSongIndex < 0 && songs.length > 0) {
      // No song selected, play first
      handlePlaySong(songs[0], 0);
    } else {
      togglePlayPause();
    }
  }, [currentSongIndex, songs, handlePlaySong, togglePlayPause]);

  /**
   * Play next song
   */
  const handleNext = useCallback(() => {
    if (songs.length === 0) return;

    let nextIndex;
    if (shuffle) {
      // Random song (excluding current)
      do {
        nextIndex = Math.floor(Math.random() * songs.length);
      } while (nextIndex === currentSongIndex && songs.length > 1);
    } else {
      nextIndex = (currentSongIndex + 1) % songs.length;
    }

    handlePlaySong(songs[nextIndex], nextIndex);
  }, [currentSongIndex, songs, shuffle, handlePlaySong]);

  /**
   * Play previous song
   */
  const handlePrevious = useCallback(() => {
    if (songs.length === 0) return;

    // If more than 3 seconds in, restart current song
    if (currentTime > 3) {
      seek(0);
      return;
    }

    const prevIndex = currentSongIndex <= 0 ? songs.length - 1 : currentSongIndex - 1;
    handlePlaySong(songs[prevIndex], prevIndex);
  }, [currentSongIndex, currentTime, songs, handlePlaySong, seek]);

  /**
   * Delete song from playlist
   */
  const handleDeleteSong = useCallback((index) => {
    if (!currentPlaylist) return;

    // If deleting currently playing song, stop playback
    if (index === currentSongIndex) {
      pause();
      setCurrentSongIndex(-1);
    } else if (index < currentSongIndex) {
      setCurrentSongIndex((prev) => prev - 1);
    }

    removeSongFromPlaylist(currentPlaylist, index);
  }, [currentPlaylist, currentSongIndex, pause, removeSongFromPlaylist]);

  /**
   * Add local file from device
   */
  const handleAddLocalFile = useCallback(async () => {
    const targetPlaylist = currentPlaylist || 'My Music';
    
    if (!currentPlaylist) {
      createPlaylist('My Music');
      selectPlaylist('My Music');
    }

    try {
      await pickAndAddAudioFile(targetPlaylist);
    } catch (error) {
      Alert.alert('Error', 'Failed to add audio file. Please try again.');
    }
  }, [currentPlaylist, createPlaylist, selectPlaylist, pickAndAddAudioFile]);

  /**
   * Add song from search results
   */
  const handleAddFromSearch = useCallback((track, playlistName) => {
    const targetPlaylist = playlistName || currentPlaylist || 'My Music';
    
    if (!currentPlaylist && !playlistName) {
      createPlaylist('My Music');
      selectPlaylist('My Music');
    }

    addRemoteSongToPlaylist(track, targetPlaylist);
    Alert.alert('Added!', `"${track.name}" added to ${targetPlaylist}`);
  }, [currentPlaylist, createPlaylist, selectPlaylist, addRemoteSongToPlaylist]);

  /**
   * Render song item
   */
  const renderSongItem = useCallback(({ item, index }) => (
    <SongItem
      song={item}
      index={index}
      isPlaying={currentSongIndex === index && isPlaying}
      onPress={handlePlaySong}
      onDelete={handleDeleteSong}
      showSwipeDelete={true}
    />
  ), [currentSongIndex, isPlaying, handlePlaySong, handleDeleteSong]);

  /**
   * Render empty library state
   */
  const renderEmptyLibrary = () => (
    <View style={styles.emptyState}>
      <Ionicons name="musical-notes" size={64} color={COLORS.textMuted} />
      <Text style={styles.emptyTitle}>No Songs Yet</Text>
      <Text style={styles.emptyText}>
        Add music from your device or search for songs online
      </Text>
      <View style={styles.emptyActions}>
        <TouchableOpacity style={styles.emptyButton} onPress={handleAddLocalFile}>
          <Ionicons name="folder-open" size={20} color={COLORS.text} />
          <Text style={styles.emptyButtonText}>Add from Device</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.emptyButton, styles.emptyButtonSecondary]}
          onPress={() => setActiveTab(TAB_SEARCH)}
        >
          <Ionicons name="search" size={20} color={COLORS.primary} />
          <Text style={[styles.emptyButtonText, styles.emptyButtonTextSecondary]}>
            Search Music
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingBottom: currentSong ? 80 : 0 }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <LinearGradient colors={COLORS.gradientBackground} style={styles.background}>
        {/* Header */}
        <Header
          title="Melodix"
          subtitle={currentPlaylist ? `${songs.length} songs` : 'Music Player'}
          rightAction={{
            icon: 'add',
            onPress: handleAddLocalFile,
          }}
        />

        {/* Tab Bar */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tab, activeTab === TAB_LIBRARY && styles.activeTab]}
            onPress={() => setActiveTab(TAB_LIBRARY)}
          >
            <Ionicons
              name={activeTab === TAB_LIBRARY ? 'library' : 'library-outline'}
              size={22}
              color={activeTab === TAB_LIBRARY ? COLORS.primary : COLORS.textSecondary}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === TAB_LIBRARY && styles.activeTabText,
              ]}
            >
              Library
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === TAB_SEARCH && styles.activeTab]}
            onPress={() => setActiveTab(TAB_SEARCH)}
          >
            <Ionicons
              name={activeTab === TAB_SEARCH ? 'search' : 'search-outline'}
              size={22}
              color={activeTab === TAB_SEARCH ? COLORS.primary : COLORS.textSecondary}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === TAB_SEARCH && styles.activeTabText,
              ]}
            >
              Search
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {activeTab === TAB_LIBRARY ? (
          <View style={styles.content}>
            {/* Playlist Selector */}
            <PlaylistSelector
              playlists={playlists}
              currentPlaylist={currentPlaylist}
              onSelect={selectPlaylist}
              onCreate={createPlaylist}
              onDelete={deletePlaylist}
            />

            {/* Song List */}
            <FlatList
              data={songs}
              keyExtractor={(item, index) => item.id || `song_${index}`}
              renderItem={renderSongItem}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={renderEmptyLibrary}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor={COLORS.primary}
                  colors={[COLORS.primary]}
                />
              }
            />
          </View>
        ) : (
          <MusicSearch
            onAddToPlaylist={handleAddFromSearch}
            currentPlaylist={currentPlaylist}
          />
        )}
      </LinearGradient>

      {/* Music Player */}
      <MusicPlayer
        currentSong={currentSong}
        isPlaying={isPlaying}
        duration={duration}
        currentTime={currentTime}
        onPlayPause={handlePlayPause}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onSeek={seek}
        onToggleShuffle={() => setShuffle(!shuffle)}
        onToggleRepeat={() => setRepeat(!repeat)}
        shuffle={shuffle}
        repeat={repeat}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  background: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.glass,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeTab: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderColor: COLORS.primary,
  },
  tabText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  activeTabText: {
    color: COLORS.primary,
  },
  content: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 120, // Space for mini player
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xxxl,
    paddingHorizontal: SPACING.xl,
  },
  emptyTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.lg,
  },
  emptyText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  emptyActions: {
    width: '100%',
    gap: SPACING.md,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primary,
  },
  emptyButtonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  emptyButtonText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  emptyButtonTextSecondary: {
    color: COLORS.primary,
  },
});
