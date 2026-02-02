/**
 * Theme and Constants for Melodix Mobile
 */

export const COLORS = {
  // Primary Gradient Colors
  primary: '#8B5CF6',
  primaryDark: '#6D28D9',
  secondary: '#EC4899',
  accent: '#06B6D4',

  // Backgrounds
  background: '#0F0F1A',
  backgroundLight: '#1A1A2E',
  card: '#16213E',
  cardDark: '#0F1629',

  // Text
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',

  // Status
  success: '#22C55E',
  error: '#EF4444',
  warning: '#F59E0B',

  // Gradients (for LinearGradient)
  gradientPrimary: ['#8B5CF6', '#EC4899'],
  gradientBackground: ['#0F0F1A', '#1A1A2E', '#16213E'],
  gradientCard: ['rgba(139, 92, 246, 0.1)', 'rgba(236, 72, 153, 0.1)'],
  gradientDark: ['rgba(15, 15, 26, 0.95)', 'rgba(26, 26, 46, 0.95)'],

  // Glassmorphism
  glass: 'rgba(255, 255, 255, 0.05)',
  glassBorder: 'rgba(255, 255, 255, 0.1)',
};

export const FONTS = {
  regular: 'System',
  bold: 'System',
  sizes: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 24,
    xxxl: 32,
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 6.27,
    elevation: 8,
  },
  glow: {
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
};

export const ICON_SIZES = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
};

export default {
  COLORS,
  FONTS,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
  ICON_SIZES,
};
