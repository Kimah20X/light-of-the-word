import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useAppState } from '../store/AppContext';
import { getTheme } from '../theme/colors';
import { t } from '../i18n';
import { getVerse } from '../engine/bibleData';
import { getBookDisplayName } from '../engine/bookLookup';
import { speakImmediate } from '../engine/ttsController';
import { API_BASE_URL } from '../engine/apiConfig';

/**
 * AI verse explainer — proxies through the backend (section 7) rather than
 * calling an AI provider directly from the client, so API keys never ship
 * inside the app bundle.
 */
export default function ExplainScreen({ route }) {
  const { bookId, chapter, verse } = route.params || {};
  const { theme, language, isOnline, authToken } = useAppState();
  const colors = getTheme(theme);
  const [status, setStatus] = useState('loading'); // loading | done | error
  const [explanation, setExplanation] = useState('');

  useEffect(() => {
    if (!isOnline) {
      setStatus('error');
      speakImmediate(t(language, 'explain.offlineNotice'), language);
      return;
    }
    const verseObj = verse ? getVerse(bookId, chapter, verse) : null;
    speakImmediate(t(language, 'explain.loading'), language);

    fetch(`${API_BASE_URL}/explain`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
      body: JSON.stringify({
        book: getBookDisplayName(bookId, 'en'),
        chapter,
        verse,
        text: verseObj ? verseObj.text : null,
        language,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Request failed');
        return res.json();
      })
      .then((data) => {
        setExplanation(data.explanation || '');
        setStatus('done');
        speakImmediate(data.explanation || '', language);
      })
      .catch(() => {
        setStatus('error');
        speakImmediate(t(language, 'explain.error'), language);
      });
  }, [bookId, chapter, verse, isOnline]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <SafeAreaView style={[styles.wrap, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>{t(language, 'explain.title')}</Text>
      <Text style={{ color: colors.amber, marginBottom: 16 }}>
        {getBookDisplayName(bookId, language)} {chapter}{verse ? `:${verse}` : ''}
      </Text>

      {status === 'loading' && (
        <View style={styles.center}>
          <ActivityIndicator color={colors.teal} size="large" />
          <Text style={{ color: colors.textSecondary, marginTop: 12 }}>{t(language, 'explain.loading')}</Text>
        </View>
      )}

      {status === 'error' && (
        <Text style={{ color: colors.error }}>{isOnline ? t(language, 'explain.error') : t(language, 'explain.offlineNotice')}</Text>
      )}

      {status === 'done' && (
        <ScrollView>
          <Text style={{ color: colors.textPrimary, fontSize: 17, lineHeight: 26 }}>{explanation}</Text>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  title: { fontSize: 22, fontWeight: '800', marginBottom: 4 },
  center: { alignItems: 'center', marginTop: 40 },
});
