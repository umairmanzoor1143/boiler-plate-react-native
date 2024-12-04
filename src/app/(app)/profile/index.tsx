import { View, TouchableOpacity, StyleSheet, Switch, Image, useColorScheme, ScrollView } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/context';
import { ComponentProps } from 'react';

type IconProps = ComponentProps<typeof Ionicons>;

const SettingIcon = ({ name, backgroundColor }: { name: IconProps['name'], backgroundColor: string }) => (
  <View style={[styles.iconContainer, { backgroundColor }]}>
    <Ionicons name={name} size={20} color={Colors.light.background} />
  </View>
);

export default function ProfileScreen() {
  const { user, logout, toggleNotifications,isTogglingNotification, notificationsEnabled } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileContainer}>
          <View style={styles.avatarContainer}>
            {user?.photoURL ? (
              <Image source={{ uri: user.photoURL }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={50} color={Colors.light.background} />
              </View>
            )}

            <View style={styles.streakInfo}>
              <Ionicons name="flame-outline" size={24} color={Colors.light.tint} />
              <ThemedText style={styles.streakInfoText}>15</ThemedText>
            </View>
          </View>

          <View style={styles.settingsContainer}>
            <Link href="/profile/profile-settings" asChild>
              <TouchableOpacity style={styles.option}>
                <SettingIcon 
                name="person-outline" 
                backgroundColor={Colors.light.accent.link}
              />
              <View style={styles.textContainer}>
                <ThemedText style={styles.title}>Account Settings</ThemedText>
                <ThemedText style={styles.subtitle}>Change Name, Picture, Password, Delete Account</ThemedText>
              </View>
              </TouchableOpacity>
            </Link>

            <View style={styles.option}>
              <SettingIcon 
                name="notifications-outline" 
                backgroundColor={Colors.light.accent.link}
              />
              <View style={styles.textContainer}>
                <ThemedText style={styles.title}>Notifications</ThemedText>
                <ThemedText style={styles.subtitle}>Push notifications</ThemedText>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={toggleNotifications}
                trackColor={{ false: Colors.light.tabIconDefault, true: Colors.light.tint }}
                thumbColor={Colors.light.background}
                disabled={isTogglingNotification}
              />
            </View>

            <Link href="/" asChild>
              <TouchableOpacity style={styles.option}>
                <SettingIcon 
                  name="shield-outline" 
                  backgroundColor={Colors.light.accent.link}
                />
                <View style={styles.textContainer}>
                  <ThemedText style={styles.title}>Privacy Policy</ThemedText>
                  <ThemedText style={styles.subtitle}>Privacy Policy</ThemedText>
                </View>
              </TouchableOpacity>
            </Link>

            <Link href="/" asChild>
              <TouchableOpacity style={styles.option}>
                <SettingIcon 
                  name="information-circle-outline" 
                  backgroundColor={Colors.light.accent.link}
                />
                <View style={styles.textContainer}>
                  <ThemedText style={styles.title}>Terms & Conditions</ThemedText>
                  <ThemedText style={styles.subtitle}>Terms & Conditions</ThemedText>
                </View>
              </TouchableOpacity>
            </Link>

            <Link href="/" asChild>
              <TouchableOpacity style={styles.option}>
                <SettingIcon 
                  name="information-circle-outline" 
                  backgroundColor={Colors.light.accent.link}
                />
                <View style={styles.textContainer}>
                  <ThemedText style={styles.title}>About Us</ThemedText>
                  <ThemedText style={styles.subtitle}>Learn more about us</ThemedText>
                </View>
              </TouchableOpacity>
            </Link>

            <TouchableOpacity 
              style={styles.logoutButton} 
              onPress={handleLogout}
            >
              <View style={[styles.iconContainer]}>
                <Ionicons 
                  name="log-out-outline" 
                  size={20} 
                  color={Colors.light.background} 
                />
              </View>
              <ThemedText style={styles.logoutText}>Logout</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
  );
}

const styles = StyleSheet.create({
  
  scrollView: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  profileContainer: {
    flex: 1,
    padding: 20,
    paddingBottom: 40,
  },
  avatarContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.light.tint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  username: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 10,
  },
  settingsContainer: {
    flex: 1,
    gap: 20,
    marginBottom: 20,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 15,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 14,
    color: Colors.light.tabIconDefault,
    marginTop: 2,
  },
  logoutButton: {
    backgroundColor: Colors.light.danger,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    gap: 10,
    marginTop: 20,
  },
  logoutText: {
    color: Colors.light.background,
    fontSize: 16,
    fontWeight: '600',
  },
  streakInfo: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  streakInfoText: {
    fontSize: 18,
    fontWeight: '600',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    color: Colors.light.background,
  }
});
