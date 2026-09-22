// Section 6.3: Bible book name localisation.
// Canonical list of all 66 books with correct chapter counts (KJV), used by:
//  - the Navigate screen book grid
//  - "How many chapters in X" voice command
//  - the command parser's fuzzy book matcher
//
// `variants` are alternate spellings/names a user might say or type.
// The `ha` (Hausa) variants below come directly from section 6.3 of the spec.
// Yoruba/Igbo variants are common transliterations; PRODUCTION NOTE: have a
// native speaker (or the Bible Society of Nigeria, as the spec recommends for
// Hausa) verify every entry before shipping — these are a functional starting
// point, not a certified translation.

export const BOOKS = [
  // Old Testament (39)
  { id: 'genesis', testament: 'OT', chapters: 50, names: { en: 'Genesis', ha: 'Farawa', yo: 'Jenesisi', ig: 'Jenesis' }, variants: ['genesis', 'farawa', 'jenesisi', 'jenesis'] },
  { id: 'exodus', testament: 'OT', chapters: 40, names: { en: 'Exodus', ha: 'Fitowa', yo: 'Eksodu', ig: 'Ọpụpụ' }, variants: ['exodus', 'fitowa', 'eksodu', 'opupu'] },
  { id: 'leviticus', testament: 'OT', chapters: 27, names: { en: 'Leviticus', ha: 'Firistoci', yo: 'Lefitiku', ig: 'Levitikọs' }, variants: ['leviticus', 'firistoci', 'lefitiku'] },
  { id: 'numbers', testament: 'OT', chapters: 36, names: { en: 'Numbers', ha: 'Litafin Lissafi', yo: 'Numeri', ig: 'Ọnụọgụgụ' }, variants: ['numbers', 'litafin lissafi', 'numeri'] },
  { id: 'deuteronomy', testament: 'OT', chapters: 34, names: { en: 'Deuteronomy', ha: 'Kubawar Shari\u2019a', yo: 'Deuteronomi', ig: 'Diuterọnọmi' }, variants: ['deuteronomy', 'kubawar sharia', 'deuteronomi'] },
  { id: 'joshua', testament: 'OT', chapters: 24, names: { en: 'Joshua', ha: 'Joshuwa', yo: 'Joṣua', ig: 'Jọsua' }, variants: ['joshua', 'joshuwa', 'joshua'] },
  { id: 'judges', testament: 'OT', chapters: 21, names: { en: 'Judges', ha: 'Alkalawa', yo: 'Onidajọ', ig: 'Ndị Ikpe' }, variants: ['judges', 'alkalawa', 'onidajo'] },
  { id: 'ruth', testament: 'OT', chapters: 4, names: { en: 'Ruth', ha: 'Ruth', yo: 'Rutu', ig: 'Rut' }, variants: ['ruth', 'rutu', 'rut'] },
  { id: '1samuel', testament: 'OT', chapters: 31, names: { en: '1 Samuel', ha: '1 Sama\u2019ila', yo: '1 Samuel', ig: '1 Samuel' }, variants: ['1 samuel', 'first samuel', 'samuel one', '1 samaila'] },
  { id: '2samuel', testament: 'OT', chapters: 24, names: { en: '2 Samuel', ha: '2 Sama\u2019ila', yo: '2 Samuel', ig: '2 Samuel' }, variants: ['2 samuel', 'second samuel', 'samuel two'] },
  { id: '1kings', testament: 'OT', chapters: 22, names: { en: '1 Kings', ha: '1 Sarakuna', yo: '1 Ọba', ig: '1 Ndị Eze' }, variants: ['1 kings', 'first kings', 'kings one'] },
  { id: '2kings', testament: 'OT', chapters: 25, names: { en: '2 Kings', ha: '2 Sarakuna', yo: '2 Ọba', ig: '2 Ndị Eze' }, variants: ['2 kings', 'second kings', 'kings two'] },
  { id: '1chronicles', testament: 'OT', chapters: 29, names: { en: '1 Chronicles', ha: '1 Tarihi', yo: '1 Kronika', ig: '1 Ihe E Mere Eme' }, variants: ['1 chronicles', 'first chronicles'] },
  { id: '2chronicles', testament: 'OT', chapters: 36, names: { en: '2 Chronicles', ha: '2 Tarihi', yo: '2 Kronika', ig: '2 Ihe E Mere Eme' }, variants: ['2 chronicles', 'second chronicles'] },
  { id: 'ezra', testament: 'OT', chapters: 10, names: { en: 'Ezra', ha: 'Ezra', yo: 'Esra', ig: 'Ezra' }, variants: ['ezra', 'esra'] },
  { id: 'nehemiah', testament: 'OT', chapters: 13, names: { en: 'Nehemiah', ha: 'Nehemiya', yo: 'Nehemiah', ig: 'Nehemaia' }, variants: ['nehemiah', 'nehemiya'] },
  { id: 'esther', testament: 'OT', chapters: 10, names: { en: 'Esther', ha: 'Esther', yo: 'Esteri', ig: 'Esta' }, variants: ['esther', 'esteri', 'esta'] },
  { id: 'job', testament: 'OT', chapters: 42, names: { en: 'Job', ha: 'Ayuba', yo: 'Jobu', ig: 'Job' }, variants: ['job', 'ayuba', 'jobu'] },
  { id: 'psalms', testament: 'OT', chapters: 150, names: { en: 'Psalms', ha: 'Zabura', yo: 'Saamu', ig: 'Abụ Ọma' }, variants: ['psalms', 'psalm', 'zabura', 'saamu', 'abu oma'] },
  { id: 'proverbs', testament: 'OT', chapters: 31, names: { en: 'Proverbs', ha: 'Karin Magana', yo: 'Owe', ig: 'Ilu' }, variants: ['proverbs', 'karin magana', 'owe', 'ilu'] },
  { id: 'ecclesiastes', testament: 'OT', chapters: 12, names: { en: 'Ecclesiastes', ha: 'Mai Hadishi', yo: 'Oniwaasu', ig: 'Ekliziastis' }, variants: ['ecclesiastes', 'mai hadishi', 'oniwaasu'] },
  { id: 'songofsolomon', testament: 'OT', chapters: 8, names: { en: 'Song of Solomon', ha: 'Waƙar Waƙoƙi', yo: 'Orin Solomoni', ig: 'Abụ Ọma Solomọn' }, variants: ['song of solomon', 'song of songs', 'wakar wakoki'] },
  { id: 'isaiah', testament: 'OT', chapters: 66, names: { en: 'Isaiah', ha: 'Ishaya', yo: 'Isaiah', ig: 'Aịzaya' }, variants: ['isaiah', 'ishaya'] },
  { id: 'jeremiah', testament: 'OT', chapters: 52, names: { en: 'Jeremiah', ha: 'Irmiya', yo: 'Jeremiah', ig: 'Jeremaia' }, variants: ['jeremiah', 'irmiya'] },
  { id: 'lamentations', testament: 'OT', chapters: 5, names: { en: 'Lamentations', ha: 'Makoki', yo: 'Ẹkun Jeremiah', ig: 'Abụ Akwa' }, variants: ['lamentations', 'makoki'] },
  { id: 'ezekiel', testament: 'OT', chapters: 48, names: { en: 'Ezekiel', ha: 'Ezekiel', yo: 'Esekieli', ig: 'Ezikiel' }, variants: ['ezekiel', 'esekieli'] },
  { id: 'daniel', testament: 'OT', chapters: 12, names: { en: 'Daniel', ha: 'Daniel', yo: 'Daniẹli', ig: 'Daniel' }, variants: ['daniel', 'danieli'] },
  { id: 'hosea', testament: 'OT', chapters: 14, names: { en: 'Hosea', ha: 'Hosiya', yo: 'Hosea', ig: 'Hosia' }, variants: ['hosea', 'hosiya'] },
  { id: 'joel', testament: 'OT', chapters: 3, names: { en: 'Joel', ha: 'Yowel', yo: 'Joeli', ig: 'Joel' }, variants: ['joel', 'yowel'] },
  { id: 'amos', testament: 'OT', chapters: 9, names: { en: 'Amos', ha: 'Amos', yo: 'Amosi', ig: 'Emọs' }, variants: ['amos', 'amosi'] },
  { id: 'obadiah', testament: 'OT', chapters: 1, names: { en: 'Obadiah', ha: 'Obadiya', yo: 'Obadiah', ig: 'Ọbadaya' }, variants: ['obadiah', 'obadiya'] },
  { id: 'jonah', testament: 'OT', chapters: 4, names: { en: 'Jonah', ha: 'Yunusa', yo: 'Jona', ig: 'Jona' }, variants: ['jonah', 'yunusa', 'jona'] },
  { id: 'micah', testament: 'OT', chapters: 7, names: { en: 'Micah', ha: 'Mika', yo: 'Mika', ig: 'Maịka' }, variants: ['micah', 'mika'] },
  { id: 'nahum', testament: 'OT', chapters: 3, names: { en: 'Nahum', ha: 'Nahum', yo: 'Nahumu', ig: 'Nehum' }, variants: ['nahum', 'nahumu'] },
  { id: 'habakkuk', testament: 'OT', chapters: 3, names: { en: 'Habakkuk', ha: 'Habakuk', yo: 'Habbakuku', ig: 'Habakuk' }, variants: ['habakkuk', 'habakuk'] },
  { id: 'zephaniah', testament: 'OT', chapters: 3, names: { en: 'Zephaniah', ha: 'Zafaniya', yo: 'Sefanaiah', ig: 'Zefanaya' }, variants: ['zephaniah', 'zafaniya'] },
  { id: 'haggai', testament: 'OT', chapters: 2, names: { en: 'Haggai', ha: 'Haggai', yo: 'Hagai', ig: 'Hegai' }, variants: ['haggai', 'hagai'] },
  { id: 'zechariah', testament: 'OT', chapters: 14, names: { en: 'Zechariah', ha: 'Zakariya', yo: 'Sekariah', ig: 'Zekaraya' }, variants: ['zechariah', 'zakariya'] },
  { id: 'malachi', testament: 'OT', chapters: 4, names: { en: 'Malachi', ha: 'Malachi', yo: 'Malaki', ig: 'Malakaị' }, variants: ['malachi', 'malaki'] },
  // New Testament (27)
  { id: 'matthew', testament: 'NT', chapters: 28, names: { en: 'Matthew', ha: 'Matiyu', yo: 'Matteu', ig: 'Matiu' }, variants: ['matthew', 'matiyu', 'matteu', 'matiu'] },
  { id: 'mark', testament: 'NT', chapters: 16, names: { en: 'Mark', ha: 'Markus', yo: 'Marku', ig: 'Mak' }, variants: ['mark', 'markus', 'marku'] },
  { id: 'luke', testament: 'NT', chapters: 24, names: { en: 'Luke', ha: 'Luka', yo: 'Luku', ig: 'Luk' }, variants: ['luke', 'luka', 'luku'] },
  { id: 'john', testament: 'NT', chapters: 21, names: { en: 'John', ha: 'Yuhanna', yo: 'Johannu', ig: 'Jọn' }, variants: ['john', 'yuhanna', 'johannu', 'jon', 'gospel of john'] },
  { id: 'acts', testament: 'NT', chapters: 28, names: { en: 'Acts', ha: 'Ayyukan Manzanni', yo: 'Iṣe Awọn Aposteli', ig: 'Ọrụ Ndịozi' }, variants: ['acts', 'ayyukan manzanni', 'ise apostoli'] },
  { id: 'romans', testament: 'NT', chapters: 16, names: { en: 'Romans', ha: 'Romawa', yo: 'Roomu', ig: 'Ndị Rom' }, variants: ['romans', 'roman', 'the book of romans', 'romasiya', 'romawa', 'roomu'] },
  { id: '1corinthians', testament: 'NT', chapters: 16, names: { en: '1 Corinthians', ha: '1 Korintiyawa', yo: '1 Korinti', ig: '1 Ndị Kọrint' }, variants: ['1 corinthians', 'first corinthians'] },
  { id: '2corinthians', testament: 'NT', chapters: 13, names: { en: '2 Corinthians', ha: '2 Korintiyawa', yo: '2 Korinti', ig: '2 Ndị Kọrint' }, variants: ['2 corinthians', 'second corinthians'] },
  { id: 'galatians', testament: 'NT', chapters: 6, names: { en: 'Galatians', ha: 'Galatiyawa', yo: 'Galatia', ig: 'Ndị Galetia' }, variants: ['galatians', 'galatiyawa', 'galatia'] },
  { id: 'ephesians', testament: 'NT', chapters: 6, names: { en: 'Ephesians', ha: 'Afisawa', yo: 'Efesu', ig: 'Ndị Efesọs' }, variants: ['ephesians', 'afisawa', 'efesu'] },
  { id: 'philippians', testament: 'NT', chapters: 4, names: { en: 'Philippians', ha: 'Filibiyawa', yo: 'Filippi', ig: 'Ndị Filipai' }, variants: ['philippians', 'filibiyawa', 'filippi'] },
  { id: 'colossians', testament: 'NT', chapters: 4, names: { en: 'Colossians', ha: 'Kolosiyawa', yo: 'Kolose', ig: 'Ndị Kọlọsi' }, variants: ['colossians', 'kolosiyawa', 'kolose'] },
  { id: '1thessalonians', testament: 'NT', chapters: 5, names: { en: '1 Thessalonians', ha: '1 Tassalunikawa', yo: '1 Tẹsalonika', ig: '1 Ndị Tesalonaịka' }, variants: ['1 thessalonians', 'first thessalonians'] },
  { id: '2thessalonians', testament: 'NT', chapters: 3, names: { en: '2 Thessalonians', ha: '2 Tassalunikawa', yo: '2 Tẹsalonika', ig: '2 Ndị Tesalonaịka' }, variants: ['2 thessalonians', 'second thessalonians'] },
  { id: '1timothy', testament: 'NT', chapters: 6, names: { en: '1 Timothy', ha: '1 Timoti', yo: '1 Timoti', ig: '1 Timoti' }, variants: ['1 timothy', 'first timothy'] },
  { id: '2timothy', testament: 'NT', chapters: 4, names: { en: '2 Timothy', ha: '2 Timoti', yo: '2 Timoti', ig: '2 Timoti' }, variants: ['2 timothy', 'second timothy'] },
  { id: 'titus', testament: 'NT', chapters: 3, names: { en: 'Titus', ha: 'Titus', yo: 'Titu', ig: 'Taịtọs' }, variants: ['titus', 'titu'] },
  { id: 'philemon', testament: 'NT', chapters: 1, names: { en: 'Philemon', ha: 'Filimon', yo: 'Filemoni', ig: 'Faịlimọn' }, variants: ['philemon', 'filimon'] },
  { id: 'hebrews', testament: 'NT', chapters: 13, names: { en: 'Hebrews', ha: 'Ibraniyawa', yo: 'Heberu', ig: 'Ndị Hibru' }, variants: ['hebrews', 'ibraniyawa', 'heberu'] },
  { id: 'james', testament: 'NT', chapters: 5, names: { en: 'James', ha: 'Yakubu', yo: 'Jakọbu', ig: 'Jemis' }, variants: ['james', 'yakubu', 'jakobu'] },
  { id: '1peter', testament: 'NT', chapters: 5, names: { en: '1 Peter', ha: '1 Bitrus', yo: '1 Peteru', ig: '1 Pita' }, variants: ['1 peter', 'first peter'] },
  { id: '2peter', testament: 'NT', chapters: 3, names: { en: '2 Peter', ha: '2 Bitrus', yo: '2 Peteru', ig: '2 Pita' }, variants: ['2 peter', 'second peter'] },
  { id: '1john', testament: 'NT', chapters: 5, names: { en: '1 John', ha: '1 Yuhanna', yo: '1 Johannu', ig: '1 Jọn' }, variants: ['1 john', 'first john'] },
  { id: '2john', testament: 'NT', chapters: 1, names: { en: '2 John', ha: '2 Yuhanna', yo: '2 Johannu', ig: '2 Jọn' }, variants: ['2 john', 'second john'] },
  { id: '3john', testament: 'NT', chapters: 1, names: { en: '3 John', ha: '3 Yuhanna', yo: '3 Johannu', ig: '3 Jọn' }, variants: ['3 john', 'third john'] },
  { id: 'jude', testament: 'NT', chapters: 1, names: { en: 'Jude', ha: 'Yahuza', yo: 'Judu', ig: 'Jud' }, variants: ['jude', 'yahuza', 'judu'] },
  { id: 'revelation', testament: 'NT', chapters: 22, names: { en: 'Revelation', ha: 'Ru\u2019uya ta Yohanna', yo: 'Ifihan', ig: 'Mkpughe' }, variants: ['revelation', 'revelations', 'apocalypse', 'ifihan', 'mkpughe'] },
];

export function getBookById(id) {
  return BOOKS.find((b) => b.id === id) || null;
}

export function getBookDisplayName(id, lang) {
  const book = getBookById(id);
  if (!book) return id;
  return book.names[lang] || book.names.en;
}

export function getBooksByTestament(testament) {
  return BOOKS.filter((b) => b.testament === testament);
}
