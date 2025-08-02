import { useRouter } from 'expo-router';
import React, { useContext, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';


import { COLORS } from '../../constants/Config';
import { AuthContext } from '../_layout';

interface UserProfile {
  id?: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  avatar?: string;
}

export default function SettingsTab() {
  const router = useRouter();
  const { isLoggedIn, logout } = useContext(AuthContext);
  
  const [selectedProfile, setSelectedProfile] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      router.replace('/(tabs)/login');
      return;
    }
    loadUserData();
  }, [isLoggedIn]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const apiService = (await import('../../services/api')).default;
      const userData = await apiService.getCurrentUserData();
      setUserData(userData);
      if (userData) {
        setProfile({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          address: userData.address || '',
        });
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!profile.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!profile.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(profile.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    try {
      setSaving(true);
      const apiService = (await import('../../services/api')).default;
      await apiService.updateUserProfile('current', profile);
      
      Alert.alert('Success', 'Profile updated successfully');
      setIsEditing(false);
      setErrors({});
      await loadUserData(); // Reload user data
    } catch (error) {
      console.error('Failed to update profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleLogout = async () => {
    try {
      const apiService = (await import('../../services/api')).default;
      await apiService.logout();
      logout();
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Failed to logout:', error);
      // Still logout locally even if API fails
      logout();
      router.replace('/(tabs)');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        <Text style={styles.loadingText}>Loading settings...</Text>
      </View>
    );
  }

  if (selectedProfile) {
    // Profile view
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => setSelectedProfile(false)}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.headerSpacer} />
        </View>
        
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {isEditing ? (
            // Edit Profile Form
            <View style={styles.formContainer}>
              <Text style={styles.sectionTitle}>Edit Profile</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Name</Text>
                <TextInput
                  style={[styles.input, errors.name && styles.inputError]}
                  value={profile.name}
                  onChangeText={(value) => handleInputChange('name', value)}
                  placeholder="Enter your name"
                  placeholderTextColor="#999"
                />
                {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={[styles.input, errors.email && styles.inputError]}
                  value={profile.email}
                  onChangeText={(value) => handleInputChange('email', value)}
                  placeholder="Enter your email"
                  placeholderTextColor="#999"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone</Text>
                <TextInput
                  style={styles.input}
                  value={profile.phone}
                  onChangeText={(value) => handleInputChange('phone', value)}
                  placeholder="Enter your phone number"
                  placeholderTextColor="#999"
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Address</Text>
                <TextInput
                  style={styles.input}
                  value={profile.address}
                  onChangeText={(value) => handleInputChange('address', value)}
                  placeholder="Enter your address"
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setIsEditing(false);
                    setErrors({});
                    loadUserData(); // Reset to original data
                  }}
                  disabled={saving}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.saveButtonText}>Save</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            // Profile Display
            <View style={styles.profileContainer}>
              <Text style={styles.sectionTitle}>Profile Information</Text>
              
              <View style={styles.profileItem}>
                <Text style={styles.profileLabel}>Name</Text>
                <Text style={styles.profileValue}>{profile.name || 'Not set'}</Text>
              </View>

              <View style={styles.profileItem}>
                <Text style={styles.profileLabel}>Email</Text>
                <Text style={styles.profileValue}>{profile.email || 'Not set'}</Text>
              </View>

              <View style={styles.profileItem}>
                <Text style={styles.profileLabel}>Phone</Text>
                <Text style={styles.profileValue}>{profile.phone || 'Not set'}</Text>
              </View>

              <View style={styles.profileItem}>
                <Text style={styles.profileLabel}>Address</Text>
                <Text style={styles.profileValue}>{profile.address || 'Not set'}</Text>
              </View>

              <TouchableOpacity
                style={styles.editButton}
                onPress={() => setIsEditing(true)}
              >
                <Text style={styles.editButtonText}>Edit Profile</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Settings list view
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
                  contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Account</Text>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => setSelectedProfile(true)}
        >
          <View style={styles.menuItemContent}>
            <Text style={styles.menuItemTitle}>Profile</Text>
            <Text style={styles.menuItemSubtitle}>View and edit your profile</Text>
          </View>
          <Text style={styles.menuItemArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={handleLogout}
        >
          <View style={styles.menuItemContent}>
            <Text style={styles.menuItemTitle}>Logout</Text>
            <Text style={styles.menuItemSubtitle}>Sign out of your account</Text>
          </View>
          <Text style={styles.menuItemArrow}>→</Text>
        </TouchableOpacity>
      </ScrollView>
          </SafeAreaView>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
    paddingTop: 25,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND,
  },
  loadingText: {
    fontSize: 18,
    color: COLORS.GRAY,
    marginTop: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F6FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  backButtonText: {
    fontSize: 20,
    color: COLORS.PRIMARY,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
  },
  headerSpacer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120, // Account for tab bar
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 4,
  },
  menuItemSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  menuItemArrow: {
    fontSize: 18,
    color: '#999',
    fontWeight: '600',
  },
  profileContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  profileItem: {
    marginBottom: 16,
  },
  profileLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  profileValue: {
    fontSize: 16,
    color: '#222',
    fontWeight: '500',
  },
  editButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#222',
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: COLORS.PRIMARY,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    color: COLORS.PRIMARY,
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 