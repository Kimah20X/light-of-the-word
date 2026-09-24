import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

/**
 * Store/ — Context API state.
 * Single global store for: language, theme, reading position, speed,
 * bookmarks, and online/offline status. Persists to AsyncStorage so
 * offline-only users keep their data with no account (section 8 note).
 */

const AppStateContext = createContext(null);

const STORAGE_KEYS = {
  language: '@lotw/language',
  theme: '@lotw/theme',
  fontSize: '@lotw/fontSize',
  autoPlay: '@lotw/autoPlay',
  speed: '@lotw/speed',
  position: '@lotw/position',
  bookmarks: '@lotw/bookmarks',
  onboarded: '@lotw/onboarded',
  authToken: '@lotw/authToken',
};

const DEFAULTS = {
  language: 'en', // spec: English is default for first-time users
  theme: 'dark',
  fontSize: 'medium',
  autoPlay: false,
  speed: 1.0,
  position: { bookId: 'romans', chapter: 6, verse: null },
  bookmarks: [],
  onboarded: false,
  authToken: null,
  isOnline: true,
  isPlaying: false,
currentVerse: null,
};

export function AppProvider({ children }) {
  const [state, setState] = useState(DEFAULTS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const entries = await AsyncStorage.multiGet(Object.values(STORAGE_KEYS));
        const loaded = { ...DEFAULTS };
        entries.forEach(([key, value]) => {
          if (value == null) return;
          const stateKey = Object.keys(STORAGE_KEYS).find((k) => STORAGE_KEYS[k] === key);
          try {
            loaded[stateKey] = JSON.parse(value);
          } catch {
            loaded[stateKey] = value;
          }
        });
        setState((prev) => ({ ...prev, ...loaded }));
      } finally {
        setHydrated(true);
      }
    })();

    const unsubscribe = NetInfo.addEventListener((netState) => {
      setState((prev) => ({ ...prev, isOnline: Boolean(netState.isConnected) }));
    });
    return () => unsubscribe();
  }, []);

  const persist = useCallback((key, value) => {
    AsyncStorage.setItem(STORAGE_KEYS[key], JSON.stringify(value)).catch(() => {});
  }, []);

  const setLanguage = useCallback((lang) => {
    setState((prev) => ({ ...prev, language: lang }));
    persist('language', lang);
  }, [persist]);

  const setTheme = useCallback((theme) => {
    setState((prev) => ({ ...prev, theme }));
    persist('theme', theme);
  }, [persist]);

  const setFontSize = useCallback((fontSize) => {
    setState((prev) => ({ ...prev, fontSize }));
    persist('fontSize', fontSize);
  }, [persist]);

  const setAutoPlay = useCallback((autoPlay) => {
    setState((prev) => ({ ...prev, autoPlay }));
    persist('autoPlay', autoPlay);
  }, [persist]);

  const setSpeed = useCallback((speed) => {
    setState((prev) => ({ ...prev, speed }));
    persist('speed', speed);
  }, [persist]);

  const setPosition = useCallback((position) => {
    setState((prev) => ({ ...prev, position }));
    persist('position', position);
  }, [persist]);

  const addBookmark = useCallback((bookmark) => {
    setState((prev) => {
      const next = [...prev.bookmarks, { ...bookmark, id: Date.now(), savedAt: new Date().toISOString() }];
      persist('bookmarks', next);
      return { ...prev, bookmarks: next };
    });
  }, [persist]);

  const deleteBookmark = useCallback((id) => {
    setState((prev) => {
      const next = prev.bookmarks.filter((b) => b.id !== id);
      persist('bookmarks', next);
      return { ...prev, bookmarks: next };
    });
  }, [persist]);

  const completeOnboarding = useCallback(() => {
    setState((prev) => ({ ...prev, onboarded: true }));
    persist('onboarded', true);
  }, [persist]);

  const setAuthToken = useCallback((token) => {
    setState((prev) => ({ ...prev, authToken: token }));
    persist('authToken', token);
  }, [persist]);

  const setIsPlaying = useCallback((isPlaying) => {
  setState((prev) => ({
    ...prev,
    isPlaying,
  }));
}, []);

const setCurrentVerse = useCallback((currentVerse) => {
  setState((prev) => ({
    ...prev,
    currentVerse,
  }));
}, []);

  const value = useMemo(() => ({
    ...state,
    hydrated,
    setLanguage,
    setTheme,
    setFontSize,
    setAutoPlay,
    setSpeed,
    setPosition,
    addBookmark,
    deleteBookmark,
    completeOnboarding,
    setAuthToken,
    setIsPlaying,
    setCurrentVerse,
  }), [state, hydrated, setLanguage, setTheme, setFontSize, setAutoPlay, setSpeed, setPosition, addBookmark, deleteBookmark, completeOnboarding, setAuthToken, setIsPlaying, setCurrentVerse]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used within an AppProvider');
  return ctx;
}
