import { ThemedText } from '@/components/ThemedText';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function FavoriteScreen() {
  return (
    <View style={styles.container}>
      <ThemedText type="title">Favorites</ThemedText>
      <ThemedText>Your favorite cars will appear here.</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
}); 