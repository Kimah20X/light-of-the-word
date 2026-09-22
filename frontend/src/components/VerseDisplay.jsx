import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { useAppState } from '../store/AppContext';
import { getTheme, fontSizes } from '../theme/colors';

/**
 * Verse display — 22sp, current verse number highlighted amber,
 * scrollable. TalkBack reads the currently-playing verse when it gains
 * focus (handled via accessibilityLiveRegion + focus ref in HomeScreen).
 */
export default function VerseDisplay({ verses, activeVerseNumber, fontSize = 'medium' }) {
  const { theme } = useAppState();
  const colors = getTheme(theme);
  const scale = { small: 0.85, medium: 1, large: 1.25 }[fontSize] || 1;

  if (!verses || verses.length === 0) {
    return (
      <View style={styles.emptyWrap}>
        <Text style={{ color: colors.textMuted, fontSize: fontSizes.body * scale }}>
          This chapter isn't loaded in the offline dataset yet.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.wrap} accessibilityLiveRegion="polite">
      {verses.map((verse) => (
        <Text
          key={verse.number}
          style={[
            styles.verse,
            { color: colors.textPrimary, fontSize: fontSizes.heading * scale },
            verse.number === activeVerseNumber && { color: colors.amber, fontWeight: '700' },
          ]}
          accessibilityLabel={`Verse ${verse.number}. ${verse.text}`}
        >
          <Text style={{ color: colors.amber, fontWeight: '700' }}>{verse.number}  </Text>
          {verse.text}
        </Text>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, paddingHorizontal: 4 },
  verse: { marginBottom: 18, lineHeight: 30 },
  emptyWrap: { padding: 24, alignItems: 'center' },
});
