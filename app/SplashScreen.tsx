import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    // Navigate to onboarding after 3 seconds
    const timer = setTimeout(() => {
      router.replace('/OnboardingScreen');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View style={styles.container}>
      {/* Full screen blue background */}
      <View style={styles.fullScreenCard}>
        {/* Car icon */}
        <View style={styles.iconContainer}>
          <Text style={styles.carIcon}>🚗</Text>
        </View>
        
        {/* App title */}
        <Text style={styles.title}>Car Rental</Text>
        
        {/* Home indicator bar */}
        <View style={styles.homeIndicator} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#7e246c',
  },
  fullScreenCard: {
    flex: 1,
    backgroundColor: '#7e246c',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  carIcon: {
    fontSize: 40,
    color: '#7e246c',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 40,
  },
  homeIndicator: {
    position: 'absolute',
    bottom: 20,
    width: 134,
    height: 5,
    backgroundColor: '#fff',
    borderRadius: 2.5,
  },
}); 