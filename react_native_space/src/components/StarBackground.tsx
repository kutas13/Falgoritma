import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';

const { width, height } = Dimensions.get('window');

const starPositions = [
  { top: '5%', left: '10%', emoji: '✨' },
  { top: '8%', right: '15%', emoji: '⭐' },
  { top: '15%', left: '80%', emoji: '✨' },
  { top: '25%', left: '5%', emoji: '⭐' },
  { top: '40%', right: '8%', emoji: '✨' },
  { top: '60%', left: '3%', emoji: '⭐' },
  { top: '75%', right: '5%', emoji: '✨' },
  { top: '85%', left: '12%', emoji: '⭐' },
  { top: '90%', right: '20%', emoji: '✨' },
];

export const StarBackground: React.FC = () => {
  return (
    <View style={styles.container} pointerEvents="none">
      {starPositions.map((pos, index) => (
        <Text
          key={index}
          style={[
            styles.star,
            {
              top: pos.top as any,
              left: pos.left as any,
              right: pos.right as any,
              opacity: 0.3 + (index % 3) * 0.2,
            },
          ]}
        >
          {pos.emoji}
        </Text>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  star: {
    position: 'absolute',
    fontSize: 16,
  },
});
