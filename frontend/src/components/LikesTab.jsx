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
                {removing === earring.link ? '...' : '✕ Remove'}
              </button>
            </div>
          </EarringCard>
        </div>
      ))}
    </div>
  );
}

const emptyStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 12,
  color: '#aaa',
  fontSize: 18,
  paddingTop: 80,
};

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
  gap: 24,
  padding: '24px 16px',
  maxWidth: 1100,
  margin: '0 auto',
};

const itemStyle = {
  display: 'flex',
  flexDirection: 'column',
};

const actionsStyle = {
  display: 'flex',
  borderTop: '1px solid #f0e8e0',
};

const buyLinkStyle = {
  flex: 1,
  textAlign: 'center',
  padding: '10px 0',
  color: '#c07850',
  fontSize: 14,
  textDecoration: 'none',
  fontWeight: 500,
};

const removeBtnStyle = {
  padding: '10px 14px',
  background: 'none',
  border: 'none',
  color: '#e74c3c',
  fontSize: 13,
  cursor: 'pointer',
  borderLeft: '1px solid #f0e8e0',
};
