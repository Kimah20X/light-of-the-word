import React, { useEffect, useRef } from 'react';
import { Pressable, Text, StyleSheet, Animated } from 'react-native';
import { useAppState } from '../store/AppContext';
import { getTheme, MIN_TOUCH_TARGET } from '../theme/colors';

/**
 * Section 4.2: Voice command button — full width, 56px height, teal.
 * Pulses while listening. This button is intentionally rendered in the same
 * position on every screen that includes it (spec note: "the voice command
 * button is static, for easy memorization").
 */
export default function VoiceButton({ isListening, onPress, label }) {
  const { theme } = useAppState();
  const colors = getTheme(theme);
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let loop;
    if (isListening) {
      loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.06, duration: 500, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 500, useNativeDriver: true }),
        ])
      );
      loop.start();
    } else {
      pulse.setValue(1);
    }
    return () => loop && loop.stop();
  }, [isListening, pulse]);

  return (
    <Animated.View style={{ transform: [{ scale: pulse }] }}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={[
          styles.button,
          { backgroundColor: isListening ? colors.teal : colors.teal, minHeight: MIN_TOUCH_TARGET },
        ]}
      >
        <Text style={styles.icon}>{'\u{1F3A4}'}</Text>
        <Text style={[styles.label, { color: '#0A0A0A' }]}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    width: '100%',
    gap: 10,
  },
  icon: { fontSize: 20 },
  label: { fontSize: 17, fontWeight: '700' },
});
