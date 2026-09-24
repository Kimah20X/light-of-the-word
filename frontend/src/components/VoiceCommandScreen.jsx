import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';

import { useNavigation } from '@react-navigation/native';

import { useAppState } from '../store/AppContext';
import { getTheme } from '../theme/colors';
import { parseCommand } from '../engine/commandParser';
import {
  pauseSpeech,
  resumeQueue,
  stopSpeech,
  speakImmediate,
} from '../engine/ttsController';

const LOCALES = {
  en: 'en-US',
  ha: 'ha-NG',
  yo: 'yo-NG',
  ig: 'ig-NG',
};

export default function VoiceCommandScreen() {
  const navigation = useNavigation();

  const {
    theme,
    language,
    speed,
    position,
    addBookmark,
    deleteBookmark,
    setPosition,
  } = useAppState();

  const colors = getTheme(theme);

  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [status, setStatus] = useState('Ready');
  const [lastCommand, setLastCommand] = useState(null);

  useSpeechRecognitionEvent('start', () => {
    setListening(true);
    setStatus('Listening...');
  });

  useSpeechRecognitionEvent('end', () => {
    setListening(false);
    setStatus('Ready');
  });

  useSpeechRecognitionEvent('result', (event) => {
    const result = event.results?.[0]?.transcript || '';

    if (!result) return;

    setTranscript(result);

    if (event.isFinal) {
      handleCommand(result);
    }
  });

  useSpeechRecognitionEvent('error', (event) => {
    setListening(false);

    if (event.error === 'aborted') {
      setStatus('Ready');
      return;
    }

    setStatus('Speech recognition error');

    Alert.alert(
      'Voice command',
      event.message || 'Speech recognition could not be completed.'
    );
  });

  useEffect(() => {
    return () => {
      try {
        ExpoSpeechRecognitionModule.abort();
      } catch {
        // Recognition may already be stopped.
      }
    };
  }, []);

  async function startListening() {
    try {
      const permission =
        await ExpoSpeechRecognitionModule.requestPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Microphone permission required',
          'Allow microphone and speech recognition access in your phone settings to use voice commands.'
        );
        return;
      }

      setTranscript('');
      setLastCommand(null);

      ExpoSpeechRecognitionModule.start({
        lang: LOCALES[language] || LOCALES.en,
        interimResults: true,
        continuous: false,
      });
    } catch (error) {
      setListening(false);
      setStatus('Unable to start voice recognition');

      Alert.alert(
        'Voice command',
        error?.message || 'Unable to start speech recognition.'
      );
    }
  }

  function stopListening() {
    try {
      ExpoSpeechRecognitionModule.stop();
    } catch {
      ExpoSpeechRecognitionModule.abort();
    }
  }

  function handleCommand(rawText) {
    const command = parseCommand(rawText);

    setLastCommand(command);

    switch (command.type) {
      case 'navigate':
        setPosition({
          bookId: command.book.id,
          chapter: command.chapter,
          verse: command.verse,
        });

        navigation.navigate('Home', {
          bookId: command.book.id,
          chapter: command.chapter,
          verse: command.verse,
        });
        break;

      case 'playback':
        handlePlayback(command);
        break;

      case 'bookmark':
        handleBookmark(command);
        break;

      case 'list':
        navigation.navigate('Navigate', {
          command,
        });
        break;

      case 'explain':
        navigation.navigate('Explain');
        break;

      case 'help':
        speakImmediate(
          'You can say open Romans six, next chapter, previous chapter, pause, resume, bookmark this verse, or list all books.',
          language,
          speed
        );
        break;

      case 'unknown':
      default:
        speakImmediate(
          'I did not understand that command. Try saying open Romans six.',
          language,
          speed
        );
        break;
    }
  }

  function handlePlayback(command) {
    switch (command.action) {
      case 'pause':
        pauseSpeech();
        break;

      case 'resume':
        resumeQueue(language, speed);
        break;

      case 'stop':
        stopSpeech();
        break;

      case 'repeat':
        speakImmediate(
          'Repeat the current verse from the Bible.',
          language,
          speed
        );
        break;

      case 'speedUp':
        speakImmediate(
          'Reading speed increased.',
          language,
          speed
        );
        break;

      case 'speedDown':
        speakImmediate(
          'Reading speed decreased.',
          language,
          speed
        );
        break;

      case 'next':
      case 'previous':
        speakImmediate(
          command.action === 'next'
            ? 'Next chapter.'
            : 'Previous chapter.',
          language,
          speed
        );
        break;

      default:
        break;
    }
  }

  function handleBookmark(command) {
    if (command.action === 'add') {
      addBookmark({
        bookId: position.bookId,
        chapter: position.chapter,
        verse: position.verse,
      });

      speakImmediate(
        'This verse has been bookmarked.',
        language,
        speed
      );

      return;
    }

    if (command.action === 'delete') {
      deleteBookmark(command.number);

      speakImmediate(
        'Bookmark deleted.',
        language,
        speed
      );
    }
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background },
      ]}
    >
      <View
        style={[
          styles.header,
          { borderBottomColor: colors.border },
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close voice commands"
          onPress={() => navigation.goBack()}
          style={styles.headerButton}
        >
          <Ionicons
            name="close"
            size={28}
            color={colors.textPrimary}
          />
        </Pressable>

        <Text
          style={[
            styles.headerTitle,
            { color: colors.textPrimary },
          ]}
        >
          Voice Commands
        </Text>

        <View style={styles.headerButton} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={[
            styles.instruction,
            { color: colors.textSecondary },
          ]}
        >
          Speak a command to control Light of the Word.
        </Text>

        <View
          style={[
            styles.micArea,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              listening
                ? 'Stop listening'
                : 'Start listening'
            }
            onPress={
              listening
                ? stopListening
                : startListening
            }
            style={({ pressed }) => [
              styles.micButton,
              {
                backgroundColor: listening
                  ? colors.error
                  : colors.teal,
              },
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              name={
                listening
                  ? 'stop'
                  : 'mic-outline'
              }
              size={58}
              color="#FFFFFF"
            />
          </Pressable>

          <Text
            style={[
              styles.status,
              { color: colors.textPrimary },
            ]}
          >
            {status}
          </Text>
        </View>

        <View
          style={[
            styles.transcriptBox,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <Text
            style={[
              styles.label,
              { color: colors.textSecondary },
            ]}
          >
            You said
          </Text>

          <Text
            style={[
              styles.transcript,
              { color: colors.textPrimary },
            ]}
          >
            {transcript || '—'}
          </Text>
        </View>

        {lastCommand && (
          <View
            style={[
              styles.commandBox,
              {
                backgroundColor: colors.surfaceRaised,
                borderColor: colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.label,
                { color: colors.textSecondary },
              ]}
            >
              Command
            </Text>

            <Text
              style={[
                styles.commandText,
                { color: colors.textPrimary },
              ]}
            >
              {lastCommand.type}
            </Text>
          </View>
        )}

        <Text
          style={[
            styles.examplesTitle,
            { color: colors.textPrimary },
          ]}
        >
          Try saying
        </Text>

        <CommandExample
          text="Open Romans 6"
          colors={colors}
        />

        <CommandExample
          text="Next chapter"
          colors={colors}
        />

        <CommandExample
          text="Previous chapter"
          colors={colors}
        />

        <CommandExample
          text="Pause"
          colors={colors}
        />

        <CommandExample
          text="Resume"
          colors={colors}
        />

        <CommandExample
          text="Bookmark this verse"
          colors={colors}
        />

        <CommandExample
          text="List all books"
          colors={colors}
        />

        <CommandExample
          text="Help"
          colors={colors}
        />
      </ScrollView>
    </View>
  );
}

function CommandExample({ text, colors }) {
  return (
    <View
      style={[
        styles.example,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      <Ionicons
        name="mic-outline"
        size={20}
        color={colors.teal}
      />

      <Text
        style={[
          styles.exampleText,
          { color: colors.textPrimary },
        ]}
      >
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    minHeight: 72,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerButton: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  instruction: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 24,
  },

  micArea: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 28,
    alignItems: 'center',
  },

  micButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
  },

  pressed: {
    transform: [{ scale: 0.95 }],
    opacity: 0.85,
  },

  status: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: '600',
  },

  transcriptBox: {
    marginTop: 20,
    borderWidth: 1,
    borderRadius: 14,
    padding: 18,
  },

  commandBox: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 14,
    padding: 18,
  },

  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
  },

  transcript: {
    fontSize: 20,
    lineHeight: 30,
  },

  commandText: {
    fontSize: 17,
    fontWeight: '600',
  },

  examplesTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 28,
    marginBottom: 12,
  },

  example: {
    minHeight: 58,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },

  exampleText: {
    fontSize: 16,
    marginLeft: 12,
  },
});