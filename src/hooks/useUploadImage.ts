import { useState } from 'react';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { handleFirebaseError } from '@/utils/firebaseErrors';

export const useUploadImage = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadImage = async (uri: string, folder = 'images') => {
    if (!uri) return null;
    
    setIsUploading(true);
    setProgress(0);
    
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      
      const storage = getStorage();
      const storageRef = ref(storage, `${folder}/${Date.now()}`);
      
      await uploadBytes(storageRef, blob);
      setProgress(100);
      
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
      
    } catch (error) {
      console.log({error});
      handleFirebaseError({error});
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadImage,
    isUploading,
    progress
  };
};
