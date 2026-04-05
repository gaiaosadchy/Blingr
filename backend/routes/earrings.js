/**
 * Earring routes
 * GET  /api/earrings        — all earrings (for debugging / admin)
 * GET  /api/earrings/next   — next earring to show (ranked by preference score)
 * POST /api/earrings/skip   — mark an earring as skipped (won't show again this session)
 * GET  /api/earrings/status — scraping status
 */

const express = require('express');
const router = express.Router();

// Shared state injected from server.js
let store; // { earrings, likes, skipped, scraped }

function init(sharedStore) {
  store = sharedStore;
}

/**
 * Simple recommendation score.
 * Counts how many tags the candidate shares with already-liked earrings.
 * Higher = more similar to what the user likes.
 */
function recommendationScore(candidate, likes) {
  if (likes.length === 0) return 0;

  const likedTags = likes.flatMap((l) => l.tags || []);
  const tagFreq = {};
  likedTags.forEach((t) => {
    tagFreq[t] = (tagFreq[t] || 0) + 1;
  });

  return (candidate.tags || []).reduce((sum, tag) => sum + (tagFreq[tag] || 0), 0);
}

// GET /api/earrings/status
router.get('/status', (req, res) => {
  res.json({
    scraped: store.scraped,
    total: store.earrings.length,
    liked: store.likes.length,
    skipped: store.skipped.size,
    remaining: store.earrings.filter(
      (e) => !store.skipped.has(e.link) && !store.likes.find((l) => l.link === e.link)
    ).length,
  });
});

// GET /api/earrings — all earrings
router.get('/', (req, res) => {
  res.json(store.earrings);
});

// GET /api/earrings/next — best next earring for this user
router.get('/next', (req, res) => {
  const seen = new Set([
    ...store.skipped,
    ...store.likes.map((l) => l.link),
  ]);

  const remaining = store.earrings.filter((e) => !seen.has(e.link));

  if (remaining.length === 0) {
    return res.json({ done: true, message: 'No more earrings to show!' });
  }

  // Sort by recommendation score descending, pick the top one
  const scored = remaining.map((e) => ({
    ...e,
    _score: recommendationScore(e, store.likes),
  }));
  scored.sort((a, b) => b._score - a._score);

  const next = scored[0];
  // Don't expose the internal score
  const { _score, ...earring } = next;

  res.json({ done: false, earring, remaining: remaining.length });
});

// POST /api/earrings/skip — skip (swipe left)
router.post('/skip', (req, res) => {
  const { link } = req.body;
  if (!link) return res.status(400).json({ error: 'link is required' });
  store.skipped.add(link);
  res.json({ ok: true });
});

module.exports = { router, init };
