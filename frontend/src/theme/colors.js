// Section 3: Colour and Visual System — exact hex values from the spec,
// chosen to hit the documented WCAG contrast ratios. Do not "round" these
// to nearby colors; the contrast math in the spec depends on the exact
// values below.
export const darkTheme = {
  background: '#000000', // background-base
  surface: '#111111', // background-surface
  surfaceRaised: '#1A1A1A', // background-elevated
  border: '#2A2A2A',
  textPrimary: '#FFFFFF', // 21:1 on background-base
  textSecondary: '#AAAAAA', // 4.6:1 on background-base
  textMuted: '#666666',
  amber: '#BA7517', // accent-amber — 4.6:1 on black, WCAG AA for 18pt+
  amberLight: '#FAEEDA', // text on amber background
  teal: '#1D9E75', // accent-teal — voice button ONLY, 5.2:1 on black
  tealLight: '#E1F5EE',
  error: '#E24B4A',
  success: '#639922',
  focusRing: '#BA7517',
};

// Light mode is a settings toggle only (spec 4.5) — not separately
// specified beyond that, so this inverts the neutrals and keeps every
// accent identical to preserve the same WCAG relationships, since the
// spec didn't provide alternate light-mode accent values.
export const lightTheme = {
  background: '#FFFFFF',
  surface: '#F2F2F2',
  surfaceRaised: '#E8E8E8',
  border: '#D6D6D6',
  textPrimary: '#000000',
  textSecondary: '#4A4A4A',
  textMuted: '#8A8A8A',
  amber: '#BA7517',
  amberLight: '#FAEEDA',
  teal: '#1D9E75',
  tealLight: '#E1F5EE',
  error: '#E24B4A',
  success: '#639922',
  focusRing: '#BA7517',
};

// Section 3.1 Typography — base point sizes. Scaled by the Settings > Font
// Size slider via fontScale() below.
export const fontSizes = {
  verse: 22, // Verse text (reading)
  heading: 20, // Book / chapter heading
  sectionLabel: 13,
  body: 16,
  metadata: 13,
  button: 16,
  error: 16,
  appName: 20,
};

export function fontScale(fontSizeSetting) {
  switch (fontSizeSetting) {
    case 'small': return 0.85;
    case 'large': return 1.15;
    case 'extra_large': return 1.35;
    default: return 1.0; // medium
  }
}

// Section 3 / 9: minimum touch target + focus ring width, used by every
// interactive component.
export const MIN_TOUCH_TARGET = 72;
export const FOCUS_RING_WIDTH = 3;

export function getTheme(mode) {
  return mode === 'light' ? lightTheme : darkTheme;
}
