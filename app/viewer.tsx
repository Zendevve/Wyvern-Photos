import React from 'react';
import { StyleSheet, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View } from '@/components/Themed';
import { ZoomableImage } from '@/components/ZoomableImage';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function ViewerScreen() {
  const params = useLocalSearchParams<{
    uri: string;
    width: string;
    height: string;
    id: string;
  }>();
  const router = useRouter();

  const uri = params.uri;
  const width = parseInt(params.width || '1000', 10);
  const height = parseInt(params.height || '1000', 10);

  if (!uri) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <ZoomableImage uri={uri} width={width} height={height} />

        {/* Header Overlay */}
        <SafeAreaView style={styles.header} edges={['top']}>
          <Pressable
            style={styles.closeButton}
            onPress={() => router.back()}
            hitSlop={20}
          >
            <Ionicons name="close" size={28} color="white" />
          </Pressable>
        </SafeAreaView>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    zIndex: 10,
    // Add subtle gradient background implementation later if needed
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
