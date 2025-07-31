import { useRouter } from 'expo-router';
import React, { useContext, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ERROR_MESSAGES, SUCCESS_MESSAGES, VALIDATION } from '../constants/Config';
import apiService from '../services/api';
import { AuthContext } from './_layout';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    if (!email.trim()) {
      Alert.alert('Error', ERROR_MESSAGES.EMAIL_REQUIRED);
      return false;
    }
    if (!password.trim()) {
      Alert.alert('Error', ERROR_MESSAGES.PASSWORD_REQUIRED);
      return false;
    }
    if (!VALIDATION.EMAIL_REGEX.test(email)) {
      Alert.alert('Error', ERROR_MESSAGES.INVALID_EMAIL);
      return false;
    }
    if (password.length < VALIDATION.PASSWORD_MIN_LENGTH) {
      Alert.alert('Error', ERROR_MESSAGES.PASSWORD_TOO_SHORT);
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await apiService.login({
        email: email.trim(),
        password: password,
      });

      console.log('Login successful:', response);
      
      // Check if login was successful
      if (response.success || response.token || response.access_token || response.user) {
        // Set authentication state
        login();
        console.log('Auth state updated, navigating to car listing...');
        
        // Navigate immediately to car listing page
        router.replace('/(tabs)');
        console.log('Navigation command sent');
        
        // Show success message after navigation
        setTimeout(() => {
          Alert.alert('Success', SUCCESS_MESSAGES.LOGIN_SUCCESS);
        }, 100);
      } else {
        throw new Error('Login failed - invalid response');
      }
      
    } catch (error: any) {
      console.error('Login failed:', error);
      
      let errorMessage = ERROR_MESSAGES.NETWORK_ERROR;
      if (error.message) {
        // Handle common API error messages
        if (error.message.includes('Invalid email or password')) {
          errorMessage = ERROR_MESSAGES.INVALID_CREDENTIALS;
        } else if (error.message.includes('User not found')) {
          errorMessage = ERROR_MESSAGES.USER_NOT_FOUND;
        } else if (error.message.includes('Network')) {
          errorMessage = ERROR_MESSAGES.NETWORK_ERROR;
        } else {
          errorMessage = error.message;
        }
      }
      
      Alert.alert('Login Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = () => {
    router.push('/CreateAccount');
  };

  return (
    <View style={styles.container}>
      {/* Status Bar */}
      <View style={styles.statusBar}>
        <Text style={styles.statusText}>9:41</Text>
        <View style={styles.statusIcons}>
          <Text style={styles.statusText}>📶</Text>
          <Text style={styles.statusText}>📶</Text>
          <Text style={styles.statusText}>🔋</Text>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        {/* Title */}
        <Text style={styles.title}>Sign In</Text>
        <Text style={styles.subtitle}>
          Fill your information below or sign in with your social account.
        </Text>

        {/* Input Fields */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="example@gmail.com"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Enter your password"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Text style={styles.eyeIconText}>
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sign In Button */}
        <TouchableOpacity style={styles.signInButton} onPress={handleLogin} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.signInButtonText}>Sign In</Text>
          )}
        </TouchableOpacity>

        {/* Sign Up Link */}
        <View style={styles.signUpSection}>
          <Text style={styles.signUpText}>Don't have an account? </Text>
          <TouchableOpacity onPress={handleSignUp}>
            <Text style={styles.signUpLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Home Indicator */}
      <View style={styles.homeIndicator}>
        <View style={styles.indicator} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 5,
  },
  statusText: {
    fontSize: 12,
    color: '#000',
  },
  statusIcons: {
    flexDirection: 'row',
    gap: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  eyeIcon: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  eyeIconText: {
    fontSize: 18,
  },
  signInButton: {
    backgroundColor: '#7e246c',
    borderRadius: 8,
    paddingVertical: 16,
    marginTop: 20,
    marginBottom: 30,
  },
  signInButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  signUpSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 20,
  },
  signUpText: {
    fontSize: 16,
    color: '#666',
  },
  signUpLink: {
    fontSize: 16,
    color: '#7e246c',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  homeIndicator: {
    alignItems: 'center',
    paddingBottom: 10,
  },
  indicator: {
    width: 134,
    height: 5,
    backgroundColor: '#000',
    borderRadius: 2.5,
  },
  backButton: {
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 16,
    color: '#666',
  },
}); 