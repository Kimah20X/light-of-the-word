import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, SafeAreaView } from 'react-native';
import Slider from '@react-native-community/slider';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
import { useAppState } from '../store/AppContext';
import { getTheme, fontSizes, MIN_TOUCH_TARGET } from '../theme/colors';
import { t } from '../i18n';
import { getChapter, getChapterCount, getNextReference, getPreviousReference, getFirstWords } from '../engine/bibleData';
import { getBookDisplayName, getBookById } from '../engine/bookLookup';
import { parseCommand } from '../engine/commandParser';
import { queueVerses, pauseSpeech, resumeQueue, stopSpeech, speakImmediate } from '../engine/ttsController';
import OfflineBadge from '../components/OfflineBadge';
import PlayerControls from '../components/PlayerControls';
import VerseDisplay from '../components/VerseDisplay';
import VoiceButton from '../components/VoiceButton';

/**
 * Home / Player screen — the screen the user lands on every
 * time they open the app. DOM order below matches the spec's TalkBack focus
 * order exactly: status bar -> now playing -> verse display -> progress bar
 * -> playback controls -> voice button -> action row -> speed control.
 */
export default function HomeScreen({ navigation }) {
  const { theme, language, position, setPosition, speed, setSpeed, fontSize, addBookmark } = useAppState();
  const colors = getTheme(theme);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [activeVerseNumber, setActiveVerseNumber] = useState(null);
  const [lastAnnouncement, setLastAnnouncement] = useState(null);
  const chapterRef = useRef(null);

  const book = getBookById(position.bookId);
  const chapter = getChapter(position.bookId, position.chapter);
  chapterRef.current = chapter;
  const chapterCount = getChapterCount(position.bookId);
  const progressPercent = Math.round((position.chapter / chapterCount) * 100);

  // --- Voice recognition wiring (@react-native-voice/voice) ---
 useSpeechRecognitionEvent('result', (event) => {
  const transcript = event.results?.[0]?.transcript;

  if (transcript) {
    handleVoiceCommand(transcript);
  }

  setIsListening(false);
});

useSpeechRecognitionEvent('error', () => {
  setIsListening(false);
});

useSpeechRecognitionEvent('end', () => {
  setIsListening(false);
});
  const startListening = useCallback(async () => {
  try {
    setIsListening(true);

    speakImmediate(t(language, 'home.listening'), language);

    const locale =
      { en: 'en-US', ha: 'ha-NG', yo: 'yo-NG', ig: 'ig-NG' }[language] || 'en-US';

    await ExpoSpeechRecognitionModule.requestPermissionsAsync();

    ExpoSpeechRecognitionModule.start({
      lang: locale,
      interimResults: false,
      continuous: false,
    });
  } catch (err) {
    setIsListening(false);
  }
}, [language]);
  function announce(message) {
    setLastAnnouncement(message);
    speakImmediate(message, language);
  }

  function goToNext() {
    const next = getNextReference(position.bookId, position.chapter);
    if (next) {
      setPosition(next);
      setActiveVerseNumber(null);
    }
  }

  function goToPrevious() {
    const prev = getPreviousReference(position.bookId, position.chapter);
    if (prev) {
      setPosition(prev);
      setActiveVerseNumber(null);
    }
  }

  function togglePlay() {
    if (isPlaying) {
      pauseSpeech();
      setIsPlaying(false);
    } else {
      const currentChapter = chapterRef.current;
      if (currentChapter && currentChapter.loaded) {
        queueVerses(currentChapter.verses, language, speed, {
          onVerseStart: (v) => setActiveVerseNumber(v.number),
          onDone: () => setIsPlaying(false),
        });
        setIsPlaying(true);
      }
    }
  }

  function handleVoiceCommand(transcript) {
    const intent = parseCommand(transcript);

    switch (intent.type) {
      case 'navigate': {
        const targetChapter = intent.chapter || 1;
        if (targetChapter > intent.book.chapters) {
          announce(t(language, 'voice.chapterOutOfRange', { book: getBookDisplayName(intent.book.id, language), max: intent.book.chapters }));
          return;
        }
        setPosition({ bookId: intent.book.id, chapter: targetChapter });
        setActiveVerseNumber(intent.verse || null);
        announce(t(language, 'home.nowPlaying', { book: getBookDisplayName(intent.book.id, language), chapter: targetChapter }));
        return;
      }
      case 'playback':
        if (intent.action === 'pause') { pauseSpeech(); setIsPlaying(false); announce(t(language, 'voice.paused')); }
        if (intent.action === 'resume') {
          resumeQueue(language, speed, (v) => setActiveVerseNumber(v.number));
          setIsPlaying(true);
          announce(t(language, 'voice.resumed'));
        }
        if (intent.action === 'stop') { stopSpeech(); setIsPlaying(false); announce(t(language, 'voice.stopped')); }
        if (intent.action === 'repeat') togglePlay();
        if (intent.action === 'next') goToNext();
        if (intent.action === 'previous') goToPrevious();
        if (intent.action === 'speedUp') { const s = Math.min(2.0, speed + 0.25); setSpeed(s); announce(t(language, 'voice.speedChanged', { speed: s })); }
        if (intent.action === 'speedDown') { const s = Math.max(0.5, speed - 0.25); setSpeed(s); announce(t(language, 'voice.speedChanged', { speed: s })); }
        return;
      case 'bookmark':
        if (intent.action === 'add' && activeVerseNumber) {
          const verseObj = chapterRef.current.verses.find((v) => v.number === activeVerseNumber);
          addBookmark({ bookId: position.bookId, chapter: position.chapter, verse: activeVerseNumber, preview: getFirstWords(verseObj ? verseObj.text : '') });
          announce(t(language, 'home.bookmarked', { book: getBookDisplayName(position.bookId, language), chapter: position.chapter, verse: activeVerseNumber }));
        }
        return;
      case 'list':
        if (intent.scope === 'chapterCount') {
          announce(t(language, 'voice.chapterCountAnswer', { book: getBookDisplayName(intent.book.id, language), count: intent.book.chapters }));
        } else {
          navigation.navigate('Navigate', { filterScope: intent.scope });
        }
        return;
      case 'help':
        announce(t(language, 'voice.help'));
        return;
      case 'unknown':
      default:
        if (intent.reason === 'bookNotFound') {
          announce(t(language, 'voice.bookNotFound', { query: intent.query, suggestion: intent.suggestion || '...' }));
        } else {
          announce(t(language, 'voice.unknownCommand'));
        }
        return;
    }
  }

  return (
    <SafeAreaView style={[styles.wrap, { backgroundColor: colors.background }]}>
      <View style={styles.statusRow}>
        <OfflineBadge />
      </View>

      <Text
        style={[styles.nowPlaying, { color: colors.textSecondary }]}
        accessibilityLabel={t(language, 'home.nowPlaying', { book: getBookDisplayName(position.bookId, language), chapter: position.chapter })}
      >
        {getBookDisplayName(position.bookId, language)} {position.chapter}
      </Text>

      <VerseDisplay verses={chapter.verses} activeVerseNumber={activeVerseNumber} fontSize={fontSize} />

      <View style={styles.progressWrap} accessibilityLabel={t(language, 'home.progress', { percent: progressPercent })}>
        <View style={[styles.progressTrack, { backgroundColor: colors.surfaceRaised }]}>
          <View style={[styles.progressFill, { backgroundColor: colors.amber, width: `${progressPercent}%` }]} />
        </View>
      </View>

      <PlayerControls isPlaying={isPlaying} onPrevious={goToPrevious} onTogglePlay={togglePlay} onNext={goToNext} />

      <View style={styles.voiceWrap}>
        <VoiceButton isListening={isListening} onPress={startListening} label={t(language, 'home.tapToSpeak')} />
      </View>

      <View style={styles.actionRow}>
        <ActionButton
          icon="\u{1F516}"
          label={t(language, 'home.bookmarkThisVerse')}
          onPress={() => handleVoiceCommand('bookmark this')}
          colors={colors}
        />
        <ActionButton icon="\u{1F9ED}" label={t(language, 'home.goToABook')} onPress={() => navigation.navigate('Navigate')} colors={colors} />
        <ActionButton icon="\u2699\uFE0F" label={t(language, 'home.openSettings')} onPress={() => navigation.navigate('Settings')} colors={colors} />
      </View>

      <View style={styles.speedWrap}>
        <Text style={{ color: colors.textSecondary, marginBottom: 6 }} accessibilityLabel={t(language, 'home.readingSpeed', { speed })}>
          {t(language, 'home.readingSpeed', { speed })}
        </Text>
        <Slider
          minimumValue={0.5}
          maximumValue={2.0}
          step={0.25}
          value={speed}
          onSlidingComplete={setSpeed}
          minimumTrackTintColor={colors.amber}
          maximumTrackTintColor={colors.surfaceRaised}
          accessibilityLabel={t(language, 'home.readingSpeed', { speed })}
        />
      </View>
    </SafeAreaView>
  );
}

function ActionButton({ icon, label, onPress, colors }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[styles.actionButton, { backgroundColor: colors.surfaceRaised, minHeight: MIN_TOUCH_TARGET }]}
    >
      <Text style={styles.actionIcon}>{icon}</Text>
      <Text style={{ color: colors.textSecondary, fontSize: 12, textAlign: 'center' }} numberOfLines={2}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, paddingHorizontal: 16 },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between' },
  nowPlaying: { fontSize: fontSizes.heading, fontWeight: '700', marginBottom: 12 },
  progressWrap: { marginVertical: 12 },
  progressTrack: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: 6, borderRadius: 3 },
  voiceWrap: { marginTop: 16 },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  actionButton: { flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 12, paddingVertical: 8, gap: 4 },
  actionIcon: { fontSize: 20 },
  speedWrap: { marginTop: 16, marginBottom: 12 },
});
