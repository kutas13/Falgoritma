import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, Modal } from 'react-native';
import { Text } from 'react-native-paper';
import { colors } from '../theme';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  message = 'Yükleniyor...',
}) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      // Moon rotation
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();

      // Stars pulse
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 800,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [visible, rotateAnim, pulseAnim]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.animationContainer}>
            <Animated.Text
              style={[
                styles.moon,
                { transform: [{ rotate: spin }] },
              ]}
            >
              🌙
            </Animated.Text>
            <Animated.Text
              style={[
                styles.star,
                styles.star1,
                { transform: [{ scale: pulseAnim }] },
              ]}
            >
              ✨
            </Animated.Text>
            <Animated.Text
              style={[
                styles.star,
                styles.star2,
                { transform: [{ scale: pulseAnim }] },
              ]}
            >
              ⭐
            </Animated.Text>
            <Animated.Text
              style={[
                styles.star,
                styles.star3,
                { transform: [{ scale: pulseAnim }] },
              ]}
            >
              ✨
            </Animated.Text>
          </View>
          <Text style={styles.message}>{message}</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    padding: 32,
  },
  animationContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  moon: {
    fontSize: 64,
  },
  star: {
    position: 'absolute',
    fontSize: 24,
  },
  star1: {
    top: 0,
    right: 10,
  },
  star2: {
    bottom: 10,
    left: 0,
  },
  star3: {
    top: 20,
    left: 10,
  },
  message: {
    fontSize: 18,
    color: colors.gold,
    fontWeight: '600',
    textAlign: 'center',
  },
});
