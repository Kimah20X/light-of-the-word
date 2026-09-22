# Light of the Word

An offline-first, voice-controlled Bible app for blind and visually impaired
users in Nigeria, built per the developer spec (`BibleApp_DeveloperPrompt.docx`).

```
light-of-the-word/
├── frontend/   React Native + Expo app (the phone app itself)
├── backend/    Node.js + Express API (auth, bookmark sync, AI verse explain)
└── README.md   This file
```

## What's real vs. what's a placeholder

**Real, working, and verified:**
- The full King James Bible — all 66 books, 31,102 verses, pulled from the
  public-domain `aruljohn/Bible-kjv` dataset. Every chapter count was
  cross-checked against the actual text; there are zero mismatches.
- Every screen from the spec: Onboarding, Home/Player, Navigate, Bookmarks,
  Settings, Explain.
- The full voice command parser: navigation ("Open Romans 6:3", "Romans 6"
  with "open" omitted, "Go to Genesis"), playback control, bookmarking,
  book listing, chapter-count queries, language switching, and all the
  spec's error cases (book not found, chapter/verse out of range,
  unrecognised command) — with fuzzy (Levenshtein) matching so
  mispronunciations and alternate spellings still work.
- Hausa, Yoruba, and Igbo book names and UI strings for the parser and the
  interface.
- The backend: JWT auth, bookmark CRUD synced to MongoDB, and an `/explain`
  route that proxies to Claude for AI verse explanations (so the API key
  never ships inside the app).
- Every file in both `frontend/` and `backend/` has been syntax-checked
  (Babel, JSX included) and every import path verified to resolve.

**Explicitly NOT done — these need you:**
- Hausa/Yoruba/Igbo **audio files** (Faith Comes By Hearing) are not
  bundled — they total hundreds of MB and require you to request/download
  them directly from faithcomesbyhearing.com.
- **Yoruba and Igbo book names** are a best-effort pass from general
  knowledge, not a certified translation. Hausa is more reliable (drawn from
  the Bible Society of Nigeria naming tradition) but still worth a native
  speaker's once-over. **Have someone verify all three before shipping.**
- No MongoDB, Railway, or Anthropic account is connected — you'll plug in
  your own.
- I haven't run this on a physical device or with TalkBack/VoiceOver. The
  accessibility rules from spec section 9 (labels, roles, touch targets,
  focus management) are implemented in code, but "passes with TalkBack" can
  only be confirmed by actually testing with it.

---

## 1. Set up the backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:

| Variable | Where to get it |
|---|---|
| `MONGODB_URI` | Create a free MongoDB Atlas cluster at mongodb.com/atlas → "Connect" → "Drivers" → copy the connection string. |
| `JWT_SECRET` | Any long random string — e.g. run `openssl rand -hex 32`. |
| `ANTHROPIC_API_KEY` | console.anthropic.com → API Keys. Needed for the Explain screen; everything else works without it. |

Run it locally:
```bash
npm run dev        # nodemon, restarts on change
```
Check it's alive: `curl http://localhost:4000/api/v1/health`

**To deploy** (so the phone app can reach it from anywhere, not just your
Wi-Fi): push `backend/` to a GitHub repo, connect it to
[Railway](https://railway.app) (matches the spec's deployment choice), add
the same three environment variables in Railway's dashboard, deploy, then
copy the public URL Railway gives you.

## 2. Point the app at your backend

Edit `frontend/src/engine/apiConfig.js`:
```js
export const API_BASE_URL = 'https://your-railway-app.up.railway.app/api/v1';
```
(Use `http://<your-computer's-LAN-IP>:4000/api/v1` instead while testing
locally on a physical device over the same Wi-Fi — `localhost` on the phone
means the phone itself, not your computer.)

## 3. Set up the frontend

```bash
cd frontend
npm install
```

**Important:** `@react-native-voice/voice` requires native code, so this
app **cannot run in Expo Go**. You need a custom development build. This
is already configured (`eas.json`, `expo-dev-client` in `package.json`) —
you just need an Expo account:

```bash
npm install -g eas-cli
eas login
eas build:configure     # links this project to your Expo account
```

## 4. Build the APK for your showcase

```bash
eas build --platform android --profile preview
```

This builds on Expo's servers (free tier available) and gives you a
downloadable `.apk` link when it finishes (usually 10-20 minutes) — no
Android Studio, no signing keys to manage yourself, no Google Play account
needed since you're not distributing through the Play Store. Send that
link to your phone, or scan the QR code EAS prints, to install and open it
directly.

If you'd rather run it on a device connected to your computer for live
development first: `eas build --profile development` once, install that
build on your phone, then `npx expo start --dev-client` for fast-refresh
development.

## 5. Audio files (optional, for natural Hausa/Yoruba/Igbo speech)

Without this step, all four languages read using the phone's built-in
text-to-speech engine (`expo-speech`) — which works and is fully offline,
but sounds robotic for tonal languages.

1. Request Hausa/Yoruba/Igbo audio Bible files from
   [faithcomesbyhearing.com](https://www.faithcomesbyhearing.com) (free for
   non-commercial use, per the spec).
2. Name each file `<bookId>-<chapter>.mp3` (e.g. `john-3.mp3`) — `bookId`
   values are in `frontend/src/engine/bookLookup.js`.
3. Drop them in `frontend/assets/audio/hausa/`, `.../yoruba/`, or
   `.../igbo/`.
4. **Register each one** in `frontend/src/engine/ttsController.js` — Metro
   (React Native's bundler) can't `require()` a dynamic path, so every
   file needs a line added to the `AUDIO_MAP` object at the top of that
   file:
   ```js
   const AUDIO_MAP = {
     ha: {
       'john-3': require('../../assets/audio/hausa/john-3.mp3'),
     },
   };
   ```
   Given the full audio Bible is ~800MB, consider starting with just the
   New Testament (~250MB, per the spec's suggestion) or Genesis–Psalms.

## 6. Before you'd actually ship this

- [ ] Native-speaker review of Yoruba and Igbo book names
      (`frontend/src/engine/bookLookup.js`) and UI strings
      (`frontend/src/i18n/yo.json`, `ig.json`).
- [ ] Real device testing with TalkBack (Android) — turn it on in
      Settings → Accessibility, then navigate the whole app with the
      screen off. This is the actual test the spec's "golden rule" describes.
- [ ] App icon + splash screen — `frontend/app.json` has no `icon`/`splash`
      keys yet, so it'll build with Expo's default icon.
- [ ] Yoruba/Igbo number-word parsing (spoken "twenty-five" rather than
      digits) isn't implemented — only English and Hausa number words are.
      Digit input works in all four languages regardless.
- [ ] The spec's storage plan says SQLite for bookmarks; this build uses
      AsyncStorage instead (functionally equivalent for this data volume,
      simpler to maintain, but swap in `expo-sqlite` if you want to match
      the spec exactly).
- [ ] The spec calls for `i18next`; this build uses a small hand-rolled
      `t()` function in `frontend/src/i18n/index.js` instead, since 4
      languages didn't justify the dependency. Functionally equivalent —
      swap it in if you specifically need i18next's plural/ICU features.

## Testing the voice commands without a real voice recognizer

Speech-to-text isn't something I can test from here. To sanity-check the
parser itself, you can call `parseCommand()` directly with typed strings —
it takes a plain lowercase string and returns a structured intent, so it's
testable independent of the microphone/`@react-native-voice/voice`
integration:

```js
import { parseCommand } from './src/engine/commandParser';
console.log(parseCommand('romans 6'));
console.log(parseCommand('open genesis 50:26'));
console.log(parseCommand('how many chapters in romans'));
```
