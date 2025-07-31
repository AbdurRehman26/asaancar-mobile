import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export default function LoginTab() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the login screen
    router.replace('/LoginScreen');
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#7e246c" />
      <Text style={styles.text}>Redirecting to login...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
}); 