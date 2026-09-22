const express = require('express');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Loosely rate-limited since this hits a paid AI API per request.
const explainLimiter = rateLimit({ windowMs: 60 * 1000, max: 20 });

/**
 * POST /api/v1/explain
 * Proxies a verse-explanation request to an AI provider so the API key
 * never has to live inside the mobile app bundle. This route works for
 * both logged-in and anonymous users (auth is optional here on purpose —
 * verse explanation isn't an account-bound feature per the spec).
 *
 * NOTE: check Anthropic's current model names/pricing at
 * https://docs.claude.com before deploying — the string below may be out
 * of date by the time you read this.
 */
router.post('/', explainLimiter, async (req, res) => {
  const { book, chapter, verse, text, language } = req.body;
  if (!book || !chapter) {
    return res.status(400).json({ error: 'book and chapter are required.' });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'Explanation service is not configured.' });
  }

  const reference = verse ? `${book} ${chapter}:${verse}` : `${book} ${chapter}`;
  const prompt = text
    ? `Explain ${reference} ("${text}") in 3-4 short, plain sentences suitable for someone listening via text-to-speech, in ${languageName(language)}. Avoid denominational bias; focus on plain meaning and context.`
    : `Explain the Bible passage ${reference} in 3-4 short, plain sentences suitable for someone listening via text-to-speech, in ${languageName(language)}. Avoid denominational bias; focus on plain meaning and context.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001', // fast + cheap, good fit for short verse explanations — check docs.claude.com for the current lineup before deploying
        max_tokens: 300,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error('Anthropic API error:', errBody);
      return res.status(502).json({ error: 'The explanation service is unavailable right now.' });
    }

    const data = await response.json();
    const explanation = (data.content || [])
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('\n')
      .trim();

    return res.json({ reference, explanation });
  } catch (err) {
    console.error('Explain route error:', err);
    return res.status(500).json({ error: 'Could not generate an explanation.' });
  }
});

function languageName(code) {
  return { en: 'English', ha: 'Hausa', yo: 'Yoruba', ig: 'Igbo' }[code] || 'English';
}

module.exports = router;
