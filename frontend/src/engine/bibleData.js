import kjv from '../../assets/bible/kjv.json';
import { BOOKS, getBookById } from './bookLookup';

/**
 * Section 10: bibleData.js — Bible JSON loader + lookup.
 * Reads from the bundled kjv.json — the full 66-book, 31,102-verse King
 * James Version (public domain), sourced from github.com/aruljohn/Bible-kjv
 * and reshaped into { [bookId]: { [chapter]: { [verse]: text } } }. All
 * lookups are synchronous and offline — no network required for core
 * reading, matching spec section 2's offline-first requirement.
 */

export function isChapterLoaded(bookId, chapterNumber) {
  return Boolean(kjv[bookId] && kjv[bookId][String(chapterNumber)]);
}

export function getChapter(bookId, chapterNumber) {
  const book = getBookById(bookId);
  if (!book) return null;
  const chapterData = kjv[bookId] && kjv[bookId][String(chapterNumber)];
  if (!chapterData) {
    return {
      bookId,
      chapter: chapterNumber,
      loaded: false,
      verses: [],
    };
  }
  const verses = Object.keys(chapterData)
    .sort((a, b) => Number(a) - Number(b))
    .map((v) => ({ number: Number(v), text: chapterData[v] }));
  return { bookId, chapter: chapterNumber, loaded: true, verses };
}

export function getVerse(bookId, chapterNumber, verseNumber) {
  const chapter = getChapter(bookId, chapterNumber);
  if (!chapter || !chapter.loaded) return null;
  return chapter.verses.find((v) => v.number === verseNumber) || null;
}

export function getChapterCount(bookId) {
  const book = getBookById(bookId);
  return book ? book.chapters : 0;
}

export function getFirstWords(text, count = 10) {
  return text.split(/\s+/).slice(0, count).join(' ') + (text.split(/\s+/).length > count ? '\u2026' : '');
}

export function getNextReference(bookId, chapterNumber) {
  const book = getBookById(bookId);
  if (!book) return null;
  if (chapterNumber < book.chapters) {
    return { bookId, chapter: chapterNumber + 1 };
  }
  const idx = BOOKS.findIndex((b) => b.id === bookId);
  if (idx >= 0 && idx < BOOKS.length - 1) {
    return { bookId: BOOKS[idx + 1].id, chapter: 1 };
  }
  return null; // Revelation 22 reached — end of Bible
}

export function getPreviousReference(bookId, chapterNumber) {
  const book = getBookById(bookId);
  if (!book) return null;
  if (chapterNumber > 1) {
    return { bookId, chapter: chapterNumber - 1 };
  }
  const idx = BOOKS.findIndex((b) => b.id === bookId);
  if (idx > 0) {
    const prevBook = BOOKS[idx - 1];
    return { bookId: prevBook.id, chapter: prevBook.chapters };
  }
  return null; // Genesis 1 reached — start of Bible
}
