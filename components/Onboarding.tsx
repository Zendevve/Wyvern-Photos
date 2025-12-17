// Onboarding Screen - 4-step wizard for Telegram bot setup
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  useColorScheme,
  Alert,
  Pressable,
} from 'react-native';
import { router } from 'expo-router';
import * as Crypto from 'expo-crypto';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { OnboardingStep } from '@/components/OnboardingStep';
import { TelegramBotApi } from '@/lib/telegram/botApi';
import { saveBotToken } from '@/lib/storage/secure';
import { insertBot } from '@/lib/database/dao';
import { useDatabase } from '@/hooks/useDatabase';
import Colors from '@/constants/Colors';

interface OnboardingProps {
  onComplete: () => void;
  onSkip: () => void;
}

export function Onboarding({ onComplete, onSkip }: OnboardingProps) {
  const colorScheme = useColorScheme() ?? 'dark';
  const colors = Colors[colorScheme];
  const { updateSettings } = useDatabase();

  const [currentStep, setCurrentStep] = useState(0);
  const [botToken, setBotToken] = useState('');
  const [channelId, setChannelId] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  // Success animation
  const checkmarkScale = useSharedValue(0);

  const animatedCheckmarkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkmarkScale.value }],
  }));

  // Validation functions
  const validateBotToken = async () => {
    if (!botToken.trim()) {
      Alert.alert('Error', 'Please enter your bot token');
      return false;
    }

    setIsValidating(true);
    try {
      const botApi = new TelegramBotApi(botToken.trim());
      const response = await botApi.getMe();

      if (!response.ok) {
        Alert.alert('Invalid Token', 'The bot token is invalid. Please check and try again.');
        return false;
      }

      return true;
    } catch (error) {
      Alert.alert('Error', 'Failed to validate bot token. Please try again.');
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  const validateChannelAndSave = async () => {
    if (!channelId.trim()) {
      Alert.alert('Error', 'Please enter your channel ID');
      return false;
    }

    setIsValidating(true);
    try {
      const botApi = new TelegramBotApi(botToken.trim());
      const chatResponse = await botApi.getChat(channelId.trim());

      if (!chatResponse.ok) {
        Alert.alert(
          'Channel Access Error',
          'Cannot access the channel. Make sure:\n' +
          '• The bot is added to the channel\n' +
          '• The bot has admin permissions\n' +
          '• The channel ID is correct'
        );
        return false;
      }

      // Save bot configuration
      const botId = Crypto.randomUUID();
      await saveBotToken(botId, botToken.trim());
      await insertBot({
        id: botId,
        name: chatResponse.result?.title || 'My Bot',
        token: botId,
        channelId: channelId.trim(),
        isActive: true,
        createdAt: Date.now(),
        lastUsed: null,
      });

      await updateSettings({ primaryBotId: botId, onboardingCompleted: true });

      return true;
    } catch (error) {
      Alert.alert('Error', 'Failed to save configuration. Please try again.');
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  // Step navigation handlers
  const handleNext = async () => {
    if (currentStep === 1) {
      const isValid = await validateBotToken();
      if (!isValid) return;
    } else if (currentStep === 2) {
      const isValid = await validateChannelAndSave();
      if (!isValid) return;

      // Trigger success animation
      checkmarkScale.value = withSpring(1, {
        mass: 0.5,
        damping: 10,
        overshootClamping: false,
      });
    }

    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  // Render steps
  if (currentStep === 0) {
    // Welcome Screen
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.welcomeContent}>
          <View style={[styles.iconContainer, { backgroundColor: colors.primaryContainer }]}>
            <Ionicons name="cloud-outline" size={64} color={colors.primary} />
          </View>

          <Text style={[styles.welcomeTitle, { color: colors.onSurface }]}>
            Welcome to Wyvern Photos
          </Text>
          <Text style={[styles.welcomeSubtitle, { color: colors.onSurfaceVariant }]}>
            Unlimited photo backup using your own Telegram account
          </Text>

          <View style={styles.benefitsList}>
            {[
              'Unlimited storage (no quotas)',
              'You own your data completely',
              'Private and encrypted',
              'Access from anywhere',
            ].map((benefit, index) => (
              <View key={index} style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                <Text style={[styles.benefitText, { color: colors.onSurface }]}>
                  {benefit}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.welcomeButtons}>
          <Pressable
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
            onPress={() => setCurrentStep(1)}
          >
            <Text style={[styles.primaryButtonText, { color: colors.onPrimary }]}>
              Get Started
            </Text>
          </Pressable>

          <Pressable style={styles.skipButton} onPress={onSkip}>
            <Text style={[styles.skipButtonText, { color: colors.onSurfaceVariant }]}>
              Skip for now
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (currentStep === 1) {
    // Create Bot Step
    return (
      <OnboardingStep
        stepNumber={0}
        totalSteps={3}
        title="1. Create Your Bot"
        onNext={handleNext}
        onBack={handleBack}
        nextDisabled={!botToken.trim()}
        isLoading={isValidating}
      >
        <Text style={[styles.instructions, { color: colors.onSurface }]}>
          Follow these steps to create your Telegram bot:
        </Text>

        <View style={styles.stepsList}>
          <Text style={[styles.stepText, { color: colors.onSurface }]}>
            1. Open Telegram and search for <Text style={styles.bold}>@BotFather</Text>
          </Text>
          <Text style={[styles.stepText, { color: colors.onSurface }]}>
            2. Send the <Text style={styles.bold}>/newbot</Text> command
          </Text>
          <Text style={[styles.stepText, { color: colors.onSurface }]}>
            3. Follow the instructions to name your bot
          </Text>
          <Text style={[styles.stepText, { color: colors.onSurface }]}>
            4. Copy the bot token you receive
          </Text>
        </View>

        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.surfaceVariant,
              color: colors.onSurface,
              borderColor: colors.outline,
            },
          ]}
          placeholder="Bot Token"
          placeholderTextColor={colors.outline}
          value={botToken}
          onChangeText={setBotToken}
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry
        />
      </OnboardingStep>
    );
  }

  if (currentStep === 2) {
    // Create Channel Step
    return (
      <OnboardingStep
        stepNumber={1}
        totalSteps={3}
        title="2. Create Your Storage Channel"
        onNext={handleNext}
        onBack={handleBack}
        nextDisabled={!channelId.trim()}
        isLoading={isValidating}
      >
        <Text style={[styles.instructions, { color: colors.onSurface }]}>
          Create a private channel to store your photos:
        </Text>

        <View style={styles.stepsList}>
          <Text style={[styles.stepText, { color: colors.onSurface }]}>
            1. In Telegram, create a <Text style={styles.bold}>new channel</Text>
          </Text>
          <Text style={[styles.stepText, { color: colors.onSurface }]}>
            2. Name it (e.g., "My Photo Vault")
          </Text>
          <Text style={[styles.stepText, { color: colors.onSurface }]}>
            3. Set it to <Text style={styles.bold}>Private</Text>
          </Text>
          <Text style={[styles.stepText, { color: colors.onSurface }]}>
            4. Add your bot as an <Text style={styles.bold}>admin</Text>
          </Text>
          <Text style={[styles.stepText, { color: colors.onSurface }]}>
            5. Forward any message to <Text style={styles.bold}>@userinfobot</Text> to get
            channel ID
          </Text>
        </View>

        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.surfaceVariant,
              color: colors.onSurface,
              borderColor: colors.outline,
            },
          ]}
          placeholder="Channel ID (e.g., -100123456789)"
          placeholderTextColor={colors.outline}
          value={channelId}
          onChangeText={setChannelId}
          keyboardType="numeric"
        />
      </OnboardingStep>
    );
  }

  if (currentStep === 3) {
    // Success Screen
    return (
      <OnboardingStep
        stepNumber={2}
        totalSteps={3}
        title="You're All Set!"
        onNext={() => {
          router.push('/(tabs)');
          onComplete();
        }}
        nextLabel="Start Uploading"
      >
        <View style={styles.successContent}>
          <Animated.View style={[styles.checkmarkContainer, animatedCheckmarkStyle]}>
            <Ionicons name="checkmark-circle" size={96} color={colors.primary} />
          </Animated.View>

          <Text style={[styles.successMessage, { color: colors.onSurface }]}>
            Your Telegram bot is now connected
          </Text>

          <View style={[styles.infoCard, { backgroundColor: colors.surfaceVariant }]}>
            <Text style={[styles.infoText, { color: colors.onSurface }]}>
              • Go to Photos tab and select photos to upload
            </Text>
            <Text style={[styles.infoText, { color: colors.onSurface }]}>
              • Photos will be backed up to your private Telegram channel
            </Text>
            <Text style={[styles.infoText, { color: colors.onSurface }]}>
              • You can change settings anytime in the Settings tab
            </Text>
          </View>
        </View>
      </OnboardingStep>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  welcomeContent: {
    flex: 1,
    padding: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 128,
    height: 128,
    borderRadius: 64,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  welcomeSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  benefitsList: {
    alignSelf: 'stretch',
    gap: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  benefitText: {
    fontSize: 16,
    flex: 1,
  },
  welcomeButtons: {
    padding: 16,
    gap: 12,
  },
  primaryButton: {
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
    minHeight: 56,
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 14,
  },
  instructions: {
    fontSize: 16,
    marginBottom: 16,
  },
  stepsList: {
    gap: 12,
    marginBottom: 24,
  },
  stepText: {
    fontSize: 14,
    lineHeight: 22,
  },
  bold: {
    fontWeight: '600',
  },
  input: {
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
    marginTop: 8,
  },
  successContent: {
    alignItems: 'center',
  },
  checkmarkContainer: {
    marginVertical: 32,
  },
  successMessage: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 32,
  },
  infoCard: {
    padding: 20,
    borderRadius: 16,
    gap: 12,
    alignSelf: 'stretch',
  },
  infoText: {
    fontSize: 14,
    lineHeight: 22,
  },
});
