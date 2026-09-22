import en from './en.json';
import ha from './ha.json';
import yo from './yo.json';
import ig from './ig.json';

const catalogs = { en, ha, yo, ig };

// Deep-get a dot path like "home.nowPlaying" out of a JSON catalog
function getPath(obj, path) {
  return path.split('.').reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);
}

// Simple {{token}} interpolation — no external i18n library needed for 4 languages
function interpolate(str, vars) {
  if (!vars) return str;
  return str.replace(/\{\{(\w+)\}\}/g, (_, key) => (vars[key] !== undefined ? String(vars[key]) : `{{${key}}}`));
}

/**
 * t(languageCode, 'home.nowPlaying', { book: 'Romans', chapter: 6 })
 * Falls back to English if the key is missing in the requested language,
 * per section 6.1 of the spec ("English is always the fallback").
 */
export function t(lang, path, vars) {
  const catalog = catalogs[lang] || catalogs.en;
  let value = getPath(catalog, path);
  if (value === undefined) {
    value = getPath(catalogs.en, path);
  }
  if (value === undefined) {
    return path; // last resort — surfaces the missing key instead of crashing
  }
  return interpolate(value, vars);
}

export const SUPPORTED_LANGUAGES = ['ha', 'yo', 'ig', 'en'];

export default catalogs;
