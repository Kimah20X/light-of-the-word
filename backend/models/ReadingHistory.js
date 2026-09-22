const mongoose = require('mongoose');

// reading_history table
const readingHistorySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    bookId: { type: String, required: true },
    chapter: { type: Number, required: true },
    lastReadAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

readingHistorySchema.index({ userId: 1, bookId: 1, chapter: 1 }, { unique: true });

module.exports = mongoose.model('ReadingHistory', readingHistorySchema);
