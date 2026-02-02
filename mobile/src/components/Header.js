/**
 * Header Component for Melodix Mobile
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../constants/theme';

export default function Header({ title = 'Melodix', subtitle, onMenuPress, rightAction }) {
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <LinearGradient
        colors={['rgba(139, 92, 246, 0.2)', 'rgba(15, 15, 26, 0.95)']}
        style={styles.container}
      >
        <View style={styles.content}>
          <View style={styles.leftSection}>
            {onMenuPress && (
              <TouchableOpacity style={styles.menuButton} onPress={onMenuPress}>
                <Ionicons name="menu" size={24} color={COLORS.text} />
              </TouchableOpacity>
            )}
            <View>
              <Text style={styles.title}>{title}</Text>
              {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            </View>
          </View>

          {rightAction && (
            <TouchableOpacity style={styles.actionButton} onPress={rightAction.onPress}>
              <Ionicons
                name={rightAction.icon || 'settings'}
                size={22}
                color={COLORS.text}
              />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + SPACING.sm : 48,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.glassBorder,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.glass,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: FONTS.sizes.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.glass,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
