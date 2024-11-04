import { createContext, useContext, useEffect, useState } from "react";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { 
  GoogleAuthProvider, 
  signInWithCredential, 
  onAuthStateChanged, 
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential
} from "firebase/auth";
import { doc, setDoc, getDoc, deleteDoc, collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "@/firebasseConfig";
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { handleFirebaseError } from "@/utils/firebaseErrors";
import * as SplashScreen from "expo-splash-screen";

SplashScreen.preventAutoHideAsync();
WebBrowser.maybeCompleteAuthSession();

export const AuthContext = createContext({});

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(undefined);
  const [loading, setLoading] = useState(true);
  const [signUpLoading, setSignUpLoading] = useState(false);
  const [signInLoading, setSignInLoading] = useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS,
    androidClientId: "832040761479-f64kq8a569bdlh50oia78pmpa3h1e5gr.apps.googleusercontent.com",
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB,
    redirectUri: "https://boilerplateapp-8cea2.firebaseapp.com/__/auth/handler"
  });
  // Create user profile in Firestore
  const createUserProfile = async (userId, userData) => {
    try {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          ...userData,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    } catch (error) {
      console.error("Error creating user profile:", error);
      throw error;
    }
  };

  // Helper function to generate username
  const generateUsername = async (displayName) => {
    const cleanName = displayName
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, '') // Remove special characters
      .substring(0, 12); // Limit length
    
    const usersRef = collection(db, 'users');
    let username;
    let isUnique = false;
    let attempt = 0;

    while (!isUnique && attempt < 5) {
      const randomNum = Math.floor(Math.random() * 10000); // Random 4-digit number
      username = `${cleanName}${randomNum}`;

      const q = query(usersRef, where('username', '==', username));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        isUnique = true;
      }
      attempt++;
    }

    return username;
  };

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const savedUser = await AsyncStorage.getItem('user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
          setIsAuthenticated(true);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error loading auth state:", error);
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
       if (user) {
        await AsyncStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        setIsAuthenticated(!!user);
      } else {
        await AsyncStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (response?.type === "success") {
      setSignInLoading(true);
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential)
        .then(async (result) => {
          const displayName = result.user.displayName || 'user';
          const generatedUsername = await generateUsername(displayName);

          // Create Firestore profile for Google sign-in
          const userData = {
            uid: result.user.uid,
            email: result.user.email,
            displayName: result.user.displayName,
            username: generatedUsername,
            photoURL: result.user.photoURL,
            provider: 'google',
            createdAt: new Date(),
            updatedAt: new Date()
          };

          try {
            // Create user profile in Firestore
            const userRef = doc(db, 'users', result.user.uid);
            await setDoc(userRef, userData);

            // Update auth profile with username
            await updateProfile(result.user, {
              displayName: generatedUsername
            });
            setUser(result.user);
            setIsAuthenticated(true);
            setSignInLoading(false);
            await AsyncStorage.setItem('user', JSON.stringify(result.user));
          } catch (error) {
            setSignInLoading(false);
            handleFirebaseError({error});
          }
        })
        .catch((error) => {
          setSignInLoading(false);
          handleFirebaseError({error});
        });
    }
  }, [response]);

  // Sign up with email/password
  const uploadProfileImage = async (uri) => {
    if (!uri) return null;
    
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      
      const storage = getStorage();
      const storageRef = ref(storage, `profileImages/${Date.now()}`);
      
      await uploadBytes(storageRef, blob);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.log({error});
      handleFirebaseError({error});
    }
  };

  const signUp = async (email, password, username, profileImageUri) => {
    setSignUpLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Upload profile image if provided
      const photoURL = await uploadProfileImage(profileImageUri);
      
      // Update auth profile
      await updateProfile(userCredential.user, {
        displayName: username,
        photoURL: photoURL
      });
      const userData = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: username,
        username: username,
        photoURL: photoURL,
        provider: 'email',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await createUserProfile(userCredential.user.uid, userData);
      return userCredential.user;
    } catch (error) {
      setSignUpLoading(false);
      handleFirebaseError({error});
    } finally {
      setSignUpLoading(false);
    }
  };

  // Sign in with email/password
  const signIn = async (email, password) => {
    setSignInLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      handleFirebaseError({error});
    } finally {
      setSignInLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      await promptAsync();
    } catch (error) {
      handleFirebaseError(error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      await AsyncStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      handleFirebaseError({error});
    }
  };

  const deleteUserAccount = async (password) => {
    try {
      if (!user || !password) {
        throw new Error("User or password not provided");
      }

      // Re-authenticate user before deletion
      const credential = EmailAuthProvider.credential(
        user.email,
        password
      );
      await reauthenticateWithCredential(user, credential);

      // Delete from Firestore
      const userRef = doc(db, "users", user.uid);
      await deleteDoc(userRef);

      // Delete from Authentication
      await deleteUser(user);

    } catch (error) {
      handleFirebaseError({error});
    }
  };
  useEffect(() => {
    if (!loading) {
       SplashScreen.hideAsync();
    }
  }, [loading]);

  if (loading) {
    return null;
  }
  return (
    <AuthContext.Provider
      value={{ 
        user, 
        isAuthenticated, 
        signInWithGoogle,
        signUp,
        signIn,
        signInLoading,
        signUpLoading,
        logout,
        deleteUserAccount
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const value = useContext(AuthContext);
  if (!value) {
     handleFirebaseError({cError:"useAuth must be wrapped inside AuthContextProvider"});
  }
  return value;
};