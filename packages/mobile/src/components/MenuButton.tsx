import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface MenuButtonProps {
  onPress: () => void;
}

export function MenuButton({ onPress }: MenuButtonProps) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.button}>
      <View style={styles.iconContainer}>
        <View style={styles.bar} />
        <View style={styles.bar} />
        <View style={styles.bar} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  iconContainer: {
    width: 24,
    height: 18,
    justifyContent: 'space-between',
  },
  bar: {
    width: 24,
    height: 3,
    backgroundColor: '#111827',
    borderRadius: 2,
  },
});
