import React from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Image } from 'expo-image';

interface ZoomableImageProps {
  uri: string;
  width: number;
  height: number;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export function ZoomableImage({ uri, width, height }: ZoomableImageProps) {
  // Animation values
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  // Reset function
  const reset = () => {
    'worklet';
    scale.value = withTiming(1);
    savedScale.value = 1;
    translateX.value = withTiming(0);
    translateY.value = withTiming(0);
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
  };

  // Double tap to zoom
  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onStart((e) => {
      if (scale.value > 1) {
        reset();
      } else {
        scale.value = withSpring(2);
        savedScale.value = 2;
        // Center zoom on tap? For now simple zoom center
      }
    });

  // Pinch gesture
  const pinch = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = savedScale.value * e.scale;
    })
    .onEnd(() => {
      if (scale.value < 1) {
        reset();
      } else {
        savedScale.value = scale.value;
      }
    });

  // Pan gesture (only works when zoomed)
  const pan = Gesture.Pan()
    .onUpdate((e) => {
      if (scale.value > 1) {
        translateX.value = savedTranslateX.value + e.translationX;
        translateY.value = savedTranslateY.value + e.translationY;
      }
    })
    .onEnd(() => {
      if (scale.value > 1) {
        savedTranslateX.value = translateX.value;
        savedTranslateY.value = translateY.value;
      }
    });

  // Composed gesture
  const composed = Gesture.Simultaneous(pinch, pan, doubleTap);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  // Calculate aspect ratio to fit screen
  const aspectRatio = width / height;
  const displayWidth = SCREEN_WIDTH;
  const displayHeight = SCREEN_WIDTH / aspectRatio;

  return (
    <GestureDetector gesture={composed}>
      <Animated.View style={styles.container}>
        <Animated.View style={[animatedStyle]}>
          <Image
            source={{ uri }}
            style={{
              width: displayWidth,
              height: displayHeight,
            }}
            contentFit="contain"
            transition={200}
          />
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
