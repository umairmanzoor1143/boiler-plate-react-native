import {
  View,
  Text,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  StyleSheet
} from "react-native";
import React from "react";
const ios = Platform.OS == "ios";
export default function CustomKeyboardView({ children, style }: { children: React.ReactNode, style?: any }) {
  return (
    <KeyboardAvoidingView
      behavior={ios ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView
        style={[styles.scrollContent, style]}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
const styles = StyleSheet.create({
  scrollContent: {
    flex: 1,
  },
});
