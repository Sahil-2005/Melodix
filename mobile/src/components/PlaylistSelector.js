/**
 * PlaylistSelector Component for Melodix Mobile
 * Dropdown/modal for selecting and managing playlists
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';

export default function PlaylistSelector({
  playlists,
  currentPlaylist,
  onSelect,
  onCreate,
  onDelete,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const playlistNames = Object.keys(playlists);

  const handleSelect = (name) => {
    onSelect?.(name);
    setIsOpen(false);
  };

  const handleCreate = () => {
    if (!newPlaylistName.trim()) {
      Alert.alert('Error', 'Please enter a playlist name');
      return;
    }
    if (playlists[newPlaylistName]) {
      Alert.alert('Error', 'A playlist with this name already exists');
      return;
    }
    onCreate?.(newPlaylistName.trim());
    setNewPlaylistName('');
    setShowCreateModal(false);
  };

  const handleDelete = (name) => {
    Alert.alert(
      'Delete Playlist',
      `Are you sure you want to delete "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete?.(name),
        },
      ]
    );
  };

  const renderPlaylistItem = ({ item: name }) => {
    const songCount = playlists[name]?.length || 0;
    const isSelected = name === currentPlaylist;

    return (
      <TouchableOpacity
        style={[styles.playlistItem, isSelected && styles.selectedItem]}
        onPress={() => handleSelect(name)}
        onLongPress={() => handleDelete(name)}
      >
        <View style={styles.playlistIcon}>
          <Ionicons
            name={isSelected ? 'musical-notes' : 'musical-notes-outline'}
            size={20}
            color={isSelected ? COLORS.primary : COLORS.textSecondary}
          />
        </View>
        <View style={styles.playlistInfo}>
          <Text style={[styles.playlistName, isSelected && styles.selectedText]}>
            {name}
          </Text>
          <Text style={styles.songCount}>
            {songCount} {songCount === 1 ? 'song' : 'songs'}
          </Text>
        </View>
        {isSelected && (
          <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <>
      {/* Selector Button */}
      <TouchableOpacity
        style={styles.selectorButton}
        onPress={() => setIsOpen(true)}
      >
        <LinearGradient
          colors={['rgba(139, 92, 246, 0.1)', 'rgba(236, 72, 153, 0.1)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.selectorGradient}
        >
          <Ionicons name="library" size={20} color={COLORS.primary} />
          <Text style={styles.selectorText} numberOfLines={1}>
            {currentPlaylist || 'Select Playlist'}
          </Text>
          <Ionicons name="chevron-down" size={18} color={COLORS.textSecondary} />
        </LinearGradient>
      </TouchableOpacity>

      {/* Playlist Selection Modal */}
      <Modal
        visible={isOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View style={styles.modalContent}>
            <LinearGradient
              colors={COLORS.gradientBackground}
              style={styles.modalGradient}
            >
              {/* Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Playlists</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setIsOpen(false)}
                >
                  <Ionicons name="close" size={24} color={COLORS.text} />
                </TouchableOpacity>
              </View>

              {/* Create New Button */}
              <TouchableOpacity
                style={styles.createButton}
                onPress={() => {
                  setIsOpen(false);
                  setShowCreateModal(true);
                }}
              >
                <LinearGradient
                  colors={COLORS.gradientPrimary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.createGradient}
                >
                  <Ionicons name="add-circle" size={22} color={COLORS.text} />
                  <Text style={styles.createText}>Create New Playlist</Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Playlist List */}
              {playlistNames.length > 0 ? (
                <FlatList
                  data={playlistNames}
                  keyExtractor={(item) => item}
                  renderItem={renderPlaylistItem}
                  contentContainerStyle={styles.listContent}
                  showsVerticalScrollIndicator={false}
                />
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="library-outline" size={48} color={COLORS.textMuted} />
                  <Text style={styles.emptyText}>No playlists yet</Text>
                  <Text style={styles.emptySubtext}>
                    Create a playlist to get started
                  </Text>
                </View>
              )}

              {/* Help Text */}
              <Text style={styles.helpText}>
                Long press a playlist to delete it
              </Text>
            </LinearGradient>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Create Playlist Modal */}
      <Modal
        visible={showCreateModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <TouchableOpacity
          style={styles.createModalOverlay}
          activeOpacity={1}
          onPress={() => setShowCreateModal(false)}
        >
          <View
            style={styles.createModalContent}
            onStartShouldSetResponder={() => true}
          >
            <LinearGradient
              colors={[COLORS.card, COLORS.cardDark]}
              style={styles.createModalGradient}
            >
              <Text style={styles.createModalTitle}>New Playlist</Text>
              
              <TextInput
                style={styles.input}
                placeholder="Playlist name"
                placeholderTextColor={COLORS.textMuted}
                value={newPlaylistName}
                onChangeText={setNewPlaylistName}
                autoFocus
                maxLength={50}
              />

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setNewPlaylistName('');
                    setShowCreateModal(false);
                  }}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={handleCreate}
                >
                  <LinearGradient
                    colors={COLORS.gradientPrimary}
                    style={styles.confirmGradient}
                  >
                    <Text style={styles.confirmText}>Create</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  // Selector Button
  selectorButton: {
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
  },
  selectorGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    gap: SPACING.sm,
  },
  selectorText: {
    flex: 1,
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text,
  },

  // Selection Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    maxHeight: '70%',
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
  },
  modalGradient: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.glass,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButton: {
    marginBottom: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
  },
  createGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  createText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  listContent: {
    paddingBottom: SPACING.md,
  },
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.xs,
    backgroundColor: COLORS.glass,
  },
  selectedItem: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  playlistIcon: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.glass,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  playlistInfo: {
    flex: 1,
  },
  playlistName: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  selectedText: {
    color: COLORS.primary,
  },
  songCount: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  emptySubtext: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  helpText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.md,
  },

  // Create Modal
  createModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  createModalContent: {
    width: '100%',
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.large,
  },
  createModalGradient: {
    padding: SPACING.xl,
  },
  createModalTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  input: {
    backgroundColor: COLORS.glass,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    fontSize: FONTS.sizes.lg,
    color: COLORS.text,
    marginBottom: SPACING.xl,
  },
  modalActions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  confirmButton: {
    flex: 1,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
  },
  confirmGradient: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  confirmText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
  },
});
