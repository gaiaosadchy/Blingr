# Jewelry Finder

Tinder-style swipe app for earrings. Scrapes Shani Jacobi, shows one earring at a time, learns what you like.

## Project structure

```
jewelry-finder/
├── backend/          Node.js + Express API + scraper
└── frontend/         React app
```

## How to run

### 1. Install backend dependencies

```bash
cd backend
npm install
```

### 2. Start the backend

```bash
npm start
```

The server starts on http://localhost:3001 and immediately begins scraping earrings.

### 3. Install frontend dependencies (new terminal)

```bash
cd frontend
npm install
```

### 4. Start the frontend

```bash
npm start
```

Opens http://localhost:3000 automatically.

The app will show a loading spinner while the backend scrapes the shop. Once done, earrings appear and you can start swiping.

## Adding a new shop

1. Create `backend/scrapers/yourshop.js` — export `{ scrape, SOURCE_ID }`
2. Add it to the `scrapers` array in `backend/scrapers/index.js`

That's it — no other changes needed.
