import { useState, useEffect, useCallback } from 'react';
import SwipeCard from './components/SwipeCard';
import LikesTab from './components/LikesTab';
import { getNextEarring, skipEarring, likeEarring, getLikes, getStatus, undoLastSwipe, fetchPrice } from './api';

export default function App() {
  // Inject @keyframes once on mount
  useState(() => {
    const el = document.createElement('style');
    el.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
    document.head.appendChild(el);
    return null;
  });

  const [tab, setTab] = useState('discover'); // 'discover' | 'likes'
  const [current, setCurrent] = useState(null); // earring being shown
  const [price, setPrice] = useState('');       // lazily fetched price for current earring
  const [likes, setLikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scraped, setScraped] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);
  const [canUndo, setCanUndo] = useState(false);

  // Poll until backend finishes scraping
  useEffect(() => {
    let timer;
    async function checkStatus() {
      try {
        const status = await getStatus();
        if (status.scraped) {
          setScraped(true);
          clearInterval(timer);
          loadNext();
          loadLikes();
        }
      } catch {
        // backend not ready yet, keep polling
      }
    }
    timer = setInterval(checkStatus, 2000);
    checkStatus(); // immediate first check
    return () => clearInterval(timer);
  }, []);

  const loadNext = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getNextEarring();
      if (data.done) {
        setDone(true);
        setCurrent(null);
      } else {
        setCurrent(data.earring);
        setDone(false);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch price lazily whenever the shown earring changes
  useEffect(() => {
    if (!current?.link) return;
    setPrice('');
    let cancelled = false;
    fetchPrice(current.link).then((p) => { if (!cancelled) setPrice(p); });
    return () => { cancelled = true; };
  }, [current?.link]);

  async function loadLikes() {
    try {
      const data = await getLikes();
      setLikes(data);
    } catch {
      // non-critical
    }
  }

  async function handleLike(earring) {
    try {
      await likeEarring(earring);
      setLikes((prev) => [...prev, { ...earring, likedAt: new Date().toISOString() }]);
      setCanUndo(true);
    } catch (err) {
      console.error('Like failed:', err.message);
    }
    loadNext();
  }

  async function handleSkip(earring) {
    try {
      await skipEarring(earring.link);
      setCanUndo(true);
    } catch (err) {
      console.error('Skip failed:', err.message);
    }
    loadNext();
  }

  async function handleUndo() {
    try {
      const data = await undoLastSwipe();
      setCanUndo(false);
      // Put the undone earring back as the current card
      setCurrent(data.earring);
      setDone(false);
      setLoading(false);
      // If it was a like, remove it from the local likes list too
      setLikes((prev) => prev.filter((l) => l.link !== data.earring.link));
    } catch (err) {
      console.error('Undo failed:', err.message);
    }
  }

  function handleUnlike(link) {
    setLikes((prev) => prev.filter((l) => l.link !== link));
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div style={appStyle}>
      {/* Header */}
      <header style={headerStyle}>
        <h1 style={titleStyle}>✨ Blingr</h1>
        <nav style={navStyle}>
          <button
            style={{ ...navBtnStyle, ...(tab === 'discover' ? activeNavStyle : {}) }}
            onClick={() => setTab('discover')}
          >
            Discover
          </button>
          <button
            style={{ ...navBtnStyle, ...(tab === 'likes' ? activeNavStyle : {}) }}
            onClick={() => { setTab('likes'); loadLikes(); }}
          >
            Likes {likes.length > 0 && <span style={badgeStyle}>{likes.length}</span>}
          </button>
        </nav>
      </header>

      {/* Body */}
      <main style={{ ...mainStyle, alignItems: tab === 'likes' ? 'stretch' : 'center' }}>
        {tab === 'discover' ? (
          <DiscoverView
            scraped={scraped}
            loading={loading}
            done={done}
            error={error}
            current={current}
            price={price}
            onLike={handleLike}
            onSkip={handleSkip}
            onUndo={handleUndo}
            canUndo={canUndo}
          />
        ) : (
          <LikesTab likes={likes} onUnlike={handleUnlike} />
        )}
      </main>
    </div>
  );
}

function DiscoverView({ scraped, loading, done, error, current, price, onLike, onSkip, onUndo, canUndo }) {
  if (!scraped) {
    return (
      <div style={centerStyle}>
        <div style={spinnerStyle} />
        <p style={subtitleStyle}>Fetching earrings from the shop...</p>
        <p style={{ color: '#bbb', fontSize: 13 }}>This may take a moment on first load.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={centerStyle}>
        <p style={{ color: '#e74c3c', fontSize: 18 }}>Something went wrong</p>
        <p style={{ color: '#aaa' }}>{error}</p>
      </div>
    );
  }

  if (done) {
    return (
      <div style={centerStyle}>
        <p style={{ fontSize: 48 }}>🎉</p>
        <p style={{ fontSize: 22, fontWeight: 600 }}>You've seen everything!</p>
        <p style={{ color: '#aaa' }}>Check your Likes tab.</p>
      </div>
    );
  }

  if (loading || !current) {
    return (
      <div style={centerStyle}>
        <div style={spinnerStyle} />
      </div>
    );
  }

  return (
    <SwipeCard
      earring={current}
      price={price}
      onLike={onLike}
      onSkip={onSkip}
      onUndo={onUndo}
      canUndo={canUndo}
    />
  );
}

// ── Styles ──────────────────────────────────────────────────────────────────────

const appStyle = {
  height: '100dvh',     // fills exact visible viewport (handles iOS Safari toolbar)
  display: 'flex',
  flexDirection: 'column',
  background: '#f5f0eb',
  overflow: 'hidden',
};

const headerStyle = {
  background: '#fff',
  boxShadow: '0 1px 8px rgba(0,0,0,0.08)',
  padding: '16px 24px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: 12,
};

const titleStyle = {
  fontSize: 22,
  fontWeight: 700,
  color: '#222',
  letterSpacing: 1,
};

const navStyle = {
  display: 'flex',
  gap: 8,
};

const navBtnStyle = {
  padding: '8px 20px',
  borderRadius: 20,
  border: '1.5px solid #e0d8d0',
  background: 'none',
  cursor: 'pointer',
  fontSize: 15,
  color: '#555',
  fontWeight: 500,
  transition: 'all 0.15s',
  display: 'flex',
  alignItems: 'center',
  gap: 6,
};

const activeNavStyle = {
  background: '#222',
  color: '#fff',
  borderColor: '#222',
};

const badgeStyle = {
  background: '#c07850',
  color: '#fff',
  borderRadius: 10,
  fontSize: 11,
  padding: '1px 6px',
  fontWeight: 700,
};

const mainStyle = {
  flex: 1,
  minHeight: 0,         // lets flex child shrink below content size
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  overflow: 'hidden',
  width: '100%',
};

const centerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 16,
  color: '#555',
  fontSize: 18,
  textAlign: 'center',
  padding: 24,
};

const subtitleStyle = {
  color: '#888',
  fontSize: 16,
};

const spinnerStyle = {
  width: 40,
  height: 40,
  border: '4px solid #e0d8d0',
  borderTop: '4px solid #c07850',
  borderRadius: '50%',
  animation: 'spin 0.8s linear infinite',
};

