import { TouchableOpacity, Text, StyleSheet } from "react-native";
import Colors from "@/styles/colors";
import { useAuth } from "@/context/authContext";

function SignInWithGoogle() {
  const { signInWithGoogle } = useAuth();

  return (
    <TouchableOpacity style={styles.googleButton} onPress={signInWithGoogle}>
      <Text style={styles.googleButtonText}>
        <Text style={styles.googleIcon}>🌐 </Text>
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
  },
  googleButtonText: {
    fontSize: 16,
    color: Colors.primary600,
    fontWeight: "bold",
  },
  googleIcon: {
    fontSize: 18,
  },
});
