import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { useAppState } from '../store/AppContext';
import { getTheme } from '../theme/colors';
import { t } from '../i18n';

/**
 * Playback controls row.
 * Previous chapter (72x72), Pause/Play (80x80, amber), Next chapter (72x72).
 */
export default function PlayerControls({ isPlaying, onPrevious, onTogglePlay, onNext }) {
  const { theme, language } = useAppState();
  const colors = getTheme(theme);

  return (
    <View style={styles.row}>
      <Pressable
        onPress={onPrevious}
        accessibilityRole="button"
        accessibilityLabel={t(language, 'home.previousChapter')}
        style={[styles.sideButton, { backgroundColor: colors.surfaceRaised }]}
      >
        <Text style={[styles.sideIcon, { color: colors.textPrimary }]}>{'\u23EE'}</Text>
      </Pressable>

      <Pressable
        onPress={onTogglePlay}
        accessibilityRole="button"
        accessibilityLabel={isPlaying ? t(language, 'home.pauseReading') : t(language, 'home.resumeReading')}
        style={[styles.playButton, { backgroundColor: colors.amber }]}
      >
        <Text style={styles.playIcon}>{isPlaying ? '\u23F8' : '\u25B6'}</Text>
      </Pressable>

      <Pressable
        onPress={onNext}
        accessibilityRole="button"
        accessibilityLabel={t(language, 'home.nextChapter')}
        style={[styles.sideButton, { backgroundColor: colors.surfaceRaised }]}
      >
        <Text style={[styles.sideIcon, { color: colors.textPrimary }]}>{'\u23ED'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20 },
  sideButton: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
  sideIcon: { fontSize: 26 },
  playButton: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
  playIcon: { fontSize: 32, color: '#0A0A0A' },
});
