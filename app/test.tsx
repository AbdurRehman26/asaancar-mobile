import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function Test() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Test Route Works!</Text>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
}); 