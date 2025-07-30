import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentScreen, setCurrentScreen] = useState(0);

  const onboardingScreens = [
    {
      title: "Getting Started with",
      highlightedText: "Easy Rentals",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt",
      image: "https://picsum.photos/400/300?random=onboarding1",
      showSkip: true
    },
    {
      title: "Add to Favorites:",
      highlightedText: "Keep Your Dream Cars Close",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt",
      image: "https://picsum.photos/400/300?random=onboarding2",
      showSkip: true
    },
    {
      title: "Track Your Rental:",
      highlightedText: "Stay in Control of Your Journey",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt",
      image: "https://picsum.photos/400/300?random=onboarding3",
      showSkip: false
    }
  ];

  const handleNext = () => {
    if (currentScreen < onboardingScreens.length - 1) {
      setCurrentScreen(currentScreen + 1);
    } else {
      router.replace('/LandingScreen');
    }
  };

  const handleSkip = () => {
    router.replace('/LandingScreen');
  };

  const handlePrevious = () => {
    if (currentScreen > 0) {
      setCurrentScreen(currentScreen - 1);
    }
  };

  const currentData = onboardingScreens[currentScreen];

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

      {/* Skip Button */}
      {currentData.showSkip && (
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}

      {/* Phone Frame */}
      <View style={styles.phoneFrame}>
        <View style={styles.phoneScreen}>
          {/* Internal Status Bar */}
          <View style={styles.internalStatusBar}>
            <Text style={styles.internalStatusText}>9:41</Text>
            <View style={styles.internalStatusIcons}>
              <Text style={styles.internalStatusText}>📶</Text>
              <Text style={styles.internalStatusText}>📶</Text>
              <Text style={styles.internalStatusText}>🔋</Text>
            </View>
          </View>

          {/* App Content */}
          <View style={styles.appContent}>
            <Image
              source={{ uri: currentData.image }}
              style={styles.appImage}
              resizeMode="cover"
            />
          </View>
        </View>
      </View>

      {/* Content Card */}
      <View style={styles.contentCard}>
        <Text style={styles.title}>
          {currentData.title}{' '}
          <Text style={styles.highlightedText}>{currentData.highlightedText}</Text>
        </Text>
        
        <Text style={styles.description}>
          {currentData.description}
        </Text>

        {/* Navigation Controls */}
        <View style={styles.navigationControls}>
          <TouchableOpacity 
            style={[styles.navButton, currentScreen === 0 && styles.disabledButton]} 
            onPress={handlePrevious}
            disabled={currentScreen === 0}
          >
            <Text style={styles.navButtonText}>←</Text>
          </TouchableOpacity>

          {/* Pagination Dots */}
          <View style={styles.paginationDots}>
            {onboardingScreens.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === currentScreen ? styles.activeDot : styles.inactiveDot
                ]}
              />
            ))}
          </View>

          <TouchableOpacity style={styles.navButton} onPress={handleNext}>
            <Text style={styles.navButtonText}>→</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Home Indicator */}
      <View style={styles.homeIndicator} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  skipButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
  },
  skipText: {
    color: '#7e246c',
    fontSize: 16,
    fontWeight: '600',
  },
  phoneFrame: {
    alignSelf: 'center',
    marginTop: 60,
    width: width * 0.8,
    height: height * 0.4,
    backgroundColor: '#000',
    borderRadius: 25,
    padding: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  phoneScreen: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 22,
    overflow: 'hidden',
  },
  internalStatusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: 5,
    paddingBottom: 5,
    backgroundColor: '#7e246c',
  },
  internalStatusText: {
    fontSize: 10,
    color: '#fff',
  },
  internalStatusIcons: {
    flexDirection: 'row',
    gap: 1,
  },
  appContent: {
    flex: 1,
    backgroundColor: '#fff',
  },
  appImage: {
    width: '100%',
    height: '100%',
  },
  contentCard: {
    backgroundColor: '#fff',
    marginTop: 30,
    marginHorizontal: 20,
    paddingHorizontal: 30,
    paddingVertical: 40,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000',
    marginBottom: 20,
    lineHeight: 32,
  },
  highlightedText: {
    color: '#7e246c',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  navigationControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#7e246c',
    justifyContent: 'center',
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
  disabledButton: {
    backgroundColor: '#ccc',
  },
  navButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  paginationDots: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  activeDot: {
    backgroundColor: '#7e246c',
  },
  inactiveDot: {
    backgroundColor: '#ddd',
  },
  homeIndicator: {
    width: 134,
    height: 5,
    backgroundColor: '#000',
    borderRadius: 2.5,
    alignSelf: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
}); 