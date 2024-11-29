import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/firebaseConfig';

export const useGenerateUsername = () => {
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

  return { generateUsername };
};
