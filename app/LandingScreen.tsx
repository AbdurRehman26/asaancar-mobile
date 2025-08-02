import { useRouter } from 'expo-router';
import React, { useContext, useEffect } from 'react';
import { Dimensions, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { AuthContext } from './_layout';

const { width, height } = Dimensions.get('window');

export default function LandingScreen() {
  const router = useRouter();
  const { isLoggedIn } = useContext(AuthContext);

  // Check if user is already logged in and redirect
  useEffect(() => {
    if (isLoggedIn) {
      router.replace('/(tabs)');
    }
  }, [isLoggedIn]);

  const handleGetStarted = () => {
    router.replace('/(tabs)');
  };

  const handleLogin = () => {
    router.push('/LoginScreen');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Floating Tags */}
      <View style={styles.floatingTags}>
        <View style={styles.tag}>
          <Text style={styles.tagIcon}>👤</Text>
          <Text style={styles.tagText}>07 Seats</Text>
        </View>
        <View style={styles.tag}>
          <Text style={styles.tagIcon}>💰</Text>
          <Text style={styles.tagText}>$30 /hr</Text>
        </View>
      </View>

      {/* Car Image */}
      <View style={styles.carImageContainer}>
        <Image
          source={{ uri: 'https://picsum.photos/400/300?random=car' }}
          style={styles.carImage}
          resizeMode="contain"
        />
      </View>

      {/* Content Section */}
      <View style={styles.contentSection}>
        {/* Title */}
        <Text style={styles.title}>
          Your Ultimate{' '}
          <Text style={styles.highlightedText}>Car Rental</Text>{' '}
          Experience
        </Text>

        {/* Description */}
        <Text style={styles.description}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
        </Text>

        {/* Call to Action Buttons */}
        {isLoggedIn ? (
          <TouchableOpacity style={styles.getStartedButton} onPress={handleGetStarted}>
            <Text style={styles.buttonText}>Let's Get Started</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.getStartedButton} onPress={handleGetStarted}>
              <Text style={styles.buttonText}>Let's Get Started</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.loginLink} onPress={handleLogin}>
              <Text style={styles.loginLinkText}>Already have an account? Login</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Home Indicator */}
      <View style={styles.homeIndicator} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 20,
  },

  floatingTags: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  tag: {
    backgroundColor: '#F3E5F5',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tagIcon: {
    fontSize: 16,
    marginRight: 5,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7e246c',
  },
  carImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  carImage: {
    width: width * 0.8,
    height: height * 0.3,
    borderRadius: 10,
  },
  contentSection: {
    paddingHorizontal: 30,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000',
    marginBottom: 20,
    lineHeight: 36,
  },
  highlightedText: {
    color: '#7e246c',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  getStartedButton: {
    backgroundColor: '#7e246c',
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 30,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  buttonContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  loginLink: {
    marginTop: 15,
  },
  loginLinkText: {
    color: '#7e246c',
    fontSize: 16,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  homeIndicator: {
    width: 134,
    height: 5,
    backgroundColor: '#000',
    borderRadius: 2.5,
    alignSelf: 'center',
    marginBottom: 10,
  },
}); 