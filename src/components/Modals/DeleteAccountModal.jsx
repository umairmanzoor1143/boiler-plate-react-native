import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { ThemedText } from "@/components/ThemedText";
import { ThemedInput } from "@/components/ThemedInput";
import { useAuth } from "@/context/authContext";
import { useRouter } from "expo-router";
import { GoogleSignin, statusCodes } from "@react-native-google-signin/google-signin";
import { GoogleAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { auth } from "@/firebaseConfig";


const DeleteAccountModal = ({ visible, onClose }) => {
  const router = useRouter();
  const { deleteUserAccount, reauthenticateUser, logout, user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authProvider, setAuthProvider] = useState(null);

  useEffect(() => {
    const configureGoogleSignIn = async () => {
      try {
        await GoogleSignin.configure({
          webClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB,
          offlineAccess: true,
          scopes: ["profile", "email"],
        });
      } catch (error) {
        console.error("Google Sign-In configuration error:", error);
      }
    };
  
    configureGoogleSignIn();
  
    if (user) {
      const isGoogleUser = user.provider === "google";
      setAuthProvider(isGoogleUser ? "google" : "password");
      setStep(!isGoogleUser ? "verify" : "confirm");
    }
  }, [user]);

  const handlePasswordVerification = async () => {
    if (!password.trim()) {
      setError("Password is required");
      return;
    }

    setLoading(true);
    try {
      await reauthenticateUser(password);
      setError("");
      setStep("confirm");
    } catch (error) {
      setError("Incorrect password");
    } finally {
      setLoading(false);
    }
  };

  const reauthenticateWithGoogle = async () => {
    try {
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      // Sign out first to make sure nothing is cached
      await GoogleSignin.signOut();

      // Get the user credentials
      const userInfo = await GoogleSignin.signIn();
      const { accessToken } = await GoogleSignin.getTokens();
      const googleUser = userInfo.data;   
      if (!googleUser.idToken) {
        throw new Error('No ID Token present!');
      }

      // Create the credential using GoogleAuthProvider
      const credential = GoogleAuthProvider.credential(
        googleUser.idToken,
        accessToken
      );

      // Reauthenticate the user using reauthenticateWithCredential
      await reauthenticateWithCredential(auth.currentUser, credential);
      return true;
    } catch (error) {
      console.error('Detailed Google Re-auth Error:', error);
      
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        throw new Error('Google Sign-In was cancelled');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        throw new Error('Google Sign-In is already in progress');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        throw new Error('Play services not available');
      } else {
        throw new Error(error.message || 'Failed to authenticate with Google');
      }
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      if (authProvider === "password") {
        if (!password) {
          throw new Error("Password is required");
        }
        await deleteUserAccount(password);
      } else if (authProvider === "google") {
        try {
          await reauthenticateWithGoogle();
          await deleteUserAccount();
        } catch (error) {
          console.error('Google auth error:', error);
          throw new Error(error.message || 'Failed to authenticate with Google');
        }
      }
      
      setStep("success");
      setTimeout(() => {
        onClose();
        // router.replace('/(auth)/');
      }, 1500);
    } catch (error) {
      console.error('Delete account error:', error);
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
};

  const handleSuccessAcknowledgement = () => {
    onClose();
    logout();
  };

  const resetModal = () => {
    setStep(authProvider === "password" ? "verify" : "confirm");
    setPassword("");
    setError("");
    onClose();
  };  

  if (step === null) {
    return null;
  }
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={resetModal}
    >
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          {loading ? (
            <ActivityIndicator size="large" color={Colors.light.tint} />
          ) : step === "confirm" ? (
            <>
              <View style={styles.iconContainer}>
                <Ionicons name="warning" size={50} color={Colors.light.danger} />
              </View>
              <ThemedText style={styles.title}>Warning</ThemedText>
              <ThemedText style={styles.message}>
                Deleting your account will remove all saved data. Ready to proceed?
              </ThemedText>
              <View style={styles.buttonsContainer}>
                <TouchableOpacity onPress={handleDeleteAccount} style={styles.yesButton}>
                  <ThemedText style={styles.yesText}>Delete</ThemedText>
                </TouchableOpacity>
                <View style={styles.divider} />
                <TouchableOpacity onPress={resetModal} style={styles.noButton}>
                  <ThemedText style={styles.noText}>Cancel</ThemedText>
                </TouchableOpacity>
              </View>
            </>
          ) : step === "verify" ? (
            <>
              <View style={styles.iconContainer}>
                <Ionicons name="warning" size={50} color={Colors.light.danger} />
              </View>
              <ThemedText style={styles.title}>Verify Password</ThemedText>
              <ThemedInput
                placeholder="Enter your password"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                containerStyle={styles.input}
                rightIcon={
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={24}
                      color={Colors.light.icon}
                    />
                  </TouchableOpacity>
                }
              />
              {error ? (
                <ThemedText style={styles.errorText}>{error}</ThemedText>
              ) : null}
              <View style={styles.buttonsContainer}>
                <TouchableOpacity onPress={handlePasswordVerification} style={styles.yesButton}>
                  <ThemedText style={styles.yesText}>Verify</ThemedText>
                </TouchableOpacity>
                <View style={styles.divider} />
                <TouchableOpacity onPress={resetModal} style={styles.noButton}>
                  <ThemedText style={styles.noText}>Cancel</ThemedText>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <View style={styles.iconContainer}>
                <Ionicons name="checkmark-circle" size={50} color={Colors.light.success} />
              </View>
              <ThemedText style={styles.title}>Account Deleted</ThemedText>
              <ThemedText style={styles.message}>
                Your account has been deleted successfully.
              </ThemedText>
              <TouchableOpacity onPress={handleSuccessAcknowledgement} style={styles.okButton}>
                <ThemedText style={styles.okText}>OK</ThemedText>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: 300,
    backgroundColor: Colors.light.background,
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    elevation: 5,
  },
  iconContainer: {
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.light.text,
    marginBottom: 20,
  },
  message: {
    fontSize: 15,
    color: Colors.light.text,
    textAlign: "center",
    marginBottom: 30,
  },
  buttonsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  yesButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
  },
  yesText: {
    color: Colors.light.danger,
    fontSize: 16,
    fontWeight: "bold",
  },
  noButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
  },
  noText: {
    color: Colors.light.tint,
    fontSize: 16,
    fontWeight: "bold",
  },
  okButton: {
    marginTop: 20,
    backgroundColor: Colors.light.tint,
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 5,
  },
  okText: {
    color: Colors.light.background,
    fontSize: 16,
    fontWeight: "bold",
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: "#ccc",
  },
  errorText: {
    color: Colors.light.danger,
    fontSize: 14,
    marginTop: 10,
  },
  input: {
    width: "100%",
    marginBottom: 20,
    backgroundColor: Colors.light.inputBackground,
  },
});

export default DeleteAccountModal;
