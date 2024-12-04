import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Image, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useImagePicker } from '@/hooks/useImagePicker';
import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import LoadingLayout from '@/components/LoadingLayout';
import {ThemedInput} from '@/components/ThemedInput';
import { useAuth } from '@/context';
import DeleteAccountModal from '@/components/Modals/DeleteAccountModal';

export default function ProfileSettings() {
  const router = useRouter();
  const { user, reauthenticateUser, updateUser } = useAuth();
  const { uri: profileImage, pickImage, setUri } = useImagePicker();
  const [isEditing, setIsEditing] = useState<{ name: boolean; password: boolean }>({
    name: false,
    password: false
  });
  const [formData, setFormData] = useState({
    displayName: "",
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [originalValues, setOriginalValues] = useState({
    displayName: "",
    photoURL: ""
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [canChangePassword, setCanChangePassword] = useState(true);

  // Update form data when user changes
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        displayName: user.displayName || ""
      }));
      setOriginalValues({
        displayName: user.displayName || "",
        photoURL: user.photoURL || ""
      });
      if (user.photoURL) {
        setUri(user.photoURL);
      }
      const providers = user.provider === "google";
      if (providers) {
        setCanChangePassword(false);
      } else {
        setCanChangePassword(true);
      }
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      router.replace('/(auth)/');
    }
  }, [user]);

  // If no user, return null to prevent rendering anything
  if (!user) return null;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const updates: Record<string, string> = {};
      
      // Handle name update
      if (isEditing.name && formData.displayName !== user.displayName) {
        updates.displayName = formData.displayName;
      }

      // Handle profile image update
      if (profileImage !== user.photoURL) {
        updates.photoURL = profileImage || "";
      }

      // Handle password update
      if (isEditing.password) {
        if (!formData.currentPassword) {
          throw new Error('Current password is required');
        }
        if (formData.newPassword !== formData.confirmPassword) {
          throw new Error('New passwords do not match');
        }
        
        // Reauthorize user before password change
        await reauthenticateUser(formData.currentPassword);
        updates.password = formData.newPassword;
      }

      if (Object.keys(updates).length > 0) {
        await updateUser(updates);
        Alert.alert('Success', 'Profile updated successfully');
        setIsEditing({ name: false, password: false });
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderPasswordFields = () => {
    if (!isEditing.password) return null;

    return (
      <>
        <View style={styles.inputContainer}>
          <ThemedText style={styles.inputLabel}>Current Password</ThemedText>
          <ThemedInput
            style={styles.inputText}
            value={formData.currentPassword}
            onChangeText={(value) => handleInputChange('currentPassword', value)}
            containerStyle={styles.input}
            secureTextEntry={!showPassword.current}
            placeholder="Current Password"
            placeholderTextColor={Colors.light.icon}
            rightIcon={
              <TouchableOpacity 
                onPress={() => setShowPassword(prev => ({ 
                  ...prev, 
                  current: !prev.current 
                }))}
              >
                <Ionicons
                  name={showPassword.current ? "eye-off" : "eye"}
                  size={24}
                  color={Colors.light.icon}
                />
              </TouchableOpacity>
            }
          />
        </View>

        <View style={styles.inputContainer}>
          <ThemedText style={styles.inputLabel}>New Password</ThemedText>
          <ThemedInput
            style={styles.inputText}
            value={formData.newPassword}
            onChangeText={(value) => handleInputChange('newPassword', value)}
            containerStyle={styles.input}
            secureTextEntry={!showPassword.new}
            placeholder="New Password"
            placeholderTextColor={Colors.light.icon}
            rightIcon={
              <TouchableOpacity 
                onPress={() => setShowPassword(prev => ({ 
                  ...prev, 
                  new: !prev.new 
                }))}
              >
                <Ionicons
                  name={showPassword.new ? "eye-off" : "eye"}
                  size={24}
                  color={Colors.light.icon}
                />
              </TouchableOpacity>
            }
          />
        </View>

        <View style={styles.inputContainer}>
          <ThemedText style={styles.inputLabel}>Confirm New Password</ThemedText>
          <ThemedInput
            style={styles.inputText}
            value={formData.confirmPassword}
            onChangeText={(value) => handleInputChange('confirmPassword', value)}
            containerStyle={styles.input}
            secureTextEntry={!showPassword.confirm}
            placeholder="Confirm New Password"
            placeholderTextColor={Colors.light.icon}
            rightIcon={
              <TouchableOpacity 
                onPress={() => setShowPassword(prev => ({ 
                  ...prev, 
                  confirm: !prev.confirm 
                }))}
              >
                <Ionicons
                  name={showPassword.confirm ? "eye-off" : "eye"}
                  size={24}
                  color={Colors.light.icon}
                />
              </TouchableOpacity>
            }
          />
        </View>
      </>
    );
  };

  // Modify the setIsEditing function to handle reset
  const toggleEditing = (field: string) => {
    setIsEditing(prev => {
      const newState = { ...prev, [field]: !prev[field as keyof typeof prev] };
      
      // If we're closing the editor, reset the values
      if (!newState[field as keyof typeof newState]) {
        if (field === 'name') {
          setFormData(prev => ({
            ...prev,
            displayName: originalValues.displayName
          }));
        } else if (field === 'password') {
          setFormData(prev => ({
            ...prev,
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          }));
        }
      }
      
      return newState;
    });
  };

  // Handle image reset
  const handleImageReset = () => {
    setUri(originalValues.photoURL);
  };
  return (
    <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
      <Stack.Screen 
        options={{
          headerTitle: "",
          headerShadowVisible: false,
          headerRight: () => (
            <TouchableOpacity 
              onPress={handleSave}
              disabled={loading || (!isEditing.name && !isEditing.password && profileImage === originalValues.photoURL)}
            >
              <ThemedText 
                style={[
                  styles.saveButton, 
                  (!isEditing.name && !isEditing.password && profileImage === originalValues.photoURL) && styles.saveButtonDisabled
                ]}
              >
                {loading ? 'Saving...' : 'Save'}
              </ThemedText>
            </TouchableOpacity>
          ),
        }} 
      />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.content}>
            <View style={styles.imagePickerWrapper}>
              <TouchableOpacity style={styles.imagePickerContainer} onPress={pickImage}>
                {profileImage ? (
                  <Image source={{ uri: profileImage }} style={styles.profileImage} />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <ThemedText style={styles.imagePlaceholderText}>Add Photo</ThemedText>
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={pickImage}
                style={styles.imagePickerOverlay}
              >
                <Ionicons name="camera" size={24} color={Colors.light.tint} />
                <ThemedText style={styles.imagePickerOverlayText}>Change</ThemedText>
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.inputHeader}>
                <ThemedText style={styles.inputLabel}>Name</ThemedText>
              </View>
              <ThemedInput
                value={formData.displayName}
                onChangeText={(value) => handleInputChange('displayName', value)}
                editable={isEditing.name}
                style={[styles.inputText, !isEditing.name && styles.disabledInput]}
                containerStyle={[styles.input, !isEditing.name && styles.disabledContainer]}
                rightIcon={
                  <TouchableOpacity onPress={() => toggleEditing('name')}>
                    <Ionicons name={isEditing.name ? "close" : "create-outline"} size={24} color={Colors.light.tint} />
                  </TouchableOpacity>
                }
              />
            </View>

            

            <View style={styles.inputContainer}>
              <ThemedText style={styles.inputLabel}>Username</ThemedText>
              <ThemedInput
                style={[styles.inputText, styles.disabledInput]}
                value={`@${user.username}`}
                containerStyle={[styles.input, styles.disabledContainer]}
                keyboardType="default"
                autoCapitalize="none"
                placeholder="Username"
                placeholderTextColor={Colors.light.icon}
                editable={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <ThemedText style={styles.inputLabel}>Email</ThemedText>
              <ThemedInput
                style={[styles.inputText, styles.disabledInput]}
                value={user.email || ""}
                containerStyle={[styles.input, styles.disabledContainer]}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="Email"
                placeholderTextColor={Colors.light.icon}
                editable={false}
              />
            </View>

            {canChangePassword && (
              <View style={styles.inputContainer}>
                <View style={styles.inputHeader}>
                  <ThemedText style={styles.inputLabel}>Change Password</ThemedText>
                  <TouchableOpacity onPress={() => toggleEditing('password')}>
                    <Ionicons 
                      name={isEditing.password ? "close" : "create-outline"} 
                      size={24} 
                      color={Colors.light.tint} 
                    />
                  </TouchableOpacity>
                </View>
                {renderPasswordFields()}
              </View>
            )}
            
            <View style={styles.deleteAccountContainer}>
              <TouchableOpacity 
                style={styles.deleteAccountButton}
                onPress={() => setDeleteModalVisible(true)}
              >
                <Ionicons name="trash-outline" size={20} color={Colors.light.background} />
                <ThemedText style={styles.deleteAccountText}>Delete Account</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <DeleteAccountModal 
        visible={deleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
      />
      </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  keyboardAvoidView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,backgroundColor: Colors.light.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  imagePickerWrapper: {
    alignItems: 'center',
    marginVertical: 20,
    width: '100%',
  },
  imagePickerContainer: {
    alignItems: 'center',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.light.inputBackground,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.light.tint,
    borderStyle: 'dashed',
  },
  imagePlaceholderText: {
    color: Colors.light.text,
    fontSize: 14,
  },
  signUpButton: {
    width: "100%",
    backgroundColor: Colors.light.tint,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  signUpButtonText: {
    color: Colors.light.background,
    fontSize: 16,
    fontWeight: "600",
  },
  signUpButtonDisabled: {
    opacity: 0.7,
  },
  skipText: {
    color: Colors.light.tint,
    marginTop: 16,
    textAlign: 'center'
  },
  inputContainer: {
    width: "100%",
    marginBottom: 16,
  },
  input: {
    backgroundColor: Colors.light.inputBackground,
    borderWidth: 0.2,
    borderColor: Colors.light.tabIconDefault,
    borderRadius: 8,
  },
  inputLabel: {
    color: Colors.light.text,
    fontSize: 14,
    marginBottom: 8,
  },
  inputText: {
    color: Colors.light.text,
    fontSize: 16,
  },

  //Image Picker Overlay
  imagePickerOverlay: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    justifyContent: "center",
  },
  imageChangeButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  imagePickerOverlayText: {
    marginLeft: 8,
    color: Colors.light.tint,
    fontSize: 14,
  },

  disabledInput: {
    color: Colors.light.tabIconDefault,
    opacity: 0.7,
  },
  disabledContainer: {
    backgroundColor: Colors.light.disabledInput
  },

  inputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  saveButton: {
    color: Colors.light.tint,
    fontSize: 16,
    fontWeight: '600',
    marginRight: 16,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },

  deleteAccountContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  deleteAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    // borderWidth: 1,
    backgroundColor: Colors.light.danger,
    // borderColor: Colors.light.danger,
  },
  deleteAccountText: {
    color: Colors.light.background,
    fontSize: 16,
    fontWeight: '500',
  },
});
