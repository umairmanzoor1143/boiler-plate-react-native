import { handleFirebaseError } from "@/utils/firebaseErrors";

import { useContext } from "react";
import { User as FirebaseUser } from "firebase/auth";
import { AuthContextProvider,AuthContext } from "./authContext";
import { NotificationContext, NotificationProvider } from "./NotificaionContext";

interface UserData {
  uid: string;
  email: string | null;
  displayName: string;
  username: string;
  photoURL: string | null;
  provider: "google" | "email";
  expoPushToken: string | null;
  notificationsEnabled: boolean;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}
interface SignUpData {
  email: string;
  password: string;
  username: string;
  profileImageUri: string | null;
}
interface AuthContextType {
  user: UserData | null;
  isAuthenticated: boolean | undefined;
  loading: boolean;
  signUpLoading: boolean;
  signInLoading: boolean;
  initialLoading: boolean;
  notificationToken: string | null;
  isTogglingNotification: boolean;
  notificationsEnabled: boolean;
  signInWithGoogle: (credential: any) => Promise<void>;
  signUp: (signUpData: SignUpData) => Promise<FirebaseUser>;
  signIn: (email: string, password: string) => Promise<FirebaseUser | void>;
  logout: () => Promise<void>;
  deleteUserAccount: (password?: string) => Promise<void>;
  updateUser: (updates: Partial<UserData>) => Promise<UserData>;
  reauthenticateUser: (currentPassword: string) => Promise<boolean>;
  setInitialLoading: (loading: boolean) => void;
  toggleNotifications: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<UserData | null>>;
}
const useAuth = (): AuthContextType => {
  const value = useContext(AuthContext);
  if (!value) {
    handleFirebaseError({
      cError: "useAuth must be wrapped inside AuthContextProvider",
    });
  }
  return value as AuthContextType;
};
 const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
};
export  {
    useAuth,
    AuthContextProvider,
    useNotification,
    NotificationProvider
}