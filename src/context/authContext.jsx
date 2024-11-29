import React, { createContext, useContext, useEffect, useState } from "react";
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
  reauthenticateWithCredential,
  updatePassword
} from "firebase/auth";
import { doc, setDoc, getDoc, deleteDoc, collection, query, where, getDocs, updateDoc } from "firebase/firestore";
import { auth, db } from "@/firebaseConfig";
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { handleFirebaseError } from "@/utils/firebaseErrors";
import * as SplashScreen from "expo-splash-screen";
import { registerForPushNotificationsAsync } from '@/utils/registerForPushNotificationsAsync';
import { useGenerateUsername } from "@/hooks/useGenerateUsername";
import { useUploadImage } from "@/hooks/useUploadImage";
import * as Notifications from 'expo-notifications';
import { Alert } from 'react-native';

SplashScreen.preventAutoHideAsync();
WebBrowser.maybeCompleteAuthSession();

export const AuthContext = createContext({});

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(undefined);
  const [loading, setLoading] = useState(true);
  const [signUpLoading, setSignUpLoading] = useState(false);
  const [signInLoading, setSignInLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [notificationToken, setNotificationToken] = useState(null);
  const { generateUsername } = useGenerateUsername();
  const { uploadImage } = useUploadImage();
  const [isTogglingNotification, setIsTogglingNotification] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
 const signInWithGoogle =  async (credential) => {
  setInitialLoading(true);
  setSignInLoading(true);
  
  try {
    const result = await signInWithCredential(auth, credential);
    
    // Check if user already exists in Firestore
    const userRef = doc(db, 'users', result.user.uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      // User exists, update notification token if needed
      const existingUser = userDoc.data();
      let updatedData = { ...existingUser };
      
      try {
        const notificationToken = await registerForPushNotificationsAsync();
        if (notificationToken && notificationToken !== existingUser.expoPushToken) {
          updatedData = {
            ...updatedData,
            expoPushToken: notificationToken,
            updatedAt: new Date()
          };
          await setDoc(userRef, updatedData, { merge: true });
        }
      } catch (error) {
        console.error("Error updating notification token:", error);
      }

      setUser(updatedData);
      setIsAuthenticated(true);
      await AsyncStorage.setItem('user', JSON.stringify(updatedData));
      return;
    }

    // New user - generate username and create profile
    const displayName = result.user.displayName || 'Anonymous User';
    const generatedUsername = await generateUsername(displayName);

    let notificationToken = null;
    try {
      notificationToken = await registerForPushNotificationsAsync();
    } catch (error) {
      console.error("Error getting notification token:", error);
    }

    const userData = {
      uid: result.user.uid,
      email: result.user.email || null,
      displayName: displayName,
      username: generatedUsername,
      photoURL: result.user.photoURL || null,
      provider: 'google',
      expoPushToken: notificationToken || null,
      notificationsEnabled: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await setDoc(userRef, userData);
    setUser(userData);
    setIsAuthenticated(true);
    await AsyncStorage.setItem('user', JSON.stringify(userData));
  } catch (error) {
    handleFirebaseError({error});
  } finally {
    setSignInLoading(false);
    setInitialLoading(false);
  }
 }

  // Create user profile in Firestore
  const createUserProfile = async (userId, userData) => {
    try {
      console.log("Creating user profile in Firestore", userData);
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

  // Initialize auth state
  React.useEffect(() => {
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
  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
       if (user) {
        setUser(user);
        setIsAuthenticated(!!user);
        await AsyncStorage.setItem('user', JSON.stringify(user));
      } else {
        setUser(null);
        setIsAuthenticated(false);
        await AsyncStorage.removeItem('user');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);
  React.useEffect(() => {
    if (!loading) {
       SplashScreen.hideAsync();
    }
  }, [loading]);


  // Sign up with email/password
  const signUp = async (signUpData) => {
    setInitialLoading(true);
    setSignUpLoading(true);
    
    try {
      const {email, password, username, name, profileImageUri} = signUpData;

      // Check if email already exists
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        throw new Error("Username already taken");
      }

      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Get notification token
      let notificationToken = null;
      try {
        notificationToken = await registerForPushNotificationsAsync();
      } catch (error) {
        console.error("Error getting notification token:", error);
      }
      
      // Upload profile image if provided
      let photoURL = null;
      if (profileImageUri) {
        try {
          photoURL = await uploadImage(profileImageUri, 'profile');
        } catch (error) {
          console.error("Error uploading profile image:", error);
        }
      }
      
      // Update auth profile
      await updateProfile(userCredential.user, {
        displayName: name,
        ...(photoURL && { photoURL })
      });

      // Create user data object
      const userData = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: name,
        username,
        photoURL: photoURL || null,
        provider: 'email',
        expoPushToken: notificationToken,
        notificationsEnabled: true,
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Create user profile in Firestore
      await createUserProfile(userCredential.user.uid, userData);
      
      // Update local state
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);

      return userCredential.user;
    } catch (error) {
      console.error("Signup error:", error);
      if (error.code === 'auth/admin-restricted-operation') {
        handleFirebaseError({ 
          error: { 
            code: 'auth/operation-not-allowed',
            message: 'Sign-up is currently disabled. Please try again later.'
          }
        });
      } else {
        handleFirebaseError({ error });
      }
      throw error;
    } finally {
      setSignUpLoading(false);
      setInitialLoading(false);
    }
  };
  // Sign in with email/password
  const signIn = async (email, password) => {
    setInitialLoading(true);
    setSignInLoading(true);
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await updateNotificationToken(userCredential.user.uid);
      setUser(userCredential.user);
       setIsAuthenticated(true);
       await AsyncStorage.setItem('user', JSON.stringify(userCredential.user));
      return userCredential.user;
    } catch (error) {
      handleFirebaseError({error});
    } finally {
      setSignInLoading(false);
      setInitialLoading(false);
    }
  };
  const logout = async () => {
    setInitialLoading(true);
    try {
      await signOut(auth);
      await AsyncStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      handleFirebaseError({error});
    } finally {
      setSignInLoading(false);
      setInitialLoading(false);
    }
  };
  const deleteUserAccount = async (password) => {
    setInitialLoading(true);
    
    try {
      if (!user || !password) {
        throw new Error("User or password not provided");
      }

      // Re-authenticate user before deletion
      const credential = EmailAuthProvider.credential(
        user.email,
        password
      );
      await reauthenticateWithCredential(auth.currentUser, credential); // Re-authenticate user before deletion

      // Delete from Firestore
      const userRef = doc(db, "users", user.uid);
      await deleteDoc(userRef);

      // Delete from Authentication
      await deleteUser(auth.currentUser);

      // Clear local state after successful deletion
      // setUser(null);
      // setIsAuthenticated(false);
      // await AsyncStorage.removeItem('user');

      // Clear local state
    await AsyncStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);

    } catch (error) {
      console.log({error});
      handleFirebaseError({error});
    } finally {
      setInitialLoading(false);
    }
  };
  const resetPassword = async (email) => {
    setInitialLoading(true);
    setResetPasswordLoading(true);
    
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      handleFirebaseError({error});
      throw error;
    } finally {
      setResetPasswordLoading(false);
      setInitialLoading(false);
    }
  };
  const updateUser = async (updates) => {
    setInitialLoading(true);
    
    try {
      const userRef = doc(db, 'users', user.uid);
      
      // If password update is requested, handle it separately
      if (updates.password) {
        await updatePassword(auth.currentUser, updates.password);
        delete updates.password;
      }

      // Temporarily skip image upload
    if (updates.photoURL) {
      console.log("Image upload temporarily disabled");
        delete updates.photoURL; // Remove photoURL from updates
      }


      // If photo update is requested, upload it first
      if (updates.photoURL && updates.photoURL !== user.photoURL) {
        const photoURL = await uploadProfileImage(updates.photoURL);
        updates.photoURL = photoURL;
      }

      // Update Firestore document
      const updatedData = {
        ...updates,
        updatedAt: new Date()
      };
      
      await setDoc(userRef, updatedData, { merge: true });

      // Update Firebase Auth profile if needed
      if (updates.displayName || updates.photoURL) {
        await updateProfile(auth.currentUser, {
          displayName: updates.displayName,
          photoURL: updates.photoURL
        });
      }

      // Update local state and storage
      const updatedUser = { ...user, ...updatedData };
      setUser(updatedUser);
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));

      return updatedUser;
    } catch (error) {
      handleFirebaseError({error});
      throw error;
    } finally {
      setInitialLoading(false);
    }
  };
  const reauthenticateUser = async (currentPassword) => {
    setInitialLoading(true);
    
    try {
      if (!user || !currentPassword) {
        throw new Error("User or password not provided");
      }

      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );

      await reauthenticateWithCredential(auth.currentUser, credential);
      return true;
    } catch (error) {
      handleFirebaseError({error});
      throw error;
    } finally {
      setInitialLoading(false);
    }
  };
  const updateNotificationToken = async (userId) => {
    setInitialLoading(true);
    
    try {
      const token = await registerForPushNotificationsAsync();
      if (token) {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
          notificationToken: token,
          updatedAt: new Date()
        });
        setNotificationToken(token);
      }
    } catch (error) {
      console.error('Error updating notification token:', error);
    } finally {
      setInitialLoading(false);
    }
  };
  const checkAndRequestNotificationPermission = async () => {
    try {
      // Show system permission alert
      const { status, token } = await Notifications.requestPermissionsAsync();
      if (status === 'granted') {
        return { permitted: true, token };
      }
      return { permitted: false, token: null };
    } catch (error) {
      console.log('Error checking notification permission:', error);
      return { permitted: false, token: null };
    }
  };

  const toggleNotifications = async () => {
    if (isTogglingNotification) return;
    
    setIsTogglingNotification(true);
    try {
      if (!user?.uid) return;
      const { permitted, token } = await checkAndRequestNotificationPermission();
      console.log({permitted, notificationsEnabled});
      if (!notificationsEnabled) {
        if (!permitted) {
          Alert.alert(
            'Notifications Disabled',
            'Please enable notifications in your device settings to receive updates.',
            [{ text: 'OK' }]
          );
          return;
        }
        if(user.expoPushToken !== token && !user.expoPushToken) {
          await updateNotificationToken(user.uid, token);
        }

        const updates = {
          notificationsEnabled: true,
          updatedAt: new Date()
        };
        
        await setDoc(doc(db, 'users', user.uid), updates, { merge: true });
        setNotificationsEnabled(true);
        setUser(prev => ({ ...prev, ...updates }));
        await AsyncStorage.setItem('user', JSON.stringify({ ...user, ...updates }));
      } else {
        const updates = {
          notificationsEnabled: false,
          updatedAt: new Date()
        };
        
        await setDoc(doc(db, 'users', user.uid), updates, { merge: true });
        setNotificationsEnabled(false);
        setUser(prev => ({ ...prev, ...updates }));
        await AsyncStorage.setItem('user', JSON.stringify({ ...user, ...updates }));
      }
    } catch (error) {
      console.error('Error toggling notifications:', error);
      handleFirebaseError({error});
    } finally {
      setIsTogglingNotification(false);
    }
  };
  if (loading) {
    return null;
  }
  return (
    <AuthContext.Provider
      value={{ 
        user, 
        setUser,
        isAuthenticated, 
        signInWithGoogle,
        resetPassword,
        signUp,
        signIn,
        signInLoading,
        signUpLoading,
        logout,
        deleteUserAccount,
        updateUser,
        notificationToken,
        reauthenticateUser,
        initialLoading,
        setInitialLoading,
        toggleNotifications,
        notificationsEnabled,
        isTogglingNotification
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