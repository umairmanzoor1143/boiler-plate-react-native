import { Image, StyleSheet, Platform } from "react-native";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useRouter } from "expo-router";
import { useNotification, useAuth } from "@/context";
import { useState, useEffect } from "react";

// Updated helper function to get precise local date and time
const getCurrentLocalDate = () => {
  const now = new Date();
  return now; // No need for timezone offset as we'll use local methods
};

export default function HomeScreen() {
  const { logout, user } = useAuth();
  const { notification, expoPushToken, error } = useNotification();
  const router = useRouter();
  const [dateTime, setDateTime] = useState(getCurrentLocalDate());

  // Add useEffect to update time every second if you want live updates
  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(getCurrentLocalDate());
    }, 1000);

    return () => clearInterval(timer); // Cleanup on unmount
  }, []);

  return (
    <ParallaxScrollView
      headerBackgroundColor={"#A1CEDC"}
      headerImage={
        <Image
          source={
            user?.photoURL
              ? { uri: user.photoURL }
              : require("@/assets/images/partial-react-logo.png")
          }
          style={styles.reactLogo}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title"> ok</ThemedText>
        <ThemedText
          type="title"
          onPress={() => {
            router.replace("/(auth)");
            logout();
          }}
        >
          logout!
        </ThemedText>
      </ThemedView>
      <ThemedText>{expoPushToken}</ThemedText>
      <ThemedText type="subtitle">Latest notification:</ThemedText>
      <ThemedText>{notification?.request.content.title}</ThemedText>
      <ThemedText onPress={() => setDateTime(getCurrentLocalDate())}>
        {dateTime.toLocaleDateString(undefined, {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}{" "}
        {dateTime.toLocaleTimeString(undefined, {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true, // for 12-hour format with AM/PM
        })}
      </ThemedText>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
    objectFit: "cover",
  },
});
