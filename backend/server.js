require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const bookmarksRoutes = require('./routes/bookmarks');

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json({ limit: '256kb' }));

// Base URL- https://lightoftheword-api.railway.app/api/v1
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/bookmarks', bookmarksRoutes);


app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', mongoConnected: mongoose.connection.readyState === 1 });
});

//  Error handling - every error response is JSON with an
// `error` string so the app can pass it straight to TTS.
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Something went wrong.' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not found.' });
});

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    if (!process.env.MONGODB_URI) {
      console.warn('MONGODB_URI is not set — auth and bookmark sync routes will fail until it is.');
    } else {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('Connected to MongoDB');
    }
    app.listen(PORT, () => console.log(`Light of the Word API listening on port ${PORT}`));
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
