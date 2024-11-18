import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import CustomKeyboardView from "@/components/CustomKeyboardScroll";
import LoadingLayout from "@/components/LoadingLayout";
import { SafeAreaView } from "react-native-safe-area-context";
import { useImagePicker } from '@/hooks/useImagePicker';
import Colors from "@/styles/colors";
import { useAuth } from "@/context/authContext";
import { FormInput, FormButton } from "@/components/Form";
import { Link } from "expo-router";
function SignUp() {
  const navigation = useNavigation();
  const { signUp, signUpLoading } = useAuth();
  const { uri: profileImage, pickImage } = useImagePicker();

  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  const updateFormData = (key, value) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.confirmPassword || !formData.username) {
      Alert.alert("Error", "Please fill in all fields");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert("Error", "Passwords don't match");
      return false;
    }

    if (formData.password.length < 6) {
      Alert.alert("Error", "Password should be at least 6 characters");
      return false;
    }

    return true;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    try {
      await signUp({...formData, profileImageUri: profileImage});
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
     {/* <LoadingLayout loading={signUpLoading}> */}
      <CustomKeyboardView style={styles.scrollContent}>
        <View style={styles.formContainer}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Sign up to get started</Text>

        {/* Profile Image Picker */}
        <TouchableOpacity style={styles.imagePickerContainer} onPress={pickImage}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderText}>Add Photo</Text>
            </View>
          )}
        </TouchableOpacity>

        <FormInput
          label="Username"
          value={formData.username}
          onChangeText={(text) => updateFormData('username', text)}
          placeholder="Enter username"
        />

        <FormInput
          label="Email"
          value={formData.email}
          onChangeText={(text) => updateFormData('email', text)}
          keyboardType="email-address"
          placeholder="Enter email"
        />

        <FormInput
          label="Password"
          value={formData.password}
          onChangeText={(text) => updateFormData('password', text)}
          secureTextEntry
          placeholder="Enter password"
        />

        <FormInput
          label="Confirm Password"
          value={formData.confirmPassword}
          onChangeText={(text) => updateFormData('confirmPassword', text)}
          secureTextEntry
          placeholder="Confirm password"
        />

        <FormButton
          title="Sign Up"
          onPress={handleSignUp}
        />

        <View style={styles.footerTextContainer}>
          <Text style={styles.footerText}>Already have an account? </Text>

          <TouchableOpacity>
            <Link href="/login">
            <Text style={styles.loginLink} >Login</Text>
            </Link>
          </TouchableOpacity>
          </View>
        </View>
      </CustomKeyboardView>
      {/* </LoadingLayout> */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",

  },
  scrollContent: {
    flex: 1,
    padding: 20,
  },
  formContainer: {
    flex: 1,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    color: Colors.primary600,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    color: Colors.primary600,
  },
  imagePickerContainer: {
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  imagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary200,
    justifyContent: "center",
    alignItems: "center",
  },
  imagePlaceholderText: {
    color: Colors.white,
    fontSize: 14,
  },
  footerTextContainer: {
    marginTop: 20,
    flexDirection: "row",
  },
  footerText: {
    fontSize: 14,
    color: "#666",
  },
  loginLink: {
    color: Colors.linkColor,
    fontWeight: "bold",
  },
});

export default SignUp;
