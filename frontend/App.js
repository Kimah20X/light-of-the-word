import React from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import {
  NavigationContainer,
  DarkTheme,
  DefaultTheme,
} from '@react-navigation/native';

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { Ionicons } from '@expo/vector-icons';

import {
  AppProvider,
  useAppState,
} from './src/store/AppContext';

import { getTheme } from './src/theme/colors';
import { t } from './src/i18n';

import OnboardingScreen from './src/screens/OnboardingScreen';
import HomeScreen from './src/screens/HomeScreen';
import NavigateScreen from './src/screens/NavigateScreen';
import BookmarksScreen from './src/screens/BookmarksScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import VoiceCommandScreen from './src/screens/VoiceCommandScreen';
import VoiceFloatingButton from './src/components/FloatingVoiceButton';

const Tab = createBottomTabNavigator();

/**
 * Simple, non-emoji navigation icons.
 *
 * Active = filled icon
 * Inactive = outline icon
 */
const TAB_ICONS = {
  Home: {
    active: 'home',
    inactive: 'home-outline',
  },

  Navigate: {
    active: 'compass',
    inactive: 'compass-outline',
  },

  Bookmarks: {
    active: 'bookmark',
    inactive: 'bookmark-outline',
  },

  Settings: {
    active: 'settings',
    inactive: 'settings-outline',
  },
};


/**
 * Wrapper around the bottom tabs.
 *
 * The VoiceFloatingButton sits above the navigator,
 * meaning it remains visible while moving between:
 *
 * Home
 * Navigate
 * Bookmarks
 * Settings
 */
function MainTabs() {
  const { theme, language } = useAppState();
  const colors = getTheme(theme);

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          /*
           * We are using our own screen headers for now.
           */
          headerShown: false,

          /*
           * Bottom navigation colors
           */
          tabBarActiveTintColor: colors.teal,
          tabBarInactiveTintColor: colors.textMuted,

          /*
           * Bottom navigation container
           */
          tabBarStyle: {
            height: 72,
            paddingBottom: 8,
            paddingTop: 8,

            backgroundColor: colors.surface,
            borderTopColor: colors.border,
          },

          /*
           * Navigation labels
           */
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },

          /*
           * Translation support
           */
          tabBarLabel:
            t(
              language,
              `tabs.${route.name.toLowerCase()}`
            ) !== `tabs.${route.name.toLowerCase()}`
              ? t(
                  language,
                  `tabs.${route.name.toLowerCase()}`
                )
              : route.name,

          /*
           * Simple Ionicons instead of emoji.
           */
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={
                focused
                  ? TAB_ICONS[route.name].active
                  : TAB_ICONS[route.name].inactive
              }
              size={24}
              color={color}
            />
          ),
        })}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
        />

        <Tab.Screen
          name="Navigate"
          component={NavigateScreen}
        />

        <Tab.Screen
          name="Bookmarks"
          component={BookmarksScreen}
        />

        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
        />
      </Tab.Navigator>

      {/*
       * CONSTANT FLOATING VOICE BUTTON
       *
       * This is outside the Tab.Navigator,
       * so it stays visible when changing tabs.
       */}
      <VoiceFloatingButton />
    </View>
  );
}

const Stack = createNativeStackNavigator();

/**
 * Root navigation
 *
 * Onboarding
 *     ↓
 * Main
 *     ↓
 * ├── Home
 * ├── Navigate
 * ├── Bookmarks
 * └── Settings
 *
 * VoiceCommand is available from the floating voice button.
 */
function RootNavigator() {
  const {
    hydrated,
    onboarded,
    theme,
  } = useAppState();

  const colors = getTheme(theme);

  /*
   * Wait until AsyncStorage has loaded.
   */
  if (!hydrated) {
    return null;
  }

  /*
   * React Navigation theme
   */
  const navTheme = {
    ...(theme === 'dark'
      ? DarkTheme
      : DefaultTheme),

    colors: {
      ...(theme === 'dark'
        ? DarkTheme.colors
        : DefaultTheme.colors),

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
        initialRouteName={
          onboarded
            ? 'Main'
            : 'Onboarding'
        }
        screenOptions={{
          headerShown: false,

          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      >

        {/* First-time user screen */}
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
        />

        {/* Main application */}
        <Stack.Screen
          name="Main"
          component={MainTabs}
        />

        {/* Full voice-command interface */}
        <Stack.Screen
          name="VoiceCommand"
          component={VoiceCommandScreen}
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
}


/**
 * Application entry point
 */
export default function App() {
  return (
    <AppProvider>
      <StatusBar
        style="light"
      />

      <RootNavigator />
    </AppProvider>
  );
}