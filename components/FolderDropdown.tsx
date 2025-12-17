// FolderDropdown - Dropdown for filtering photos by folder/album
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Modal,
  ScrollView,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';

export interface FolderStat {
  name: string;
  count: number;
}

interface FolderDropdownProps {
  currentFolder: string;
  photoCount: number;
  folders: FolderStat[];
  onSelectFolder: (folderName: string) => void;
}

export function FolderDropdown({
  currentFolder,
  photoCount,
  folders,
  onSelectFolder,
}: FolderDropdownProps) {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];
  const [visible, setVisible] = useState(false);

  const handleSelectFolder = (folderName: string) => {
    onSelectFolder(folderName);
    setVisible(false);
  };

  return (
    <>
      {/* Dropdown button */}
      <Pressable
        style={[styles.dropdownButton, { backgroundColor: colors.surfaceVariant }]}
        onPress={() => setVisible(true)}
      >
        <Text style={[styles.dropdownText, { color: colors.onSurface }]}>
          {currentFolder} ({photoCount})
        </Text>
        <Ionicons name="chevron-down" size={20} color={colors.onSurfaceVariant} />
      </Pressable>

      {/* Bottom sheet modal */}
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setVisible(false)}>
          <View style={[styles.bottomSheet, { backgroundColor: colors.surface }]}>
            {/* Handle bar */}
            <View style={[styles.handleBar, { backgroundColor: colors.outline }]} />

            {/* Title */}
            <Text style={[styles.sheetTitle, { color: colors.onSurface }]}>
              Select Folder
            </Text>

            {/* Folder list */}
            <ScrollView style={styles.folderList}>
              {/* "All Folders" option */}
              <Pressable
                style={[
                  styles.folderItem,
                  currentFolder === 'All Folders' && {
                    backgroundColor: colors.primaryContainer,
                  },
                ]}
                onPress={() => handleSelectFolder('All Folders')}
              >
                <Ionicons
                  name="images-outline"
                  size={24}
                  color={
                    currentFolder === 'All Folders' ? colors.primary : colors.onSurfaceVariant
                  }
                />
                <Text
                  style={[
                    styles.folderName,
                    {
                      color:
                        currentFolder === 'All Folders' ? colors.primary : colors.onSurface,
                    },
                  ]}
                >
                  All Folders
                </Text>
                <Text style={[styles.folderCount, { color: colors.onSurfaceVariant }]}>
                  {photoCount}
                </Text>
              </Pressable>

              {/* Individual folders */}
              {folders.map((folder) => (
                <Pressable
                  key={folder.name}
                  style={[
                    styles.folderItem,
                    currentFolder === folder.name && {
                      backgroundColor: colors.primaryContainer,
                    },
                  ]}
                  onPress={() => handleSelectFolder(folder.name)}
                >
                  <Ionicons
                    name="folder-outline"
                    size={24}
                    color={
                      currentFolder === folder.name ? colors.primary : colors.onSurfaceVariant
                    }
                  />
                  <Text
                    style={[
                      styles.folderName,
                      {
                        color:
                          currentFolder === folder.name ? colors.primary : colors.onSurface,
                      },
                    ]}
                  >
                    {folder.name}
                  </Text>
                  <Text style={[styles.folderCount, { color: colors.onSurfaceVariant }]}>
                    {folder.count}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    minHeight: 48,
  },
  dropdownText: {
    fontSize: 16,
    fontWeight: '500',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingBottom: 24,
    maxHeight: '70%',
  },
  handleBar: {
    width: 32,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '600',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  folderList: {
    flex: 1,
  },
  folderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 16,
    minHeight: 56,
  },
  folderName: {
    flex: 1,
    fontSize: 16,
  },
  folderCount: {
    fontSize: 14,
  },
});
