import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';

const TTS_LOCALES = {
  en: 'en-US',
  ha: 'ha-NG',
  yo: 'yo-NG',
  ig: 'ig-NG',
};

let currentQueue = [];
let isPaused = false;
let onQueueEmpty = null;

function clampRate(rate) {
  return Math.min(
    2.0,
    Math.max(0.5, rate)
  );
}

export function speakImmediate(
  text,
  lang = 'en',
  rate = 1.0
) {
  Speech.stop();

  Speech.speak(text, {
    language:
      TTS_LOCALES[lang] ||
      TTS_LOCALES.en,

    rate: clampRate(rate),
  });
}

export function queueVerses(
  verses,
  lang,
  rate,
  {
    onVerseStart,
    onDone,
  } = {}
) {
  Speech.stop();

  currentQueue = [...verses];

  isPaused = false;

  onQueueEmpty = onDone || null;

  playNextInQueue(
    lang,
    rate,
    onVerseStart
  );
}

function playNextInQueue(
  lang,
  rate,
  onVerseStart
) {
  if (
    isPaused ||
    currentQueue.length === 0
  ) {
    if (
      currentQueue.length === 0 &&
      onQueueEmpty
    ) {
      onQueueEmpty();
    }

    return;
  }

  const verse =
    currentQueue.shift();

  if (onVerseStart) {
    onVerseStart(verse);
  }

  Speech.speak(verse.text, {
    language:
      TTS_LOCALES[lang] ||
      TTS_LOCALES.en,

    rate: clampRate(rate),

    onDone: () => {
      playNextInQueue(
        lang,
        rate,
        onVerseStart
      );
    },
  });
}

export function pauseSpeech() {
  isPaused = true;
  Speech.stop();
}

export function resumeQueue(
  lang,
  rate,
  onVerseStart
) {
  isPaused = false;

  playNextInQueue(
    lang,
    rate,
    onVerseStart
  );
}

export function stopSpeech() {
  isPaused = true;
  currentQueue = [];

  Speech.stop();
}

const AUDIO_MAP = {
  // Add bundled Bible audio here later.
};

export async function tryPlayBundledAudio(
  lang,
  bookId,
  chapter
) {
  const key =
    `${bookId}-${chapter}`;

  const source =
    AUDIO_MAP[lang]?.[key];

  if (!source) {
    return null;
  }

  const { sound } =
    await Audio.Sound.createAsync(
      source
    );

  await sound.playAsync();

  return sound;
}