import { Stack } from "expo-router";
import { Colors } from "@/constants/Colors";
import CustomHeader from "@/components/Header/CustomHeader";
import { TouchableOpacity,View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: Colors.light.background,
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: true,
          headerTitle: "",
          header: ({})=> (
            <View style={{backgroundColor: Colors.light.background, height: 60}}/>
          )
        }}
      />
      <Stack.Screen
        name="profile-settings"
        options={{
          header: ({ navigation, route, options }) => (
            <CustomHeader
              style={{
                backgroundColor: Colors.light.background,
                height: 100,
              }}
              borderShadow={true}
              leftComponent={
                <TouchableOpacity onPress={() => navigation.goBack()}>
                  <Ionicons
                    name="arrow-back"
                    size={24}
                    color={Colors.light.tint}
                  />
                </TouchableOpacity>
              }
              title="Account Settings"
            />
          ),
        }}
      />
    </Stack>
  );
}
