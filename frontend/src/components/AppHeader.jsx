import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { useAppState } from '../store/AppContext';
import { getTheme } from '../theme/colors';

export default function AppHeader({
  title,
  subtitle,
  showBack = false,
  rightIcon = null,
  onRightPress,
}) {
  const navigation = useNavigation();
  const { theme } = useAppState();
  const colors = getTheme(theme);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <View style={styles.left}>
        {showBack && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [
              styles.iconButton,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              name="arrow-back"
              size={26}
              color={colors.textPrimary}
            />
          </Pressable>
        )}

        <View style={styles.titleArea}>
          <Text
            style={[
              styles.title,
              { color: colors.textPrimary },
            ]}
          >
            {title}
          </Text>

          {subtitle ? (
            <Text
              style={[
                styles.subtitle,
                { color: colors.textSecondary },
              ]}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>

      {rightIcon && (
        <Pressable
          accessibilityRole="button"
          onPress={onRightPress}
          style={({ pressed }) => [
            styles.iconButton,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons
            name={rightIcon}
            size={25}
            color={colors.textPrimary}
          />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 72,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },

  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  titleArea: {
    marginLeft: 4,
  },

  title: {
    fontSize: 20,
    fontWeight: '700',
  },

  subtitle: {
    marginTop: 3,
    fontSize: 13,
  },

  iconButton: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 26,
  },

  pressed: {
    opacity: 0.65,
  },
});