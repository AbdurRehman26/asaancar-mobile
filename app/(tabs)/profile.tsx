import { useRouter } from 'expo-router';
import React, { useContext } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, SUCCESS_MESSAGES } from '../../constants/Config';
import apiService from '../../services/api';
import { AuthContext } from '../_layout';

export default function ProfileScreen() {
  const router = useRouter();
  const { logout } = useContext(AuthContext);

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.logout();
              logout();
              Alert.alert('Success', SUCCESS_MESSAGES.LOGOUT_SUCCESS);
            } catch (error) {
              console.error('Logout failed:', error);
              // Still logout locally even if API fails
              logout();
              Alert.alert('Success', SUCCESS_MESSAGES.LOGOUT_SUCCESS);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>👤</Text>
          </View>
          <Text style={styles.userName}>John Doe</Text>
          <Text style={styles.userEmail}>john.doe@example.com</Text>
        </View>

        <View style={styles.menuSection}>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>👤</Text>
            <Text style={styles.menuText}>Edit Profile</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>❓</Text>
            <Text style={styles.menuText}>Help & Support</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: COLORS.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.LIGHT_GRAY,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.BLACK,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 30,
    paddingVertical: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.PRIMARY_LIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarText: {
    fontSize: 40,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.BLACK,
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: COLORS.GRAY,
  },
  menuSection: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.LIGHT_GRAY,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 15,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.BLACK,
  },
  menuArrow: {
    fontSize: 18,
    color: COLORS.GRAY,
  },
  logoutButton: {
    backgroundColor: COLORS.ERROR,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 'auto',
  },
  logoutButtonText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: '600',
  },
}); 