/**
 * MusicSearch Component for Melodix Mobile
 * iTunes API powered music search with FlatList
 */

import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';

// iTunes API base URL - use production endpoint
const ITUNES_API = 'https://itunes.apple.com/search';

export default function MusicSearch({ onAddToPlaylist, currentPlaylist }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const searchTimeout = useRef(null);

  /**
   * Search iTunes API
   */
  const searchMusic = useCallback(async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const url = `${ITUNES_API}?term=${encodeURIComponent(searchQuery)}&media=music&limit=30`;
      console.log('Searching iTunes:', url);

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }

      const data = await response.json();
      
      // Transform iTunes response to our format
      const tracks = data.results
        .filter((item) => item.previewUrl) // Only items with preview
        .map((item) => ({
          id: `itunes_${item.trackId}`,
          name: item.trackName || 'Unknown Track',
          artist: item.artistName || 'Unknown Artist',
          album: item.collectionName,
          duration: item.trackTimeMillis ? item.trackTimeMillis / 1000 : 30,
          image: item.artworkUrl100?.replace('100x100', '300x300'),
          remoteUrl: item.previewUrl,
          source: 'itunes',
        }));

      setResults(tracks);
      console.log(`Found ${tracks.length} tracks`);
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message || 'Failed to search. Please try again.');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Debounced search handler
   */
  const handleSearch = useCallback((text) => {
    setQuery(text);
    
    // Clear existing timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    // Debounce search
    searchTimeout.current = setTimeout(() => {
      searchMusic(text);
    }, 500);
  }, [searchMusic]);

  /**
   * Submit search immediately
   */
  const handleSubmit = useCallback(() => {
    Keyboard.dismiss();
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    searchMusic(query);
  }, [query, searchMusic]);

  /**
   * Clear search
   */
  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setHasSearched(false);
    setError(null);
  }, []);

  /**
   * Format duration
   */
  const formatDuration = (seconds) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  /**
   * Render search result item
   */
  const renderSearchResult = ({ item }) => (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => onAddToPlaylist?.(item, currentPlaylist)}
      activeOpacity={0.7}
    >
      {/* Album Art */}
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.resultImage} />
      ) : (
        <LinearGradient
          colors={COLORS.gradientPrimary}
          style={styles.resultImagePlaceholder}
        >
          <Ionicons name="musical-note" size={20} color={COLORS.text} />
        </LinearGradient>
      )}

      {/* Track Info */}
      <View style={styles.resultInfo}>
        <Text style={styles.resultName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.resultArtist} numberOfLines={1}>
          {item.artist}
        </Text>
        <View style={styles.resultMeta}>
          <Text style={styles.resultDuration}>{formatDuration(item.duration)}</Text>
          <View style={styles.sourceBadge}>
            <Ionicons name="musical-notes" size={10} color={COLORS.accent} />
            <Text style={styles.sourceText}>iTunes</Text>
          </View>
        </View>
      </View>

      {/* Add Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => onAddToPlaylist?.(item, currentPlaylist)}
      >
        <Ionicons name="add-circle" size={28} color={COLORS.primary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  /**
   * Render empty state
   */
  const renderEmptyState = () => {
    if (isLoading) return null;

    if (error) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="cloud-offline" size={48} color={COLORS.error} />
          <Text style={styles.emptyTitle}>Search Failed</Text>
          <Text style={styles.emptyText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleSubmit}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (hasSearched && results.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="search" size={48} color={COLORS.textMuted} />
          <Text style={styles.emptyTitle}>No Results</Text>
          <Text style={styles.emptyText}>
            No tracks found for "{query}"
          </Text>
        </View>
      );
    }

    if (!hasSearched) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="search" size={48} color={COLORS.textMuted} />
          <Text style={styles.emptyTitle}>Search Music</Text>
          <Text style={styles.emptyText}>
            Search millions of songs from iTunes
          </Text>
        </View>
      );
    }

    return null;
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color={COLORS.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search songs, artists..."
            placeholderTextColor={COLORS.textMuted}
            value={query}
            onChangeText={handleSearch}
            onSubmitEditing={handleSubmit}
            returnKeyType="search"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={clearSearch}>
              <Ionicons name="close-circle" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Current Playlist Indicator */}
      {currentPlaylist && (
        <View style={styles.playlistIndicator}>
          <Ionicons name="folder-open" size={14} color={COLORS.textSecondary} />
          <Text style={styles.playlistIndicatorText}>
            Adding to: <Text style={styles.playlistName}>{currentPlaylist}</Text>
          </Text>
        </View>
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      )}

      {/* Results List */}
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={renderSearchResult}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    gap: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
  },
  playlistIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  playlistIndicatorText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  playlistName: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  loadingContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
    gap: SPACING.md,
  },
  loadingText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  listContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: 120, // Space for mini player
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    ...SHADOWS.small,
  },
  resultImage: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.sm,
  },
  resultImagePlaceholder: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultInfo: {
    flex: 1,
    marginLeft: SPACING.md,
    marginRight: SPACING.sm,
  },
  resultName: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  resultArtist: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  resultMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  resultDuration: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
  },
  sourceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  sourceText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.accent,
  },
  addButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xxxl,
    gap: SPACING.md,
  },
  emptyTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  emptyText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
    paddingHorizontal: SPACING.xl,
  },
  retryButton: {
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
  },
  retryText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
  },
});
