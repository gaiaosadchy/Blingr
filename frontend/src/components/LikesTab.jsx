import { useState } from 'react';
import EarringCard from './EarringCard';
import { unlikeEarring } from '../api';

export default function LikesTab({ likes, onUnlike }) {
  const [removing, setRemoving] = useState(null);

  async function handleUnlike(link) {
    setRemoving(link);
    try {
      await unlikeEarring(link);
      onUnlike(link);
    } catch (err) {
      alert('Could not remove like: ' + err.message);
    } finally {
      setRemoving(null);
    }
  }

  if (likes.length === 0) {
    return (
      <div style={emptyStyle}>
        <p style={{ fontSize: 48 }}>♡</p>
        <p>No likes yet — start swiping!</p>
      </div>
    );
  }

  return (
    /* scrollable wrapper — fills the main area and scrolls internally */
    <div style={scrollWrapStyle}>
      <div style={gridStyle}>
        {likes.map((earring) => (
          <div key={earring.link} style={itemStyle}>
            <EarringCard earring={earring}>
              <div style={actionsStyle}>
                <a
                  href={earring.link}
                  target="_blank"
                  rel="noreferrer"
                  style={buyLinkStyle}
                >
                  View in shop →
                </a>
                <button
                  style={removeBtnStyle}
                  onClick={() => handleUnlike(earring.link)}
                  disabled={removing === earring.link}
                >
                  {removing === earring.link ? '...' : '✕'}
                </button>
              </div>
            </EarringCard>
          </div>
        ))}
      </div>
    </div>
  );
}

/* fills main, scrolls vertically — solves the mobile overflow problem */
const scrollWrapStyle = {
  width: '100%',
  height: '100%',
  overflowY: 'auto',
  WebkitOverflowScrolling: 'touch', // iOS momentum scrolling
};

const emptyStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 12,
  color: '#aaa',
  fontSize: 18,
  height: '100%',
};

const gridStyle = {
  display: 'grid',
  /* 2 columns on mobile, up to 3-4 on desktop */
  gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
  gap: 16,
  padding: 16,
  maxWidth: 1100,
  margin: '0 auto',
};

/* fixed height so the flex image inside EarringCard has a reference to fill */
const itemStyle = {
  height: 300,
  display: 'flex',
  flexDirection: 'column',
};

const actionsStyle = {
  display: 'flex',
  borderTop: '1px solid #f0e8e0',
  flexShrink: 0,
};

const buyLinkStyle = {
  flex: 1,
  textAlign: 'center',
  padding: '8px 0',
  color: '#c07850',
  fontSize: 13,
  textDecoration: 'none',
  fontWeight: 500,
};

const removeBtnStyle = {
  padding: '8px 12px',
  background: 'none',
  border: 'none',
  color: '#e74c3c',
  fontSize: 13,
  cursor: 'pointer',
  borderLeft: '1px solid #f0e8e0',
  flexShrink: 0,
};
