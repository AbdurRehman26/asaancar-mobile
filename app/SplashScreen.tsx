import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ANIMATION, COLORS } from '../constants/Config';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/LandingScreen' as any);
    }, ANIMATION.SPLASH_DURATION);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.fullScreenCard}>
        {/* Car Icon */}
        <View style={styles.iconContainer}>
          <Text style={styles.carIcon}>🚗</Text>
        </View>
        
        {/* App Name */}
        <Text style={styles.appName}>Car Rental</Text>
        
        {/* Home Indicator */}
        <View style={styles.homeIndicator}>
          <View style={styles.indicator} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.PRIMARY,
  },
  fullScreenCard: {
    flex: 1,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.WHITE,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  carIcon: {
    fontSize: 40,
    color: COLORS.PRIMARY,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.WHITE,
    marginBottom: 40,
  },
  homeIndicator: {
    position: 'absolute',
    bottom: 20,
    alignItems: 'center',
  },
  indicator: {
    width: 134,
    height: 5,
    backgroundColor: COLORS.WHITE,
    borderRadius: 2.5,
  },
}); 