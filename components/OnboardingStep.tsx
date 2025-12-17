// OnboardingStep - Reusable wrapper for each onboarding step
import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  useColorScheme,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';

interface OnboardingStepProps {
  stepNumber: number;
  totalSteps: number;
  title: string;
  children: React.ReactNode;
  onNext: () => void;
  onBack?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  isLoading?: boolean;
}

export function OnboardingStep({
  stepNumber,
  totalSteps,
  title,
  children,
  onNext,
  onBack,
  nextLabel = 'Next',
  nextDisabled = false,
  isLoading = false,
}: OnboardingStepProps) {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Progress indicator */}
      <View style={styles.progressContainer}>
        {Array.from({ length: totalSteps }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressDot,
              {
                backgroundColor:
                  index === stepNumber ? colors.primary : colors.outlineVariant,
              },
            ]}
          />
        ))}
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: colors.onSurface }]}>{title}</Text>
        {children}
      </ScrollView>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        {onBack && (
          <Pressable
            style={[styles.backButton, { borderColor: colors.outline }]}
            onPress={onBack}
            disabled={isLoading}
          >
            <Ionicons name="arrow-back" size={20} color={colors.onSurface} />
            <Text style={[styles.backButtonText, { color: colors.onSurface }]}>
              Back
            </Text>
          </Pressable>
        )}

        <Pressable
          style={[
            styles.nextButton,
            {
              backgroundColor: nextDisabled ? colors.surfaceVariant : colors.primary,
              flex: onBack ? undefined : 1,
            },
          ]}
          onPress={onNext}
          disabled={nextDisabled || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.onPrimary} />
          ) : (
            <>
              <Text
                style={[
                  styles.nextButtonText,
                  { color: nextDisabled ? colors.outline : colors.onPrimary },
                ]}
              >
                {nextLabel}
              </Text>
              <Ionicons
                name="arrow-forward"
                size={20}
                color={nextDisabled ? colors.outline : colors.onPrimary}
              />
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 28,
    borderWidth: 1,
    gap: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 28,
    gap: 8,
    minHeight: 56,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
