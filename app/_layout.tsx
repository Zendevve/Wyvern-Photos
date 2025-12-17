import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { Modal } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import { Onboarding } from '@/components/Onboarding';
import { useDatabase } from '@/hooks/useDatabase';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { settings, isReady: dbReady, updateSettings } = useDatabase();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (dbReady && settings && !settings.onboardingCompleted) {
      setShowOnboarding(true);
    }
  }, [dbReady, settings]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  const handleOnboardingSkip = async () => {
    await updateSettings({ onboardingCompleted: true });
    setShowOnboarding(false);
  };

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        <Stack.Screen name="viewer" options={{ presentation: 'fullScreenModal', headerShown: false }} />
      </Stack>

      {/* Onboarding modal */}
      <Modal
        visible={showOnboarding}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <Onboarding onComplete={handleOnboardingComplete} onSkip={handleOnboardingSkip} />
      </Modal>
    </ThemeProvider>
  );
}
