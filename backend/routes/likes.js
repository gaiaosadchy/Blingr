/**
 * Likes routes
 * GET    /api/likes        — all liked earrings
 * POST   /api/likes        — like an earring (swipe right)
 * DELETE /api/likes/:link  — un-like an earring
 */

const express = require('express');
const router = express.Router();

let store;

function init(sharedStore) {
  store = sharedStore;
}

// GET /api/likes
router.get('/', (req, res) => {
  res.json(store.likes);
});

// POST /api/likes
router.post('/', (req, res) => {
  const { link, name, image, price, tags, source } = req.body;
  if (!link) return res.status(400).json({ error: 'link is required' });

  const alreadyLiked = store.likes.find((l) => l.link === link);
  if (alreadyLiked) return res.json({ ok: true, message: 'Already liked' });

  const earring = { link, name, image, price, tags: tags || [], source };
  store.likes.push({ ...earring, likedAt: new Date().toISOString() });
  store.lastAction = { type: 'like', earring };

  res.json({ ok: true });
});

// DELETE /api/likes — body: { link }
router.delete('/', (req, res) => {
  const { link } = req.body;
  if (!link) return res.status(400).json({ error: 'link is required' });

  const before = store.likes.length;
  store.likes = store.likes.filter((l) => l.link !== link);

  if (store.likes.length === before) {
    return res.status(404).json({ error: 'Not found in likes' });
  }
  res.json({ ok: true });
});

module.exports = { router, init };
