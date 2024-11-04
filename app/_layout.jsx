import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useSegments, useRouter,Slot } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import { useColorScheme } from "@/hooks/useColorScheme";
import { ActivityIndicator, View } from "react-native";
import { AuthContextProvider, useAuth } from "@/context/authContext";
import { useNavigation } from "@react-navigation/native";
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const navigation = useNavigation();
  useEffect(() => {
    if(typeof isAuthenticated === "undefined") return;
    const inApp = segments[0] === "(app)";
  if(!isAuthenticated){
      router.replace("/");
      return;
    }
    if (isAuthenticated && !inApp) {
      router.replace("(app)"); 
    }
  }, [isAuthenticated]);

  return (
    <Slot />
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthContextProvider>
        <RootLayoutNav />
      </AuthContextProvider>
    </ThemeProvider>
  );
}
