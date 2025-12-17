// UploadToast - Upload progress notification toast
import React, { useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  useColorScheme,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { UploadProgressBar } from './UploadProgressBar';
import Colors from '@/constants/Colors';

interface UploadToastProps {
  visible: boolean;
  state: 'uploading' | 'success' | 'error';
  current: number;
  total: number;
  progress: number;
  failed: number;
  onRetry?: () => void;
  onCancel?: () => void;
  onDismiss?: () => void;
}

export function UploadToast({
  visible,
  state,
  current,
  total,
  progress,
  failed,
  onRetry,
  onCancel,
  onDismiss,
}: UploadToastProps) {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];

  const translateY = useSharedValue(100);
  const checkmarkScale = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withTiming(0, { duration: 300 });
      if (state === 'success') {
        checkmarkScale.value = withSpring(1, {
          mass: 0.5,
          damping: 10,
        });
      }
    } else {
      translateY.value = withTiming(100, { duration: 300 });
      checkmarkScale.value = 0;
    }
  }, [visible, state]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const checkmarkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkmarkScale.value }],
  }));

  if (!visible) return null;

  const getIcon = () => {
    switch (state) {
      case 'uploading':
        return <Ionicons name="cloud-upload" size={24} color={colors.primary} />;
      case 'success':
        return (
          <Animated.View style={checkmarkStyle}>
            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
          </Animated.View>
        );
      case 'error':
        return <Ionicons name="alert-circle" size={24} color={colors.error} />;
    }
  };

  const getText = () => {
    switch (state) {
      case 'uploading':
        return `Uploading ${current} of ${total}`;
      case 'success':
        return `${total} photo${total > 1 ? 's' : ''} uploaded`;
      case 'error':
        return `${failed} of ${total} photo${failed > 1 ? 's' : ''} failed`;
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: colors.surfaceVariant },
        animatedStyle,
      ]}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>{getIcon()}</View>

        <View style={styles.textContainer}>
          <Text style={[styles.text, { color: colors.onSurface }]}>{getText()}</Text>
          {state === 'uploading' && (
            <UploadProgressBar
              progress={progress}
              color={colors.primary}
              backgroundColor={colors.outlineVariant}
            />
          )}
        </View>

        {state === 'uploading' && onCancel && (
          <Pressable style={styles.actionButton} onPress={onCancel}>
            <Text style={[styles.actionText, { color: colors.primary }]}>Cancel</Text>
          </Pressable>
        )}

        {state === 'error' && onRetry && (
          <Pressable style={styles.actionButton} onPress={onRetry}>
            <Text style={[styles.actionText, { color: colors.primary }]}>Retry</Text>
          </Pressable>
        )}

        {state === 'success' && onDismiss && (
          <Pressable style={styles.actionButton} onPress={onDismiss}>
            <Ionicons name="close" size={20} color={colors.outline} />
          </Pressable>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 80, // Above nav bar
    left: 16,
    right: 16,
    minHeight: 56,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  iconContainer: {
    width: 24,
    height: 24,
  },
  textContainer: {
    flex: 1,
    gap: 8,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 48,
    minWidth: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
