import { db } from '@/firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
// import { sendPushNotification } from '@/utils/registerForPushNotificationsAsync';

export const NotificationService = {
  async sendNotificationToUser(userId: string, title: string, body: string, data = {}) {
    try {
      const userRef = collection(db, 'users');
      const q = query(userRef, where('uid', '==', userId));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        if (userData.notificationToken) {
        //   await sendPushNotification(userData.notificationToken, title, body, data);
        }
      }
    } catch (error) {
      console.error('Error sending notification to user:', error);
    }
  },

  async sendNotificationToAllUsers(title: string, body: string, data = {}) {
    try {
      const usersRef = collection(db, 'users');
      const querySnapshot = await getDocs(usersRef);
      
      const notifications = querySnapshot.docs
        .map(doc => doc.data())
        .filter(userData => userData.notificationToken)
        .map(userData => null
        );
      
      await Promise.all(notifications);
    } catch (error) {
      console.error('Error sending notifications to all users:', error);
    }
  }
}; 