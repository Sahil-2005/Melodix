/**
 * SongItem Component for Melodix Mobile
 * Displays a single song with swipe-to-delete functionality
 */

import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';

const { width } = Dimensions.get('window');
const SWIPE_THRESHOLD = width * 0.25;

export default function SongItem({
  song,
  index,
  isPlaying,
  onPress,
  onDelete,
  onSaveOffline,
  showSwipeDelete = true,
}) {
  const translateX = useRef(new Animated.Value(0)).current;
  const itemOpacity = useRef(new Animated.Value(1)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => showSwipeDelete,
      onMoveShouldSetPanResponder: (_, gestureState) =>
        showSwipeDelete && Math.abs(gestureState.dx) > 10,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < 0) {
          translateX.setValue(Math.max(gestureState.dx, -SWIPE_THRESHOLD));
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -SWIPE_THRESHOLD / 2) {
          // Show delete button
          Animated.spring(translateX, {
            toValue: -SWIPE_THRESHOLD,
            useNativeDriver: true,
          }).start();
        } else {
          // Reset position
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const handleDelete = () => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: -width,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(itemOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDelete?.(index);
    });
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Animated.View style={[styles.container, { opacity: itemOpacity }]}>
      {/* Delete Background */}
      {showSwipeDelete && (
        <View style={styles.deleteBackground}>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Ionicons name="trash" size={24} color={COLORS.text} />
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Song Content */}
      <Animated.View
        style={[styles.content, { transform: [{ translateX }] }]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          style={styles.touchable}
          onPress={() => onPress?.(song, index)}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={isPlaying ? COLORS.gradientCard : ['transparent', 'transparent']}
            style={[styles.gradient, isPlaying && styles.playingGradient]}
          >
            {/* Thumbnail */}
            <View style={styles.thumbnailContainer}>
              {song.image ? (
                <Image source={{ uri: song.image }} style={styles.thumbnail} />
              ) : (
                <LinearGradient
                  colors={COLORS.gradientPrimary}
                  style={styles.thumbnailPlaceholder}
                >
                  <Ionicons name="musical-note" size={24} color={COLORS.text} />
                </LinearGradient>
              )}
              {isPlaying && (
                <View style={styles.playingIndicator}>
                  <Ionicons name="volume-high" size={14} color={COLORS.primary} />
                </View>
              )}
            </View>

            {/* Song Info */}
            <View style={styles.info}>
              <Text style={[styles.name, isPlaying && styles.playingText]} numberOfLines={1}>
                {song.name}
              </Text>
              <Text style={styles.artist} numberOfLines={1}>
                {song.artist || 'Unknown Artist'}
              </Text>
              <View style={styles.meta}>
                <Text style={styles.duration}>{formatDuration(song.duration)}</Text>
                {song.isOffline && (
                  <View style={styles.offlineBadge}>
                    <Ionicons name="cloud-done" size={12} color={COLORS.success} />
                    <Text style={styles.offlineText}>Offline</Text>
                  </View>
                )}
                {song.isFromSearch && !song.isOffline && (
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={() => onSaveOffline?.(song, index)}
                  >
                    <Ionicons name="download-outline" size={14} color={COLORS.accent} />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Play Icon */}
            <View style={styles.playIcon}>
              <Ionicons
                name={isPlaying ? 'pause' : 'play'}
                size={20}
                color={isPlaying ? COLORS.primary : COLORS.textSecondary}
              />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
  },
  deleteBackground: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: SWIPE_THRESHOLD,
    backgroundColor: COLORS.error,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  deleteText: {
    color: COLORS.text,
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
  },
  content: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.small,
  },
  touchable: {
    flex: 1,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  playingGradient: {
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  thumbnailContainer: {
    position: 'relative',
  },
  thumbnail: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.sm,
  },
  thumbnailPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playingIndicator: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  info: {
    flex: 1,
    marginLeft: SPACING.md,
    marginRight: SPACING.sm,
  },
  name: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  playingText: {
    color: COLORS.primary,
  },
  artist: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  duration: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
  },
  offlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  offlineText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.success,
  },
  saveButton: {
    padding: SPACING.xs,
  },
  playIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.glass,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
