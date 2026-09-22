import React from 'react';
import { Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AppProvider, useAppState } from './src/store/AppContext';
import { getTheme } from './src/theme/colors';
import { t } from './src/i18n';

import OnboardingScreen from './src/screens/OnboardingScreen';
import HomeScreen from './src/screens/HomeScreen';
import NavigateScreen from './src/screens/NavigateScreen';
import BookmarksScreen from './src/screens/BookmarksScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import ExplainScreen from './src/screens/ExplainScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TAB_ICONS = { Home: '\u{1F3E0}', Navigate: '\u{1F9ED}', Bookmarks: '\u{1F516}', Settings: '\u2699\uFE0F' };

/**
 * The four main screens (Home, Navigate, Bookmarks, Settings) share the
 * persistent bottom tab bar shown in every mockup. Onboarding and the
 * Explain screen sit outside the tabs, in the root stack.
 */
function MainTabs() {
  const { theme, language } = useAppState();
  const colors = getTheme(theme);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.teal,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarLabel: t(language, `tabs.${route.name.toLowerCase()}`) !== `tabs.${route.name.toLowerCase()}`
          ? t(language, `tabs.${route.name.toLowerCase()}`)
          : route.name,
        tabBarIcon: () => <Text style={{ fontSize: 20 }}>{TAB_ICONS[route.name]}</Text>,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Navigate" component={NavigateScreen} />
      <Tab.Screen name="Bookmarks" component={BookmarksScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  const { hydrated, onboarded, theme } = useAppState();
  const colors = getTheme(theme);

  if (!hydrated) return null; // could render a splash screen here

  const navTheme = {
    ...(theme === 'dark' ? DarkTheme : DefaultTheme),
    colors: {
      ...(theme === 'dark' ? DarkTheme.colors : DefaultTheme.colors),
      background: colors.background,
      card: colors.surface,
      text: colors.textPrimary,
      border: colors.border,
      primary: colors.amber,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        initialRouteName={onboarded ? 'Main' : 'Onboarding'}
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="Explain" component={ExplainScreen} options={{ headerShown: true, title: 'Explain' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AppProvider>
      <StatusBar style="light" />
      <RootNavigator />
    </AppProvider>
  );
}
