import React from 'react';
import { View, Text, Pressable, FlatList, StyleSheet, SafeAreaView } from 'react-native';
import { useAppState } from '../store/AppContext';
import { getTheme } from '../theme/colors';
import { t } from '../i18n';
import { getBookDisplayName } from '../engine/bookLookup';

/**
 * Bookmarks screen.
 */
export default function BookmarksScreen({ navigation }) {
  const { theme, language, bookmarks, deleteBookmark, isOnline, authToken } = useAppState();
  const colors = getTheme(theme);

  const syncLabel = isOnline && authToken ? t(language, 'bookmarks.syncedToAccount') : t(language, 'bookmarks.savedOnDevice');

  return (
    <SafeAreaView style={[styles.wrap, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.textPrimary }]} accessibilityLabel={t(language, 'bookmarks.title')}>
        {t(language, 'bookmarks.title')}
      </Text>

      {bookmarks.length === 0 ? (
        <Text style={[styles.empty, { color: colors.textMuted }]} accessibilityLabel={t(language, 'bookmarks.empty')}>
          {t(language, 'bookmarks.empty')}
        </Text>
      ) : (
        <FlatList
          data={bookmarks}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => navigation.navigate('Home', { bookId: item.bookId, chapter: item.chapter })}
              onLongPress={() => deleteBookmark(item.id)}
              accessibilityRole="button"
              accessibilityLabel={`${getBookDisplayName(item.bookId, language)} ${item.chapter}:${item.verse}. ${item.preview}`}
              style={[styles.card, { backgroundColor: colors.surface }]}
            >
              <Text style={[styles.reference, { color: colors.amber }]}>
                {getBookDisplayName(item.bookId, language)} {item.chapter}:{item.verse}
              </Text>
              <Text style={{ color: colors.textSecondary, marginTop: 6 }}>{item.preview}</Text>
              <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 8 }}>
                {new Date(item.savedAt).toLocaleDateString()}
              </Text>
            </Pressable>
          )}
        />
      )}

      <Text style={{ color: colors.textMuted, fontSize: 12, textAlign: 'center', marginTop: 12 }}>{syncLabel}</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, paddingHorizontal: 16 },
  title: { fontSize: 24, fontWeight: '800', marginVertical: 16 },
  empty: { fontSize: 16, textAlign: 'center', marginTop: 40, paddingHorizontal: 20, lineHeight: 22 },
  card: { borderRadius: 12, padding: 16, marginBottom: 12 },
  reference: { fontSize: 17, fontWeight: '700' },
});
