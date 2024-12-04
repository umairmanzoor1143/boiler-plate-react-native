import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import { useColorScheme } from "@/hooks/useColorScheme";
import { ActivityIndicator, View } from "react-native";
import { AuthContextProvider, useAuth,NotificationProvider } from "@/context";
import LoadingLayout from "@/components/LoadingLayout";
import * as Notifications from 'expo-notifications';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { StatusBar } from 'expo-status-bar';
import { useActivityTracker } from '@/hooks/useActivityTracker';

SplashScreen.preventAutoHideAsync();
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    priority: Notifications.AndroidNotificationPriority.MAX
  }),
});

// Add this function to test notifications
async function requestAndTestNotifications() {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    console.log("Current permission status:", existingStatus);

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      console.log("New permission status:", status);
    }

    // Test notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Test Notification",
        body: "Testing notification permissions",
      },
      trigger: null,
    });
  } catch (error) {
    console.error("Notification test error:", error);
  }
}

function RootLayoutNav() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  
  // Add activity tracker
  useActivityTracker();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(app)/');
    } else {
      router.replace('/(auth)/');
    }
  }, [isAuthenticated]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
    {!isAuthenticated ? (
      <Stack.Screen name="(auth)" />
    ) : (
      <Stack.Screen name="(app)" />
    )}
  </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const { initialLoading } = useAuth();
console.log({initialLoading})
  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    // Request notifications when app loads
    requestAndTestNotifications();
  }, []);

  if (!loaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    // <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthContextProvider>
        <NotificationProvider>
        <SafeAreaView style={{flex:1, backgroundColor: '#ffffff'}} edges={[]}>
        <LoadingLayout loading={initialLoading}>
          <StatusBar style="dark" />
          <RootLayoutNav />
        </LoadingLayout>
        </SafeAreaView>
        </NotificationProvider>
      </AuthContextProvider>
    // </ThemeProvider>
  );
}
