# Light of the Word

**An offline-first, voice-controlled Bible app designed for blind and visually impaired users in Nigeria.**

## Project Structure

```text
light-of-the-word/
├── frontend/    React Native + Expo mobile app
├── backend/     Node.js + Express API
└── README.md
```

## Current Features

### Bible

* Complete KJV Bible — all 66 books and 31,102 verses.
* Offline Bible reading and navigation in English.
* Chapter and verse navigation.

### Voice Control

Supports voice commands for:

* Opening books, chapters, and verses.
* Playback controls.
* Bookmarks.
* Listing Bible books.
* Checking chapter counts.
* Language switching.
* Handling invalid or unrecognized commands.

The parser also supports fuzzy matching to accommodate common pronunciation differences and spelling variations.

### Languages

* English
* Hausa
* Yoruba
* Igbo

The interface and Bible book lookup support all four languages.

### Accessibility

The application is designed for blind and visually impaired users, with accessibility labels, roles, touch-target considerations, and focus management implemented throughout the application.

### Backend

The backend currently provides:

* JWT authentication.
* Bookmark synchronization.
* MongoDB storage.

---

# What's Complete

* [x] Complete KJV Bible dataset.
* [x] Application screens.
* [x] Bible navigation.
* [x] Voice-command parser.
* [x] Bookmark functionality.
* [x] English, Hausa, Yoruba, and Igbo interface support.
* [x] Backend authentication.
* [x] Bookmark API.
* [x] Accessibility implementation.
* [x] Frontend and backend syntax/import checks.

---

# What's Still Required

* [ ] Native-speaker review of Hausa, Yoruba, and Igbo translations.
* [ ] Physical-device testing with Android TalkBack.
* [ ] Full voice-command testing with an actual microphone.
* [ ] MongoDB and production backend configuration.
* [ ] Production backend deployment.
* [ ] Final app icon and splash screen.
* [ ] Optional Hausa, Yoruba, and Igbo audio Bible files.
* [ ] Final end-to-end testing before release.

> **Important:** The application should currently be considered a development build, not a production release.

---

# Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Configure:

```env
MONGODB_URI=your_mongodb_connection
JWT_SECRET=your_secure_secret
```

Run locally:

```bash
npm run dev
```

Test the API:

```bash
curl http://localhost:4000/api/v1/health
```

For physical-device testing, use your computer's local IP instead of `localhost`.

---

# Frontend Setup

```bash
cd frontend
npm install
```

Because `@react-native-voice/voice` requires native functionality, the application **cannot rely on standard Expo Go for voice functionality**.

Use an Expo development build:

```bash
npm install -g eas-cli
eas login
eas build:configure
```

For an Android showcase APK:

```bash
eas build --platform android --profile preview
```

For development builds:

```bash
eas build --platform android --profile development
```

Then:

```bash
npx expo start --dev-client
```

---

# Audio

Hausa, Yoruba, and Igbo audio Bible files are not currently bundled.

If authorized audio files are obtained, they can be placed under:

```text
frontend/assets/audio/
├── hausa/
├── yoruba/
└── igbo/
```

Audio files must be explicitly registered in the application's audio configuration because Metro does not support arbitrary dynamic asset paths.

Audio is optional; the application can use the device's built-in text-to-speech functionality.

---

# Known Implementation Differences

### Storage

The original specification proposed SQLite. The current implementation uses **AsyncStorage** for local data.

### Internationalization

The original specification proposed `i18next`. The current implementation uses a lightweight custom translation system.

### Number Commands

English number words are supported. Hausa, Yoruba and Igbo number-word parsing still needs to be implemented.

---

# Testing the Voice Parser

The parser can be tested independently of the microphone:

```js
import { parseCommand } from './src/engine/commandParser';

console.log(parseCommand('romans 6'));
console.log(parseCommand('open genesis 50:26'));
console.log(parseCommand('how many chapters in romans'));
```

This allows the command logic to be verified before testing actual speech recognition.

---

# Final Pre-Release Checklist

* [ ] Frontend launches successfully.
* [ ] All screens work.
* [ ] Bible navigation works offline.
* [ ] Voice commands work on a physical device.
* [ ] TalkBack testing completed.
* [ ] Bookmarks work locally and sync with the backend.
* [ ] MongoDB configured.
* [ ] Backend deployed.
* [ ] Hausa/Yoruba/Igbo translations reviewed.
* [ ] App icon and splash screen added.
* [ ] Final Android build tested.

**Goal:** Complete physical-device, accessibility, voice, backend, and language testing before releasing the application publicly.
