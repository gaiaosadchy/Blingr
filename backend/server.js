const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { scrapeAll } = require('./scrapers/index');
const earringsRoute = require('./routes/earrings');
const likesRoute = require('./routes/likes');

const app = express();
const PORT = process.env.PORT || 3001;

// ── Shared in-memory store ────────────────────────────────────────────────────
const store = {
  earrings: [],   // all scraped earrings
  likes: [],      // earrings the user liked
  skipped: new Set(), // links of skipped earrings
  scraped: false, // true once scraping is done
};

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────────────
earringsRoute.init(store);
likesRoute.init(store);

app.use('/api/earrings', earringsRoute.router);
app.use('/api/likes', likesRoute.router);

// Health check
app.get('/api/health', (req, res) => res.json({ ok: true }));

// Image proxy — bypasses hotlink protection by fetching server-side (no browser Referer)
app.get('/api/image', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'url param required' });

  try {
    const response = await axios.get(url, {
      responseType: 'stream',
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120',
      },
    });

    res.set('Content-Type', response.headers['content-type'] || 'image/jpeg');
    res.set('Cache-Control', 'public, max-age=86400'); // cache for 1 day
    response.data.pipe(res);
  } catch (err) {
    res.status(502).json({ error: 'Failed to fetch image', detail: err.message });
  }
});

// ── Start server & scrape ─────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Starting scrape...');

  scrapeAll()
    .then((products) => {
      store.earrings = products;
      store.scraped = true;
      console.log(`Scrape complete. ${products.length} earrings loaded.`);
    })
    .catch((err) => {
      console.error('Scrape failed:', err.message);
      store.scraped = true; // mark done even on failure so UI doesn't hang
    });
});
