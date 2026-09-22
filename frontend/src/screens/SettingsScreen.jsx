import React from 'react';
import { View, Text, Pressable, Switch, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import Slider from '@react-native-community/slider';
import { useAppState } from '../store/AppContext';
import { getTheme, MIN_TOUCH_TARGET } from '../theme/colors';
import { t, SUPPORTED_LANGUAGES } from '../i18n';

const APP_VERSION = '1.0.0 (Build)';

/**
 * Section 4.5 + 6: Settings screen. Language selection lives here per the
 * spec ("Language selection is available on the settings screen").
 */
export default function SettingsScreen({ navigation }) {
  const {
    theme, setTheme, language, setLanguage, speed, setSpeed,
    fontSize, setFontSize, autoPlay, setAutoPlay, isOnline, authToken,
  } = useAppState();
  const colors = getTheme(theme);

  return (
    <SafeAreaView style={[styles.wrap, { backgroundColor: colors.background }]}>
      <ScrollView>
        <Text style={[styles.title, { color: colors.textPrimary }]}>{t(language, 'settings.title')}</Text>

        <SectionLabel text={t(language, 'settings.account')} colors={colors} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${t(language, 'settings.signIn')}. ${t(language, 'settings.signInSubtitle')}`}
          style={[styles.row, { backgroundColor: colors.surface, minHeight: MIN_TOUCH_TARGET }]}
          onPress={() => { /* wire to backend/routes/auth.js login flow */ }}
        >
          <View>
            <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '600' }}>{t(language, 'settings.signIn')}</Text>
            <Text style={{ color: colors.textMuted, fontSize: 13 }}>{t(language, 'settings.signInSubtitle')}</Text>
          </View>
          <Text style={{ color: colors.textMuted }}>{'\u203A'}</Text>
        </Pressable>

        <SectionLabel text={t(language, 'settings.language')} colors={colors} />
        {SUPPORTED_LANGUAGES.map((code) => (
          <Pressable
            key={code}
            onPress={() => setLanguage(code)}
            accessibilityRole="radio"
            accessibilityState={{ checked: language === code }}
            accessibilityLabel={t(code, `languages.${code}`)}
            style={[styles.row, { backgroundColor: colors.surface, minHeight: MIN_TOUCH_TARGET }]}
          >
            <Text style={{ color: colors.textPrimary, fontSize: 16 }}>{t(code, `languages.${code}`)}</Text>
            <View style={[styles.radioCircle, { borderColor: colors.amber }, language === code && { backgroundColor: colors.amber }]} />
          </Pressable>
        ))}

        <SectionLabel text={t(language, 'settings.audioDisplay')} colors={colors} />
        <View style={[styles.sliderCard, { backgroundColor: colors.surface }]}>
          <Text style={{ color: colors.textPrimary, marginBottom: 8 }}>{t(language, 'settings.readingSpeed')}: {speed}x</Text>
          <Slider
            minimumValue={0.5} maximumValue={2.0} step={0.25} value={speed}
            onSlidingComplete={setSpeed}
            minimumTrackTintColor={colors.amber} maximumTrackTintColor={colors.surfaceRaised}
            accessibilityLabel={t(language, 'home.readingSpeed', { speed })}
          />
        </View>
        <View style={[styles.sliderCard, { backgroundColor: colors.surface }]}>
          <Text style={{ color: colors.textPrimary, marginBottom: 8 }}>{t(language, 'settings.fontSize')}</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {['small', 'medium', 'large'].map((size) => (
              <Pressable
                key={size}
                onPress={() => setFontSize(size)}
                accessibilityRole="radio"
                accessibilityState={{ checked: fontSize === size }}
                style={[
                  styles.sizeChip,
                  { borderColor: colors.border, minHeight: MIN_TOUCH_TARGET / 1.4 },
                  fontSize === size && { borderColor: colors.amber, backgroundColor: colors.surfaceRaised },
                ]}
              >
                <Text style={{ color: colors.textPrimary, fontSize: { small: 13, medium: 16, large: 20 }[size] }}>A</Text>
              </Pressable>
            ))}
          </View>
        </View>
        <ToggleRow label={t(language, 'settings.autoPlayChapters')} value={autoPlay} onChange={setAutoPlay} colors={colors} />
        <ToggleRow label={t(language, 'settings.darkMode')} value={theme === 'dark'} onChange={(v) => setTheme(v ? 'dark' : 'light')} colors={colors} />

        <SectionLabel text={t(language, 'settings.about')} colors={colors} />
        <View style={[styles.row, { backgroundColor: colors.surface }]}>
          <Text style={{ color: colors.textPrimary }}>{t(language, 'settings.version')}</Text>
          <Text style={{ color: colors.textMuted }}>{APP_VERSION}</Text>
        </View>
        <View style={[styles.row, { backgroundColor: colors.surface }]}>
          <Text style={{ color: colors.textPrimary }}>{t(language, 'settings.offlineStatus')}</Text>
          <Text style={{ color: isOnline ? colors.teal : colors.textMuted }}>{isOnline ? 'Online' : 'Offline'}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionLabel({ text, colors }) {
  return <Text style={{ color: colors.textMuted, fontSize: 12, fontWeight: '700', letterSpacing: 1, marginTop: 20, marginBottom: 8 }}>{text.toUpperCase()}</Text>;
}

function ToggleRow({ label, value, onChange, colors }) {
  return (
    <View style={[styles.row, { backgroundColor: colors.surface, minHeight: MIN_TOUCH_TARGET }]}>
      <Text style={{ color: colors.textPrimary, fontSize: 16 }}>{label}</Text>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: colors.teal }} accessibilityLabel={label} accessibilityRole="switch" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, paddingHorizontal: 16 },
  title: { fontSize: 24, fontWeight: '800', marginVertical: 16 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 12, paddingHorizontal: 16, marginBottom: 8 },
  radioCircle: { width: 20, height: 20, borderRadius: 10, borderWidth: 2 },
  sliderCard: { borderRadius: 12, padding: 16, marginBottom: 8 },
  sizeChip: { flex: 1, borderWidth: 1, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
});
