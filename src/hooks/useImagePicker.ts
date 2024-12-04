import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';



export const useImagePicker = () => {
  const [uri, setUri] = useState<string | null>(null);

  const pickImage = async () => {
    try {
      const result: ImagePicker.ImagePickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        setUri(result.assets[0].uri as string);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const resetImage = () => setUri(null);

  return { uri, pickImage, resetImage, setUri };
}; 