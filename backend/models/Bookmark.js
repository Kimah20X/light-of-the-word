const mongoose = require('mongoose');

// bookmarks table
const bookmarkSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    bookId: { type: String, required: true },
    chapter: { type: Number, required: true },
    verse: { type: Number, required: true },
    preview: { type: String },
    savedAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

// One bookmark per verse per user - repeated "bookmark this" on the same
// verse updates savedAt instead of duplicating.
bookmarkSchema.index({ userId: 1, bookId: 1, chapter: 1, verse: 1 }, { unique: true });

module.exports = mongoose.model('Bookmark', bookmarkSchema);
