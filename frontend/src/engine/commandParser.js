import { BOOKS } from './bookLookup';

/**
 * Section 5.2 + 5.3: Command parser rules and complete command table.
 *
 * The parser takes a raw transcript string (already lower-cased by the
 * caller) and returns a structured intent object:
 *   { type: 'navigate' | 'playback' | 'list' | 'explain' | 'bookmark' | 'unknown', ...payload }
 *
 * It uses lightweight regex pattern matching plus a fuzzy Levenshtein-based
 * book-name matcher, so it handles spoken variants ('Roman' for 'Romans'),
 * translated names ('Romawa'), and typed shorthand without any external NLP
 * dependency — important since this must run fully offline.
 */

// --- Fuzzy matching -------------------------------------------------------

function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[m][n];
}

// Returns { book, distance } for the closest matching book, or null if
// nothing is close enough to be a confident match.
export function fuzzyMatchBook(rawQuery) {
  const query = rawQuery.trim().toLowerCase().replace(/^the book of\s+/, '').replace(/^book of\s+/, '');
  if (!query) return null;

  let best = null;
  for (const book of BOOKS) {
    for (const variant of book.variants) {
      // Exact / substring match short-circuits — cheapest and most common case.
      if (variant === query || query.includes(variant) || variant.includes(query)) {
        return { book, distance: 0, suggestion: null };
      }
      const distance = levenshtein(query, variant);
      // Allow proportionally more edit distance for longer names.
      const threshold = Math.max(1, Math.floor(variant.length * 0.34));
      if (distance <= threshold && (!best || distance < best.distance)) {
        best = { book, distance, suggestion: book.names.en };
      }
    }
  }
  return best;
}

// --- Reference parsing ("john 3:16", "john chapter 3 verse 16") ----------

function parseReference(afterBookText) {
  // Matches "3:16", "3 : 16", "chapter 3 verse 16", "chapter 3:16", "3"
  const colonMatch = afterBookText.match(/(?:chapter\s*)?(\d+)\s*(?:[:.]|verse)\s*(\d+)/i);
  if (colonMatch) {
    return { chapter: parseInt(colonMatch[1], 10), verse: parseInt(colonMatch[2], 10) };
  }
  const chapterOnly = afterBookText.match(/(\d+)/);
  if (chapterOnly) {
    return { chapter: parseInt(chapterOnly[1], 10), verse: null };
  }
  return { chapter: null, verse: null };
}

// --- Main parse entry point -----------------------------------------------

export function parseCommand(transcript) {
  const text = transcript.trim().toLowerCase();

  // 1. Playback controls
  if (/^(pause)\b/.test(text)) return { type: 'playback', action: 'pause' };
  if (/^(resume|play|continue)\b/.test(text)) return { type: 'playback', action: 'resume' };
  if (/^(stop)\b/.test(text)) return { type: 'playback', action: 'stop' };
  if (/^(repeat)\b/.test(text)) return { type: 'playback', action: 'repeat' };
  if (/^(next chapter|next)\b/.test(text)) return { type: 'playback', action: 'next' };
  if (/^(previous chapter|previous|go back|back)\b/.test(text)) return { type: 'playback', action: 'previous' };
  if (/^(speed up|faster|read faster)\b/.test(text)) return { type: 'playback', action: 'speedUp' };
  if (/^(slow down|slower|read slower)\b/.test(text)) return { type: 'playback', action: 'speedDown' };

  // 2. Bookmark
  if (/^bookmark this( verse)?$/.test(text) || /^save this( verse)?$/.test(text)) {
    return { type: 'bookmark', action: 'add' };
  }
  const deleteBookmarkMatch = text.match(/^delete bookmark\s+(\d+)$/);
  if (deleteBookmarkMatch) {
    return { type: 'bookmark', action: 'delete', number: parseInt(deleteBookmarkMatch[1], 10) };
  }

  // 3. List commands
  if (/^list all books$/.test(text)) return { type: 'list', scope: 'all' };
  if (/^list old testament books?$/.test(text)) return { type: 'list', scope: 'OT' };
  if (/^list new testament books?$/.test(text)) return { type: 'list', scope: 'NT' };

  // 4. "How many chapters in X"
  const chapterCountMatch = text.match(/^how many chapters (?:are )?in\s+(.+)$/);
  if (chapterCountMatch) {
    const match = fuzzyMatchBook(chapterCountMatch[1]);
    if (match && match.distance === 0) {
      return { type: 'list', scope: 'chapterCount', book: match.book };
    }
    return { type: 'unknown', reason: 'bookNotFound', query: chapterCountMatch[1], suggestion: match ? match.suggestion : null };
  }

  
  // 6. Navigate — "open genesis 1:1", "go to john chapter 3", "open romans"
  const openMatch = text.match(/^(?:open|go to|read|navigate to)\s+(.+)$/);
  if (openMatch) {
    let rest = openMatch[1];
    // Try to find the longest book-name prefix by checking variants directly,
    // since book names can be multi-word ("song of solomon", "1 corinthians").
    let bestBookMatch = null;
    let bestBookMatchLength = 0;
    for (const book of BOOKS) {
      for (const variant of book.variants) {
        if (rest.startsWith(variant) && variant.length > bestBookMatchLength) {
          bestBookMatch = book;
          bestBookMatchLength = variant.length;
        }
      }
    }
    if (bestBookMatch) {
      const refText = rest.slice(bestBookMatchLength);
      const { chapter, verse } = parseReference(refText);
      return {
        type: 'navigate',
        book: bestBookMatch,
        chapter: chapter || 1,
        verse: verse || null,
      };
    }
    // No exact prefix — try fuzzy match on the whole remainder (minus trailing numbers)
    const withoutNumbers = rest.replace(/\d+.*$/, '').trim();
    const fuzzy = fuzzyMatchBook(withoutNumbers || rest);
    if (fuzzy && fuzzy.distance <= 2) {
      const refText = rest.slice(withoutNumbers.length || 0);
      const { chapter, verse } = parseReference(refText);
      return {
        type: 'navigate',
        book: fuzzy.book,
        chapter: chapter || 1,
        verse: verse || null,
        fuzzy: fuzzy.distance > 0,
      };
    }
    return { type: 'unknown', reason: 'bookNotFound', query: withoutNumbers || rest, suggestion: fuzzy ? fuzzy.suggestion : null };
  }

  // 7. Help
  if (/^help$/.test(text)) return { type: 'help' };

  // 8. "Open" is optional (spec 5.3: "Romans 6" behaves like "Open Romans 6").
  // Try the same book-prefix + fuzzy logic as the open-branch above, but
  // against the raw text directly, before giving up as unrecognised.
  {
    let bestBookMatch = null;
    let bestBookMatchLength = 0;
    for (const book of BOOKS) {
      for (const variant of book.variants) {
        if (text.startsWith(variant) && variant.length > bestBookMatchLength) {
          bestBookMatch = book;
          bestBookMatchLength = variant.length;
        }
      }
    }
    if (bestBookMatch) {
      const refText = text.slice(bestBookMatchLength);
      const { chapter, verse } = parseReference(refText);
      return { type: 'navigate', book: bestBookMatch, chapter: chapter || 1, verse: verse || null };
    }
  }

  // Nothing matched
  return { type: 'unknown', reason: 'unrecognised', query: text };
}
