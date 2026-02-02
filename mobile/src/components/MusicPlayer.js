/**
 * MusicPlayer Component for Melodix Mobile
 * Compact player bar with full-screen expandable view
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';

const { width, height } = Dimensions.get('window');

export default function MusicPlayer({
  currentSong,
  isPlaying,
  duration,
  currentTime,
  onPlayPause,
  onNext,
  onPrevious,
  onSeek,
  onToggleShuffle,
  onToggleRepeat,
  shuffle = false,
  repeat = false,
}) {
  const [expanded, setExpanded] = useState(false);
  const [sliderValue, setSliderValue] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isSeeking) {
      setSliderValue(currentTime);
    }
  }, [currentTime, isSeeking]);

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleSeekStart = () => {
    setIsSeeking(true);
  };

  const handleSeekEnd = (value) => {
    setIsSeeking(false);
    onSeek?.(value);
  };

  if (!currentSong) return null;

  return (
    <>
      {/* Compact Mini Player */}
      <TouchableOpacity
        style={styles.miniPlayer}
        onPress={() => setExpanded(true)}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={['rgba(139, 92, 246, 0.15)', 'rgba(15, 15, 26, 0.98)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.miniGradient}
        >
          {/* Progress Bar */}
          <View style={styles.miniProgressContainer}>
            <View style={[styles.miniProgress, { width: `${progress}%` }]} />
          </View>

          <View style={styles.miniContent}>
            {/* Thumbnail */}
            {currentSong.image ? (
              <Image source={{ uri: currentSong.image }} style={styles.miniThumbnail} />
            ) : (
              <LinearGradient
                colors={COLORS.gradientPrimary}
                style={styles.miniThumbnailPlaceholder}
              >
                <Ionicons name="musical-note" size={18} color={COLORS.text} />
              </LinearGradient>
            )}

            {/* Song Info */}
            <View style={styles.miniInfo}>
              <Text style={styles.miniTitle} numberOfLines={1}>
                {currentSong.name}
              </Text>
              <Text style={styles.miniArtist} numberOfLines={1}>
                {currentSong.artist || 'Unknown Artist'}
              </Text>
            </View>

            {/* Controls */}
            <View style={styles.miniControls}>
              <TouchableOpacity
                style={styles.miniControlButton}
                onPress={onPlayPause}
              >
                <Ionicons
                  name={isPlaying ? 'pause' : 'play'}
                  size={28}
                  color={COLORS.text}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.miniControlButton}
                onPress={onNext}
              >
                <Ionicons name="play-forward" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>

      {/* Full Screen Player Modal */}
      <Modal
        visible={expanded}
        animationType="slide"
        presentationStyle="overFullScreen"
        onRequestClose={() => setExpanded(false)}
      >
        <LinearGradient colors={COLORS.gradientBackground} style={styles.fullPlayer}>
          {/* Header */}
          <View style={styles.fullHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setExpanded(false)}
            >
              <Ionicons name="chevron-down" size={28} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.fullHeaderTitle}>Now Playing</Text>
            <TouchableOpacity style={styles.moreButton}>
              <Ionicons name="ellipsis-horizontal" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          {/* Album Art */}
          <View style={styles.albumContainer}>
            {currentSong.image ? (
              <Image source={{ uri: currentSong.image }} style={styles.albumArt} />
            ) : (
              <LinearGradient
                colors={COLORS.gradientPrimary}
                style={styles.albumArtPlaceholder}
              >
                <Ionicons name="musical-notes" size={100} color={COLORS.text} />
              </LinearGradient>
            )}
          </View>

          {/* Song Info */}
          <View style={styles.fullInfo}>
            <Text style={styles.fullTitle} numberOfLines={2}>
              {currentSong.name}
            </Text>
            <Text style={styles.fullArtist} numberOfLines={1}>
              {currentSong.artist || 'Unknown Artist'}
            </Text>
            {currentSong.album && (
              <Text style={styles.fullAlbum} numberOfLines={1}>
                {currentSong.album}
              </Text>
            )}
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <Slider
              style={styles.slider}
              value={sliderValue}
              minimumValue={0}
              maximumValue={duration || 1}
              minimumTrackTintColor={COLORS.primary}
              maximumTrackTintColor={COLORS.glass}
              thumbTintColor={COLORS.primary}
              onSlidingStart={handleSeekStart}
              onValueChange={setSliderValue}
              onSlidingComplete={handleSeekEnd}
            />
            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
              <Text style={styles.timeText}>{formatTime(duration)}</Text>
            </View>
          </View>

          {/* Main Controls */}
          <View style={styles.mainControls}>
            <TouchableOpacity
              style={[styles.controlButton, shuffle && styles.activeControl]}
              onPress={onToggleShuffle}
            >
              <Ionicons
                name="shuffle"
                size={24}
                color={shuffle ? COLORS.primary : COLORS.textSecondary}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.skipButton} onPress={onPrevious}>
              <Ionicons name="play-skip-back" size={32} color={COLORS.text} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.playButton} onPress={onPlayPause}>
              <LinearGradient
                colors={COLORS.gradientPrimary}
                style={styles.playButtonGradient}
              >
                <Ionicons
                  name={isPlaying ? 'pause' : 'play'}
                  size={36}
                  color={COLORS.text}
                />
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.skipButton} onPress={onNext}>
              <Ionicons name="play-skip-forward" size={32} color={COLORS.text} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.controlButton, repeat && styles.activeControl]}
              onPress={onToggleRepeat}
            >
              <Ionicons
                name="repeat"
                size={24}
                color={repeat ? COLORS.primary : COLORS.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {/* Bottom Actions */}
          <View style={styles.bottomActions}>
            {currentSong.isOffline ? (
              <View style={styles.offlineIndicator}>
                <Ionicons name="cloud-done" size={18} color={COLORS.success} />
                <Text style={styles.offlineText}>Saved Offline</Text>
              </View>
            ) : (
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="download-outline" size={22} color={COLORS.textSecondary} />
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="heart-outline" size={22} color={COLORS.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="share-outline" size={22} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  // Mini Player Styles
  miniPlayer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    ...SHADOWS.large,
  },
  miniGradient: {
    borderTopLeftRadius: BORDER_RADIUS.lg,
    borderTopRightRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: COLORS.glassBorder,
  },
  miniProgressContainer: {
    height: 2,
    backgroundColor: COLORS.glass,
    borderTopLeftRadius: BORDER_RADIUS.lg,
    borderTopRightRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  miniProgress: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  miniContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  miniThumbnail: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.sm,
  },
  miniThumbnailPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniInfo: {
    flex: 1,
    marginHorizontal: SPACING.md,
  },
  miniTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  miniArtist: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  miniControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  miniControlButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Full Player Styles
  fullPlayer: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
  },
  fullHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: SPACING.lg,
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullHeaderTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  moreButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  albumContainer: {
    alignItems: 'center',
    marginVertical: SPACING.xxl,
    ...SHADOWS.glow,
  },
  albumArt: {
    width: width - 80,
    height: width - 80,
    borderRadius: BORDER_RADIUS.lg,
  },
  albumArtPlaceholder: {
    width: width - 80,
    height: width - 80,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullInfo: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  fullTitle: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  fullArtist: {
    fontSize: FONTS.sizes.lg,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  fullAlbum: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textMuted,
  },
  progressContainer: {
    marginBottom: SPACING.xl,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -SPACING.sm,
  },
  timeText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textMuted,
  },
  mainControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.lg,
    marginBottom: SPACING.xxl,
  },
  controlButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
  },
  activeControl: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
  },
  skipButton: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    ...SHADOWS.glow,
  },
  playButtonGradient: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xxl,
  },
  actionButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  offlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  offlineText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.success,
  },
});
