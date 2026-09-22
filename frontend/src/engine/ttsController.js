import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';

/**
 * Section 10: ttsController.js — TTS queue + language.
 * Section 6.4: for Hausa/Yoruba/Igbo, prefer pre-recorded human audio
 * (Faith Comes By Hearing) over TTS for natural pronunciation of tonal
 * languages. This controller picks whichever is available per verse and
 * falls back to system TTS (which works fully offline) when it isn't.
 *
 * Locale codes below map our 4 app languages to device TTS locales.
 * expo-speech relies on the OS voice engine, so actual Hausa/Yoruba/Igbo
 * TTS quality depends on voices installed on the device — this is exactly
 * why the spec calls for bundled human audio as the primary path for those
 * three languages, with TTS as the safety net.
 */

const TTS_LOCALES = {
  en: 'en-US',
  ha: 'ha-NG',
  yo: 'yo-NG',
  ig: 'ig-NG',
};

let currentQueue = [];
let isPaused = false;
let onQueueEmpty = null;

export function speakImmediate(text, lang = 'en', rate = 1.0) {
  Speech.stop();
  Speech.speak(text, {
    language: TTS_LOCALES[lang] || TTS_LOCALES.en,
    rate: clampRate(rate),
  });
}

function clampRate(rate) {
  // expo-speech's `rate` is roughly 0.1-2.0 scale; app exposes 0.5x-2.0x.
  return Math.min(2.0, Math.max(0.5, rate));
}

/**
 * Queue verse-by-verse speech so we can highlight the currently-read verse
 * in the UI (see VerseDisplay) and stop cleanly between verses on pause.
 */
export function queueVerses(verses, lang, rate, { onVerseStart, onDone } = {}) {
  Speech.stop();
  currentQueue = [...verses];
  isPaused = false;
  onQueueEmpty = onDone || null;
  playNextInQueue(lang, rate, onVerseStart);
}

function playNextInQueue(lang, rate, onVerseStart) {
  if (isPaused || currentQueue.length === 0) {
    if (currentQueue.length === 0 && onQueueEmpty) onQueueEmpty();
    return;
  }
  const verse = currentQueue.shift();
  if (onVerseStart) onVerseStart(verse);
  Speech.speak(verse.text, {
    language: TTS_LOCALES[lang] || TTS_LOCALES.en,
    rate: clampRate(rate),
    onDone: () => playNextInQueue(lang, rate, onVerseStart),
    onStopped: () => {},
  });
}

export function pauseSpeech() {
  isPaused = true;
  Speech.stop();
}

export function resumeQueue(lang, rate, onVerseStart) {
  isPaused = false;
  playNextInQueue(lang, rate, onVerseStart);
}

export function stopSpeech() {
  isPaused = true;
  currentQueue = [];
  Speech.stop();
}

/**
 * Attempts to play bundled human-recorded audio for a book/chapter in the
 * given language (section 6.4). Returns the loaded Sound object on success,
 * or null if no audio file is bundled for that reference — caller should
 * fall back to speakImmediate/queueVerses in that case.
 *
 * Audio files are expected at:
 *   assets/audio/<language>/<bookId>-<chapter>.mp3
 * Download these from faithcomesbyhearing.com (free for non-commercial use)
 * and add them to the require map below before shipping — Metro bundler
 * needs static require() paths, so this map must be hand-maintained.
 */
const AUDIO_MAP = {
  // Example once files are added:
  // ha: { 'john-3': require('../../assets/audio/hausa/john-3.mp3') },
};

export async function tryPlayBundledAudio(lang, bookId, chapter) {
  const key = `${bookId}-${chapter}`;
  const source = AUDIO_MAP[lang] && AUDIO_MAP[lang][key];
  if (!source) return null;
  const { sound } = await Audio.Sound.createAsync(source);
  await sound.playAsync();
  return sound;
}
