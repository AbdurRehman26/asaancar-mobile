import { useRouter } from 'expo-router';
import React, { useContext, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ERROR_MESSAGES, VALIDATION } from '../constants/Config';
import apiService from '../services/api';
import { AuthContext } from './_layout';

const { width, height } = Dimensions.get('window');

export default function CreateAccount() {
  const router = useRouter();
  const { login } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert('Error', ERROR_MESSAGES.NAME_REQUIRED);
      return false;
    }
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
    if (name.length < VALIDATION.NAME_MIN_LENGTH) {
      Alert.alert('Error', ERROR_MESSAGES.NAME_TOO_SHORT);
      return false;
    }
    if (!agreeToTerms) {
      Alert.alert('Error', ERROR_MESSAGES.TERMS_REQUIRED);
      return false;
    }
    return true;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await apiService.register({
        name: name.trim(),
        email: email.trim(),
        password: password,
      });

      // Check if registration was successful
      if (response.success || response.token || response.access_token || response.user) {
        // Set authentication state
    login();
        
        // Navigate to car listing page
        router.replace('/(tabs)');
        
        // Reinitialize Pusher with new auth token
        try {
          const pusherService = (await import('../services/pusher')).default;
          // Get the token from the response
          const token = response.token || response.access_token;
          if (token) {
            await pusherService.updateAuthToken(token);
          }
        } catch (error) {
          console.error('Failed to reinitialize Pusher after registration:', error);
        }
        
        // Show success message after navigation
        setTimeout(() => {
          Alert.alert('Success', 'Account created successfully!');
        }, 100);
      } else {
        throw new Error('Registration failed - invalid response');
      }
      
    } catch (error: any) {
      console.error('Registration failed:', error);
      
      let errorMessage = ERROR_MESSAGES.NETWORK_ERROR;
      if (error.message) {
        // Handle common API error messages
        if (error.message.includes('Email already exists')) {
          errorMessage = ERROR_MESSAGES.ACCOUNT_EXISTS;
        } else if (error.message.includes('Password')) {
          errorMessage = ERROR_MESSAGES.WEAK_PASSWORD;
        } else if (error.message.includes('Network')) {
          errorMessage = ERROR_MESSAGES.NETWORK_ERROR;
        } else {
          errorMessage = error.message;
        }
      }
      
      Alert.alert('Registration Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = () => {
    router.push('/LoginScreen');
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
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>
          Fill your information below or register with your social account.
        </Text>

        {/* Input Fields */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex. John Doe"
            placeholderTextColor="#999"
          value={name}
          onChangeText={setName}
            autoCapitalize="words"
        />
        </View>

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

        {/* Terms and Conditions */}
        <View style={styles.termsSection}>
          <TouchableOpacity
            style={styles.checkbox}
            onPress={() => setAgreeToTerms(!agreeToTerms)}
          >
            <View style={[styles.checkboxInner, agreeToTerms && styles.checkboxChecked]}>
              {agreeToTerms && <Text style={styles.checkmark}>✓</Text>}
            </View>
          </TouchableOpacity>
          <View style={styles.termsText}>
            <Text style={styles.termsLabel}>Agree with </Text>
            <TouchableOpacity>
            <Text style={styles.termsLink}>Terms & Condition</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sign Up Button */}
        <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.signUpButtonText}>Sign Up</Text>
          )}
        </TouchableOpacity>

        {/* Sign In Link */}
        <View style={styles.signInSection}>
          <Text style={styles.signInText}>Already have an account? </Text>
          <TouchableOpacity onPress={handleSignIn}>
            <Text style={styles.signInLink}>Sign In</Text>
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
  termsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkbox: {
    marginRight: 12,
  },
  checkboxInner: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#7e246c',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#7e246c',
  },
  checkmark: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  termsText: {
    flexDirection: 'row',
    flex: 1,
  },
  termsLabel: {
    fontSize: 16,
    color: '#666',
  },
  termsLink: {
    fontSize: 16,
    color: '#7e246c',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  signUpButton: {
    backgroundColor: '#7e246c',
    borderRadius: 8,
    paddingVertical: 16,
    marginTop: 20,
    marginBottom: 30,
  },
  signUpButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  signInSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 20,
  },
  signInText: {
    fontSize: 16,
    color: '#666',
  },
  signInLink: {
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
    color: '#7e246c',
    fontWeight: '600',
  },
}); 