const express = require('express');
const cors = require('cors');
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
