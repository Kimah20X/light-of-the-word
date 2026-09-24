import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';

import { useAppState } from '../store/AppContext';
import { getTheme } from '../theme/colors';
import { parseCommand } from '../engine/commandParser';

const LOCALES = {
  en: 'en-US',
  ha: 'ha-NG',
  yo: 'yo-NG',
  ig: 'ig-NG',
};

export default function VoiceCommandScreen({ navigation }) {
  const { theme, language } = useAppState();
  const colors = getTheme(theme);

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);

  useSpeechRecognitionEvent('start', () => {
    setIsListening(true);
    setError(null);
  });

  useSpeechRecognitionEvent('end', () => {
    setIsListening(false);
  });

  useSpeechRecognitionEvent('result', (event) => {
    const text = event.results?.[0]?.transcript || '';
    setTranscript(text);
  });

  useSpeechRecognitionEvent('error', (event) => {
    setIsListening(false);
    setError(event.message || 'Voice recognition failed.');
  });

  useEffect(() => {
    return () => {
      try {
        ExpoSpeechRecognitionModule.stop();
      } catch {}
    };
  }, []);

  const startListening = async () => {
    setTranscript('');
    setError(null);

    const permission =
      await ExpoSpeechRecognitionModule.requestPermissionsAsync();

    if (!permission.granted) {
      setError('Microphone permission is required.');
      return;
    }

    ExpoSpeechRecognitionModule.start({
      lang: LOCALES[language] || LOCALES.en,
      interimResults: true,
      continuous: false,
    });
  };

  const stopListening = () => {
    ExpoSpeechRecognitionModule.stop();
  };

  const handleCommand = () => {
    if (!transcript.trim()) return;

    const result = parseCommand(transcript);

    if (result.type === 'navigate') {
      navigation.navigate('Main', {
        screen: 'Home',
        params: {
          bookId: result.book.id,
          chapter: result.chapter,
          verse: result.verse,
        },
      });
      return;
    }

    if (result.type === 'playback') {
      navigation.goBack();
      return;
    }

    if (result.type === 'bookmark') {
      navigation.goBack();
      return;
    }

    if (result.type === 'help') {
      return;
    }
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background },
      ]}
    >
      <Text style={[styles.title, { color: colors.textPrimary }]}>
        Voice Command
      </Text>

      <Text style={[styles.instruction, { color: colors.textSecondary }]}>
        Speak a command such as:
      </Text>

      <Text style={[styles.example, { color: colors.textPrimary }]}>
        "Open Romans 6"
      </Text>

      <Text style={[styles.example, { color: colors.textPrimary }]}>
        "Next chapter"
      </Text>

      <Text style={[styles.example, { color: colors.textPrimary }]}>
        "Bookmark this verse"
      </Text>

      <View style={styles.transcriptContainer}>
        {isListening ? (
          <ActivityIndicator size="large" color={colors.teal} />
        ) : null}

        <Text style={[styles.transcript, { color: colors.textPrimary }]}>
          {transcript || 'Your command will appear here.'}
        </Text>
      </View>

      {error ? (
        <Text style={[styles.error, { color: colors.error }]}>
          {error}
        </Text>
      ) : null}

      <Pressable
        onPress={isListening ? stopListening : startListening}
        accessibilityRole="button"
        accessibilityLabel={
          isListening ? 'Stop listening' : 'Start voice command'
        }
        style={[
          styles.voiceButton,
          {
            backgroundColor: colors.teal,
          },
        ]}
      >
        <Text style={[styles.voiceButtonText, { color: '#FFFFFF' }]}>
          {isListening ? 'Stop' : 'Speak'}
        </Text>
      </Pressable>

      {transcript.trim() && !isListening ? (
        <Pressable
          onPress={handleCommand}
          style={[
            styles.executeButton,
            {
              borderColor: colors.amber,
            },
          ]}
        >
          <Text style={{ color: colors.amber, fontSize: 16 }}>
            Execute command
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },

  instruction: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 12,
  },

  example: {
    fontSize: 18,
    textAlign: 'center',
    marginVertical: 4,
  },

  transcriptContainer: {
    minHeight: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 32,
    padding: 20,
  },

  transcript: {
    fontSize: 20,
    textAlign: 'center',
    lineHeight: 30,
  },

  error: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },

  voiceButton: {
    minHeight: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },

  voiceButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },

  executeButton: {
    minHeight: 60,
    borderWidth: 2,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
});