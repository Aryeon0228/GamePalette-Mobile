import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';

// Test 1: Basic app with just View/Text - WORKS
// Test 2: Add Zustand store
import { usePaletteStore } from './src/store/paletteStore';

export default function App() {
  const { colorCount } = usePaletteStore();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Text style={styles.text}>GamePalette Test</Text>
      <Text style={styles.text}>Color count: {colorCount}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 24,
    marginBottom: 10,
  },
});
