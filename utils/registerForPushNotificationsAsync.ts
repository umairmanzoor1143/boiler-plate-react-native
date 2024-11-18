import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform, PermissionsAndroid } from "react-native";

export async function registerForPushNotificationsAsync() {
  try {
    if (!Device.isDevice) {
      throw new Error("Must use physical device for push notifications");
    }

    // For Android 13 and above, we need to explicitly request POST_NOTIFICATIONS permission
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const permission = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        {
          title: "Notification Permission",
          message: "We need your permission to send you notifications",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Don't Allow",
          buttonPositive: "Allow"
        }
      );
      
      console.log("Android 13+ permission result:", permission);
      
      if (permission !== PermissionsAndroid.RESULTS.GRANTED) {
        console.log("Notification permission denied");
        return null;
      }
    }

    // Set up notification channel for Android
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
        enableVibrate: true,
        enableLights: true,
        showBadge: true,
      });
    }

    // Get Expo push token
    const projectId = Constants?.expoConfig?.extra?.eas?.projectId;
    if (!projectId) {
      throw new Error("Project ID not found");
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    console.log("Existing permission status:", existingStatus);

    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
      console.log("New permission status:", finalStatus);
    }

    if (finalStatus !== 'granted') {
      console.log("Permission not granted");
      return null;
    }

    const token = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    console.log("Push token:", token.data);
    return token.data;

  } catch (error) {
    console.log("Error in registerForPushNotificationsAsync:", error);
    return null;
  }
}