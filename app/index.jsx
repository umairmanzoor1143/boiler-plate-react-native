import { useNavigation } from "@react-navigation/native";
import React, { useEffect,useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  Dimensions,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Colors from "@/styles/colors";
import SignInWithGoogle from "@/components/SignInWithGoogle";
import InputField from "@/components/InputField";
import CustomKeyboardView from "@/components/CustomKeyboardScroll";
import { Link } from "expo-router";
import LoadingLayout  from "@/components/LoadingLayout";
import { useAuth } from "@/context/authContext";
import {ThemedInput} from "@/components/ThemedInput";
const { height } = Dimensions.get("window");

function LogIn() {
  //Form States
  const { signIn, signInLoading } = useAuth();
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  //
  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  //Redux Dispatcher
  const handleLogin = (email, password) => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }
    signIn(email, password);
  };


  return (
    <SafeAreaView style={styles.container}>
      <LoadingLayout loading={signInLoading}>
        <CustomKeyboardView style={styles.scrollContent}>
          <View style={styles.formContainer}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Login to your account</Text>
          <View style={styles.inputContainer}>
            {/* Field Container */}
            <View style={styles.labelContainer}>
              <Text style={styles.labelText}>Email</Text>
            </View>
            <ThemedInput
              value={email}
              style={styles.inputText}
              onChangeText={(e) => setEmail(e)}
              containerStyle={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          <View style={styles.inputContainer}>
            <View style={styles.labelContainer}>
              <Text style={styles.labelText}>Password</Text>
              <TouchableOpacity>
                <Text style={styles.forgotPassword}>Forget Password?</Text>
              </TouchableOpacity>
            </View>
            <ThemedInput
              containerStyle={styles.input}
              value={password}
              style={styles.inputText}
              onChangeText={(e) => setPassword(e)}
              secureTextEntry
            />
          </View>
          <TouchableOpacity
            style={[styles.loginButton, signInLoading && styles.loginButtonDisabled]}
            onPress={() => handleLogin(email, password)}
            disabled={signInLoading}
          >
            {signInLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.loginButtonText}>Log In</Text>
            )}
          </TouchableOpacity>
          <Text style={styles.orText}>OR</Text>
          <SignInWithGoogle />
          <View style={styles.footerTextContainer}>
            <Text>Don't have an account?</Text>
            <TouchableOpacity>

            <Link href="/signup">
                <Text style={styles.signupLink}>SignUp</Text>
            </Link>
            </TouchableOpacity>

          </View>
        </View>
      </CustomKeyboardView>
      </LoadingLayout>
    </SafeAreaView>
  );
}
export default LogIn;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  scrollContent: {
    flex: 1,
  },
  formContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: height * 0.8,
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
  inputContainer: {
    width: "100%",
  },
  labelContainer: {
    marginVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  labelText: {
    color: Colors.primary200,
  },
  input: {
    backgroundColor: "#f2f2f2",
  },
  inputText: {
    color: Colors.primary600,
  },
  forgotPassword: {
    color: Colors.linkColor,
    fontWeight: "bold",
  },
  loginButton: {
    width: "100%",
    backgroundColor: "#001f54",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  loginButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  orText: {
    fontSize: 16,
    color: Colors.primary600,
    marginVertical: 20,
  },
  signupText: {
    marginTop: 30,
    fontSize: 14,
    color: "#666",
  },
  signupLink: {
    color: Colors.linkColor,
    fontWeight: "bold",
  },
  footerTextContainer: {
    marginTop: 50,
    flexDirection: "row",
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
});
