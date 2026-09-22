import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppState } from '../store/AppContext';
import { getTheme } from '../theme/colors';
import { t } from '../i18n';

/**
 * Status bar — offline/online indicator + current language
 * badge. Read by TalkBack as "Offline, reading in Hausa".
 */
export default function OfflineBadge() {
  const { theme, isOnline, language } = useAppState();
  const colors = getTheme(theme);
  const languageLabel = t(language, `languages.${language}`);
  const statusText = isOnline
    ? t(language, 'home.onlineReadingIn', { language: languageLabel })
    : t(language, 'home.offlineReadingIn', { language: languageLabel });

  return (
    <View style={styles.wrap} accessibilityRole="text" accessibilityLabel={statusText}>
      <Text style={{ color: isOnline ? colors.teal : colors.textMuted }}>{isOnline ? '\u25CF' : '\u25CB'}</Text>
      <Text style={[styles.text, { color: colors.textSecondary }]}>{statusText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8 },
  text: { fontSize: 13 },
});
