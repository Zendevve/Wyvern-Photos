// PhotoGrid component - displays photos in a grid layout
import React, { useCallback, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Dimensions,
  Pressable,
  useColorScheme,
} from 'react-native';
import { Image } from 'expo-image';
import { View } from './Themed';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import type { MediaAsset } from '../hooks/useMediaLibrary';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const NUM_COLUMNS = 3;
const GAP = 2;
const ITEM_SIZE = (SCREEN_WIDTH - GAP * (NUM_COLUMNS + 1)) / NUM_COLUMNS;

interface PhotoGridProps {
  assets: MediaAsset[];
  selectedIds: Set<string>;
  uploadedIds: Set<string>;
  onPhotoPress: (asset: MediaAsset, index: number) => void;
  onPhotoLongPress: (asset: MediaAsset) => void;
  onEndReached?: () => void;
  isLoading?: boolean;
  ListHeaderComponent?: React.ReactElement;
  ListEmptyComponent?: React.ReactElement;
}

export function PhotoGrid({
  assets,
  selectedIds,
  uploadedIds,
  onPhotoPress,
  onPhotoLongPress,
  onEndReached,
  isLoading,
  ListHeaderComponent,
  ListEmptyComponent,
}: PhotoGridProps) {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];

  const renderItem = useCallback(
    ({ item, index }: { item: MediaAsset; index: number }) => {
      const isSelected = selectedIds.has(item.id);
      const isUploaded = uploadedIds.has(item.id);

      return (
        <Pressable
          onPress={() => onPhotoPress(item, index)}
          onLongPress={() => onPhotoLongPress(item)}
          style={[
            styles.itemContainer,
            isSelected && { borderColor: colors.primary, borderWidth: 3 },
          ]}
        >
          <Image
            source={{ uri: item.uri }}
            style={styles.image}
            contentFit="cover"
            transition={200}
            recyclingKey={item.id}
          />

          {/* Upload status badge */}
          {isUploaded && (
            <View style={[styles.badge, { backgroundColor: colors.uploadedBadge }]}>
              <Ionicons name="cloud-done" size={12} color="#fff" />
            </View>
          )}

          {/* Selection checkbox */}
          {isSelected && (
            <View style={[styles.checkbox, { backgroundColor: colors.primary }]}>
              <Ionicons name="checkmark" size={14} color="#fff" />
            </View>
          )}
        </Pressable>
      );
    },
    [selectedIds, uploadedIds, colors, onPhotoPress, onPhotoLongPress]
  );

  const keyExtractor = useCallback((item: MediaAsset) => item.id, []);

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: ITEM_SIZE + GAP,
      offset: (ITEM_SIZE + GAP) * Math.floor(index / NUM_COLUMNS),
      index,
    }),
    []
  );

  return (
    <FlatList
      data={assets}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      numColumns={NUM_COLUMNS}
      contentContainerStyle={styles.grid}
      getItemLayout={getItemLayout}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={ListEmptyComponent}
      removeClippedSubviews={true}
      maxToRenderPerBatch={20}
      windowSize={10}
      initialNumToRender={30}
    />
  );
}

const styles = StyleSheet.create({
  grid: {
    padding: GAP,
  },
  itemContainer: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    margin: GAP / 2,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkbox: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
