import { MD3DarkTheme, configureFonts } from 'react-native-paper';
import { DefaultTheme as NavigationDarkTheme } from '@react-navigation/native';

export const colors = {
  // Primary mystical dark purple palette
  background: '#1a0a2e',
  surface: '#2d1b4e',
  surfaceVariant: '#3d2a5e',
  card: '#3d2a5e',
  
  // Gold accents
  gold: '#d4af37',
  goldLight: '#ffd700',
  goldDark: '#b8960c',
  
  // Text colors
  text: '#ffffff',
  textSecondary: '#b8a8d0',
  textMuted: '#8a7aa0',
  
  // Status colors
  error: '#ff6b6b',
  success: '#4ecdc4',
  warning: '#ffe66d',
  
  // Others
  border: '#4d3a6e',
  placeholder: '#6d5a8e',
  overlay: 'rgba(26, 10, 46, 0.9)',
};

export const paperTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: colors.gold,
    onPrimary: colors.background,
    primaryContainer: colors.goldDark,
    secondary: colors.goldLight,
    onSecondary: colors.background,
    background: colors.background,
    onBackground: colors.text,
    surface: colors.surface,
    onSurface: colors.text,
    surfaceVariant: colors.surfaceVariant,
    onSurfaceVariant: colors.textSecondary,
    error: colors.error,
    onError: colors.text,
    outline: colors.border,
  },
  roundness: 12,
};

export const navigationTheme = {
  ...NavigationDarkTheme,
  dark: true,
  colors: {
    ...NavigationDarkTheme.colors,
    primary: colors.gold,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    notification: colors.gold,
  },
};
