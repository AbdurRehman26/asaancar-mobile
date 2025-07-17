import { ThemedText } from '@/components/ThemedText';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function ChatScreen() {
  return (
    <View style={styles.container}>
      <ThemedText type="title">Chat</ThemedText>
      <ThemedText>Your conversations will appear here.</ThemedText>
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