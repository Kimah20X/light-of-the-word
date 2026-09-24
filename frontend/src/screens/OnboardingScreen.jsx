import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, SafeAreaView } from 'react-native';
import * as Speech from 'expo-speech';
import { useAppState } from '../store/AppContext';
import { getTheme, MIN_TOUCH_TARGET } from '../theme/colors';
import { t, SUPPORTED_LANGUAGES } from '../i18n';

/**
 * Onboarding — 3 screens, first launch only.
 * Screen 1: Welcome. 
 * Screen 2: TalkBack guide (skippable, never a gate).
 * Screen 3: Language select, default Hausa.
 */
export default function OnboardingScreen({ navigation }) {
  const { theme, language, setLanguage, completeOnboarding } = useAppState();
  const colors = getTheme(theme);
  const [step, setStep] = useState(0);
  const [selectedLang, setSelectedLang] = useState(language || 'en');

  useEffect(() => {
    if (step === 0) Speech.speak(t(selectedLang, 'onboarding.welcomeReadAloud'));
    if (step === 1) Speech.speak(t(selectedLang, 'onboarding.talkbackReadAloud'));
    if (step === 2) Speech.speak(t(selectedLang, 'onboarding.languageReadAloud'));
    return () => Speech.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  function finish() {
    setLanguage(selectedLang);
    completeOnboarding();
    navigation.replace('Main');
  }

  return (
    <SafeAreaView style={[styles.wrap, { backgroundColor: colors.background }]}>
      {step === 0 && (
        <View style={styles.center}>
          <Text style={[styles.title, { color: colors.amber }]}>{t(selectedLang, 'appName')}</Text>
          <Text style={[styles.tagline, { color: colors.textSecondary }]}>{t(selectedLang, 'tagline')}</Text>
          <Pressable
            onPress={() => setStep(1)}
            accessibilityRole="button"
            accessibilityLabel={t(selectedLang, 'getStarted')}
            style={[styles.primaryButton, { backgroundColor: colors.amber, minHeight: 72 }]}
          >
            <Text style={styles.primaryButtonText}>{t(selectedLang, 'getStarted')}</Text>
          </Pressable>
        </View>
      )}

      {step === 1 && (
        <View style={styles.center}>
          <Text style={[styles.heading, { color: colors.textPrimary }]}>{t(selectedLang, 'onboarding.talkbackTitle')}</Text>
          <Text style={[styles.body, { color: colors.textSecondary }]}>{t(selectedLang, 'onboarding.talkbackBody')}</Text>
          <View style={styles.rowGap}>
            <Pressable
              onPress={() => setStep(2)}
              accessibilityRole="button"
              accessibilityLabel={t(selectedLang, 'onboarding.skip')}
              style={[styles.secondaryButton, { borderColor: colors.border, minHeight: MIN_TOUCH_TARGET }]}
            >
              <Text style={{ color: colors.textSecondary }}>{t(selectedLang, 'onboarding.skip')}</Text>
            </Pressable>
            <Pressable
              onPress={() => setStep(2)}
              accessibilityRole="button"
              accessibilityLabel={t(selectedLang, 'onboarding.next')}
              style={[styles.primaryButton, { backgroundColor: colors.amber, minHeight: MIN_TOUCH_TARGET, flex: 1 }]}
            >
              <Text style={styles.primaryButtonText}>{t(selectedLang, 'onboarding.next')}</Text>
            </Pressable>
          </View>
        </View>
      )}

      {step === 2 && (
        <View style={styles.center}>
          <Text style={[styles.heading, { color: colors.textPrimary }]}>{t(selectedLang, 'onboarding.languageTitle')}</Text>
          {SUPPORTED_LANGUAGES.map((code) => (
            <Pressable
              key={code}
              onPress={() => setSelectedLang(code)}
              accessibilityRole="radio"
              accessibilityState={{ checked: selectedLang === code }}
              accessibilityLabel={t(code, `languages.${code}`)}
              style={[
                styles.radioRow,
                { borderColor: colors.border, minHeight: MIN_TOUCH_TARGET },
                selectedLang === code && { borderColor: colors.amber, backgroundColor: colors.surfaceRaised },
              ]}
            >
              <View style={[styles.radioCircle, { borderColor: colors.amber }, selectedLang === code && { backgroundColor: colors.amber }]} />
              <Text style={[styles.radioLabel, { color: colors.textPrimary }]}>{t(code, `languages.${code}`)}</Text>
            </Pressable>
          ))}
          <Pressable
            onPress={finish}
            accessibilityRole="button"
            accessibilityLabel={t(selectedLang, 'onboarding.confirm')}
            style={[styles.primaryButton, { backgroundColor: colors.amber, minHeight: MIN_TOUCH_TARGET, marginTop: 20 }]}
          >
            <Text style={styles.primaryButtonText}>{t(selectedLang, 'onboarding.confirm')}</Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  title: { fontSize: 32, fontWeight: '800', textAlign: 'center', marginBottom: 12 },
  tagline: { fontSize: 16, textAlign: 'center', marginBottom: 40 },
  heading: { fontSize: 24, fontWeight: '700', marginBottom: 16 },
  body: { fontSize: 16, lineHeight: 24, marginBottom: 32 },
  primaryButton: { borderRadius: 12, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  primaryButtonText: { color: '#0A0A0A', fontSize: 18, fontWeight: '700' },
  secondaryButton: { borderWidth: 1, borderRadius: 12, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  rowGap: { flexDirection: 'row', gap: 12 },
  radioRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, marginBottom: 12, gap: 14 },
  radioCircle: { width: 22, height: 22, borderRadius: 11, borderWidth: 2 },
  radioLabel: { fontSize: 17, fontWeight: '600' },
});
