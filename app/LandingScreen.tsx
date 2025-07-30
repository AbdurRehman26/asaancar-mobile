import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function LandingScreen() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.replace('/(tabs)');
  };

  const handleSignIn = () => {
    router.push('/SignIn');
  };

  return (
    <View style={styles.container}>
      {/* Status Bar */}
      <View style={styles.statusBar}>
        <Text style={styles.statusText}>📶 📶 📶</Text>
        <Text style={styles.statusText}>📶</Text>
        <Text style={styles.statusText}>🔋</Text>
      </View>

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

        {/* Call to Action Button */}
        <TouchableOpacity style={styles.getStartedButton} onPress={handleGetStarted}>
          <Text style={styles.buttonText}>Let's Get Started</Text>
        </TouchableOpacity>

        {/* Sign In Link */}
        <TouchableOpacity onPress={handleSignIn}>
          <Text style={styles.signInText}>
            Already have an account? <Text style={styles.signInLink}>Sign In</Text>
          </Text>
        </TouchableOpacity>
      </View>

      {/* Home Indicator */}
      <View style={styles.homeIndicator} />
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
    paddingBottom: 40,
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
  signInText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
  },
  signInLink: {
    color: '#7e246c',
    fontWeight: '600',
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