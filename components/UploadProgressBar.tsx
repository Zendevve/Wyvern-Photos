// UploadProgressBar - Animated progress bar component
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

interface UploadProgressBarProps {
  progress: number; // 0-100
  color?: string;
  backgroundColor?: string;
}

export function UploadProgressBar({
  progress,
  color = '#6750A4',
  backgroundColor = '#E8DEF8'
}: UploadProgressBarProps) {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: withTiming(`${Math.min(100, Math.max(0, progress))}%`, {
        duration: 300,
      }),
    };
  });

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Animated.View
        style={[
          styles.progress,
          { backgroundColor: color },
          animatedStyle
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    borderRadius: 2,
  },
});
