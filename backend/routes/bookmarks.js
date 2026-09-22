const express = require('express');
const Bookmark = require('../models/Bookmark');
const { requireAuth } = require('../middleware/auth').default;

const router = express.Router();
router.use(requireAuth);

// GET /api/v1/bookmarks — list this user's cloud bookmarks
router.get('/', async (req, res) => {
  const bookmarks = await Bookmark.find({ userId: req.userId }).sort({ savedAt: -1 });
  res.json({ bookmarks });
});

// POST /api/v1/bookmarks — bulk upsert, used both for a single new bookmark
// and for the "bulk-insert local AsyncStorage bookmarks on sign-in" flow
// described in section 8.
router.post('/', async (req, res) => {
  const items = Array.isArray(req.body.bookmarks) ? req.body.bookmarks : [req.body];
  try {
    const results = await Promise.all(
      items.map((item) =>
        Bookmark.findOneAndUpdate(
          { userId: req.userId, bookId: item.bookId, chapter: item.chapter, verse: item.verse },
          { $set: { preview: item.preview, savedAt: item.savedAt || new Date() } },
          { upsert: true, new: true }
        )
      )
    );
    res.status(201).json({ bookmarks: results });
  } catch (err) {
    res.status(400).json({ error: 'Could not save bookmark(s).' });
  }
});

// DELETE /api/v1/bookmarks/:id
router.delete('/:id', async (req, res) => {
  const result = await Bookmark.deleteOne({ _id: req.params.id, userId: req.userId });
  if (result.deletedCount === 0) {
    return res.status(404).json({ error: 'Bookmark not found.' });
  }
  res.json({ deleted: true });
});

module.exports = router;
