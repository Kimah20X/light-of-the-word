const express = require('express');

const ReadingHistory = require('../models/ReadingHistory');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);

// GET /api/v1/reading-history
router.get('/', async (req, res) => {
  try {
    const history = await ReadingHistory.find({
      userId: req.userId,
    }).sort({ lastReadAt: -1 });

    res.json({
      history,
    });
  } catch (err) {
    console.error('Get reading history error:', err);

    res.status(500).json({
      error: 'Could not load reading history.',
    });
  }
});

// POST /api/v1/reading-history
router.post('/', async (req, res) => {
  try {
    const { bookId, chapter } = req.body;

    if (!bookId || !chapter) {
      return res.status(400).json({
        error: 'bookId and chapter are required.',
      });
    }

    const history = await ReadingHistory.findOneAndUpdate(
      {
        userId: req.userId,
        bookId,
        chapter,
      },
      {
        $set: {
          lastReadAt: new Date(),
        },
      },
      {
        upsert: true,
        new: true,
      }
    );

    res.status(201).json({
      history,
    });
  } catch (err) {
    console.error('Save reading history error:', err);

    res.status(400).json({
      error: 'Could not save reading history.',
    });
  }
});

module.exports = router;