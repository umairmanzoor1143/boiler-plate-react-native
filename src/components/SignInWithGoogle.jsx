import { TouchableOpacity, Text, StyleSheet, Image } from "react-native";
import { useAuth } from "@/context/authContext";
// import GoogleIcon from "@/assets/icons/GoogleIcon.svg";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { useEffect } from "react";
import { 
  GoogleAuthProvider
} from "firebase/auth";
import * as Notifications from 'expo-notifications';

function SignInWithGoogle() {
  const { signInWithGoogle } = useAuth();
  useEffect(() => {
    // Initialize GoogleSignin
    GoogleSignin.configure({
      webClientId:
      process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB, 
      // from Google Cloud Console
      offlineAccess: true,
      forceCodeForRefreshToken: true,
    });
  }, []);

  const handleGoogleSignIn = async () => {
    try {
   

      // Continue with Google Sign In
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      // Sign out first to make sure nothing is cached
      await GoogleSignin.signOut();

      // Sign in
      const userInfo = await GoogleSignin.signIn();

      if (userInfo.data.idToken) {
        // Create a Google credential with the token
        const credential = GoogleAuthProvider.credential(
          userInfo.data.idToken,
          userInfo.data.accessToken
        );

        // Sign in with Firebase using the credential
        signInWithGoogle(credential)
      } else {
        throw new Error("No ID Token present!");
      }
    } catch (error) {
      console.error("Detailed Google Sign-In Error:", error);
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log("User cancelled the login flow");
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log("Sign in is in progress");
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.log("Play services not available");
      } else {
        console.log("Other error:", error);
      }
    }
  };
  return (
        <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignIn}>
      {/* <GoogleIcon width={24} height={24}/> */}
      <Text style={styles.googleButtonText}>
        Sign in with Google
      </Text>
    </TouchableOpacity>
  );
}

export default SignInWithGoogle;
const styles = StyleSheet.create({
  googleButton: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ddd",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: "#1a73e8",
  },
  googleButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 10,
  },
  googleIcon: {
    fontSize: 18,
  },
});
