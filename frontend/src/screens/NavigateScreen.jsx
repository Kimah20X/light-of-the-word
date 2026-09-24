import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, Pressable, FlatList, StyleSheet, SafeAreaView } from 'react-native';
import { useAppState } from '../store/AppContext';
import { getTheme, MIN_TOUCH_TARGET } from '../theme/colors';
import { t } from '../i18n';
import { getBooksByTestament, getBookDisplayName } from '../engine/bookLookup';
import { getChapterCount } from '../engine/bibleData';
import { fuzzyMatchBook } from '../engine/commandParser';
import VoiceButton from '../components/VoiceButton';

/**
 * Navigate screen.
 * Search bar -> Old Testament section (2-col grid) -> New Testament section
 * (2-col grid) -> tapping a book opens its chapter list.
 */
export default function NavigateScreen({ navigation, route }) {
  const { theme, language, position } = useAppState();
  const colors = getTheme(theme);
  const [query, setQuery] = useState('');
  const [openBook, setOpenBook] = useState(null);

  const oldTestament = useMemo(() => getBooksByTestament('OT'), []);
  const newTestament = useMemo(() => getBooksByTestament('NT'), []);

  function onSearchSubmit() {
    const match = fuzzyMatchBook(query);
    if (match) setOpenBook(match.book);
  }

  function onVoicePress() {
    // Reuses the same voice pipeline as Home — for brevity this screen's
    // mic re-routes to Home's parser via navigation params in a full build;
    // kept as a direct search-field affordance here since the primary voice
    // loop lives on HomeScreen (spec: voice button is static across screens).
    navigation.navigate('Home');
  }

  if (openBook) {
    return (
      <SafeAreaView style={[styles.wrap, { backgroundColor: colors.background }]}>
        <Pressable onPress={() => setOpenBook(null)} accessibilityRole="button" accessibilityLabel="Back to books">
          <Text style={{ color: colors.teal, marginBottom: 12 }}>{'\u2190'} {t(language, 'navigate.title')}</Text>
        </Pressable>
        <Text style={[styles.sectionHeader, { color: colors.textPrimary }]}>{getBookDisplayName(openBook.id, language)}</Text>
        <FlatList
          data={Array.from({ length: openBook.chapters }, (_, i) => i + 1)}
          numColumns={4}
          keyExtractor={(n) => String(n)}
          renderItem={({ item: chapterNum }) => {
            const isCurrent = position.bookId === openBook.id && position.chapter === chapterNum;
            return (
              <Pressable
                onPress={() => navigation.navigate('Home', { bookId: openBook.id, chapter: chapterNum })}
                accessibilityRole="button"
                accessibilityLabel={`${getBookDisplayName(openBook.id, language)} ${chapterNum}`}
                style={[
                  styles.chapterTile,
                  { backgroundColor: colors.surfaceRaised, minWidth: 72, minHeight: 72 },
                  isCurrent && { backgroundColor: colors.amber },
                ]}
              >
                <Text style={{ color: isCurrent ? '#0A0A0A' : colors.textPrimary, fontSize: 18, fontWeight: '700' }}>{chapterNum}</Text>
              </Pressable>
            );
          }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.wrap, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>{t(language, 'navigate.title')}</Text>
      <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={onSearchSubmit}
          placeholder={t(language, 'navigate.searchPlaceholder')}
          placeholderTextColor={colors.textMuted}
          accessibilityLabel={t(language, 'navigate.searchLabel')}
          style={[styles.searchInput, { color: colors.textPrimary }]}
        />
        <Pressable onPress={onVoicePress} accessibilityRole="button" accessibilityLabel="Voice search">
          <Text style={{ color: colors.teal, fontSize: 18 }}>{'\u{1F3A4}'}</Text>
        </Pressable>
      </View>
      <Text style={{ color: colors.textMuted, marginBottom: 16 }}>{t(language, 'navigate.hintText')}</Text>

      <FlatList
        data={[{ header: 'oldTestament', books: oldTestament }, { header: 'newTestament', books: newTestament }]}
        keyExtractor={(item) => item.header}
        renderItem={({ item }) => (
          <View style={{ marginBottom: 20 }}>
            <View style={[styles.sectionBar, { borderColor: item.header === 'oldTestament' ? colors.amber : colors.teal }]}>
              <Text style={[styles.sectionHeader, { color: colors.textPrimary }]}>{t(language, `navigate.${item.header}`)}</Text>
            </View>
            <View style={styles.grid}>
              {item.books.map((book) => (
                <Pressable
                  key={book.id}
                  onPress={() => setOpenBook(book)}
                  accessibilityRole="button"
                  accessibilityLabel={`${getBookDisplayName(book.id, language)}, ${t(language, 'navigate.chapters', { count: book.chapters })}`}
                  style={[
                    styles.bookTile,
                    { backgroundColor: colors.surfaceRaised, minHeight: MIN_TOUCH_TARGET },
                    position.bookId === book.id && { backgroundColor: colors.amber },
                  ]}
                >
                  <Text style={{ color: position.bookId === book.id ? '#0A0A0A' : colors.textPrimary, fontSize: 16, fontWeight: '600' }}>
                    {getBookDisplayName(book.id, language)}
                  </Text>
                  <Text style={{ color: position.bookId === book.id ? '#0A0A0A' : colors.textMuted, fontSize: 13 }}>
                    {t(language, 'navigate.chapters', { count: book.chapters })}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}
        ListFooterComponent={<View style={{ height: 80 }} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, paddingHorizontal: 16 },
  title: { fontSize: 24, fontWeight: '800', marginVertical: 12 },
  searchBar: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, marginBottom: 6, height: 52 },
  searchInput: { flex: 1, fontSize: 16 },
  sectionBar: { borderLeftWidth: 4, paddingLeft: 10, marginBottom: 10 },
  sectionHeader: { fontSize: 20, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  bookTile: { width: '47%', borderRadius: 12, padding: 14, gap: 4 },
  chapterTile: { alignItems: 'center', justifyContent: 'center', borderRadius: 10, margin: 5 },
});
