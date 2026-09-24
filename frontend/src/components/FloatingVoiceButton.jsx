import React from 'react';
import {
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { useAppState } from '../store/AppContext';
import { getTheme, MIN_TOUCH_TARGET } from '../theme/colors';

export default function VoiceFloatingButton() {
  const navigation = useNavigation();
  const { theme } = useAppState();
  const colors = getTheme(theme);

  return (
    <View pointerEvents="box-none" style={styles.wrapper}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Voice commands"
        accessibilityHint="Open voice command controls"
        onPress={() => navigation.navigate('voiceCommand')}
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: colors.teal,
            borderColor: colors.tealLight,
          },
          pressed && styles.pressed,
        ]}
      >
        <Ionicons
          name="mic-outline"
          size={30}
          color="#FFFFFF"
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    right: 20,
    bottom: 92,
    zIndex: 1000,
    elevation: 20,
  },

  button: {
    width: MIN_TOUCH_TARGET,
    height: MIN_TOUCH_TARGET,
    borderRadius: MIN_TOUCH_TARGET / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    elevation: 8,
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  pressed: {
    transform: [{ scale: 0.94 }],
    opacity: 0.85,
  },
});