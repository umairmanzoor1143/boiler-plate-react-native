import { useEffect, useRef } from "react";
import { AppState } from "react-native";
import {
  doc,
  updateDoc,
  getDoc,
  arrayUnion,
  setDoc,
  collection,
} from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { useAuth } from "@/context";

export const useActivityTracker = () => {
  const { user, setUser } = useAuth();
  const activityTimer = useRef<NodeJS.Timeout | null>(null);
  const startTime = useRef<number | null>(null);

  const getCurrentDate = () => {
    const now = new Date();
    // Set time to midnight (00:00:00)
    now.setHours(0, 0, 0, 0);

    return (
      now.toLocaleString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "Asia/Karachi",
        hour12: false,
      }) + " at 00:00:00 UTC+5"
    );
  };

  const checkAndUpdateStreak = async () => {
    if (!user?.uid) return;

    try {
      const today = getCurrentDate();
      console.log("Current date format:", today);

      // Reference to the streaks document inside user's subcollection
      const streaksRef = doc(
        collection(db, "users", user.uid, "streaks"),
        "dates"
      );

      // Get current streaks
      const streaksDoc = await getDoc(streaksRef);

      if (!streaksDoc.exists()) {
        // Create initial streak document if it doesn't exist
        await setDoc(streaksRef, {
          dates: [today],
        });
        console.log("Created new streak document with date:", today);
        return true;
      }

      const streaks = streaksDoc.data()?.dates || [];

      // Check if today's date is already recorded
      if (streaks.includes(today)) {
        console.log("Streak already recorded for today:", today);
        return false;
      }

      // Add today's date to the streaks array
      await updateDoc(streaksRef, {
        dates: arrayUnion(today),
      });

      console.log("New streak recorded for:", today);
      return true;
    } catch (error) {
      console.error("Error updating streak:", error);
      return false;
    }
  };

  const checkActivityDuration = async () => {
    if (!user?.uid || !startTime.current) return;

    try {
      const currentTime = Date.now();
      const elapsedTime = currentTime - startTime.current;
      const threeMinutesInMs = 3 * 60 * 1000; // 3 minutes in milliseconds

      console.log("Checking activity duration:", {
        elapsedTime: Math.floor(elapsedTime / 1000),
        threshold: Math.floor(threeMinutesInMs / 1000),
      });

      if (elapsedTime >= threeMinutesInMs) {
        // Update streak only if not already recorded today
        const streakUpdated = await checkAndUpdateStreak();

        if (streakUpdated) {
          // Update user's last active status
          const userRef = doc(db, "users", user.uid);
          const updates = {
            lastActiveDate: getCurrentDate(),
            isDailyGoalMet: true,
            dailyActiveTime: elapsedTime,
          };

          await updateDoc(userRef, updates);
          setUser((prev) => ({ ...prev, ...updates } as IUser));
          console.log("Goal met! Updated user and streak:", updates);
        }

        // Clear the timer after goal is met
        if (activityTimer.current) {
          clearInterval(activityTimer.current);
          activityTimer.current = null;
        }
      }
    } catch (error) {
      console.error("Error checking activity:", error);
    }
  };

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      async (nextAppState) => {
        console.log("App state changed:", nextAppState);

        if (nextAppState === "active") {
          // Check if today's streak is already recorded
          if (user?.uid) {
            const streaksRef = doc(
              collection(db, "users", user?.uid, "streaks"),
              "dates"
            );
            const streaksDoc = await getDoc(streaksRef);
            const streaks = streaksDoc.data()?.dates || [];
            const today = getCurrentDate();

            if (!streaks.includes(today)) {
              startTime.current = Date.now();

              if (activityTimer.current) {
                clearInterval(activityTimer.current);
              }

              activityTimer.current = setInterval(checkActivityDuration, 30000);
            } else {
              console.log("Already completed streak for today");
            }
          }
        } else {
          if (activityTimer.current) {
            clearInterval(activityTimer.current);
          }
          await checkActivityDuration();
        }
      }
    );

    // Initial setup
    startTime.current = Date.now();
    activityTimer.current = setInterval(checkActivityDuration, 30000);

    return () => {
      subscription.remove();
      if (activityTimer.current) {
        clearInterval(activityTimer.current);
      }
    };
  }, [user?.uid]);
};
