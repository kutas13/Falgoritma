import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { Button } from 'react-native-paper';
import { colors } from '../theme';

interface GoldButtonProps {
  onPress: () => void;
  children: string;
  loading?: boolean;
  disabled?: boolean;
  mode?: 'contained' | 'outlined';
  style?: ViewStyle;
  icon?: string;
}

export const GoldButton: React.FC<GoldButtonProps> = ({
  onPress,
  children,
  loading = false,
  disabled = false,
  mode = 'contained',
  style,
  icon,
}) => {
  return (
    <Button
      mode={mode}
      onPress={onPress}
      loading={loading}
      disabled={disabled || loading}
      icon={icon}
      style={[styles.button, mode === 'outlined' && styles.outlined, style]}
      buttonColor={mode === 'contained' ? colors.gold : 'transparent'}
      textColor={mode === 'contained' ? colors.background : colors.gold}
      labelStyle={styles.label}
      contentStyle={styles.content}
    >
      {children}
    </Button>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 24,
    elevation: 4,
  },
  outlined: {
    borderColor: colors.gold,
    borderWidth: 2,
    elevation: 0,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  content: {
    paddingVertical: 8,
  },
});
