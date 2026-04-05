import { useState, useRef } from 'react';
import EarringCard from './EarringCard';

/**
 * Swipeable card.
 * Supports both mouse/touch drag AND button clicks.
 * onLike / onSkip are called when a decision is made.
 */
export default function SwipeCard({ earring, onLike, onSkip, onUndo, canUndo, remaining }) {
  const [drag, setDrag] = useState({ x: 0, y: 0, dragging: false });
  const [decision, setDecision] = useState(null); // 'like' | 'skip' | null
  const startRef = useRef(null);
  const cardRef = useRef(null);

  // ── Drag / touch helpers ───────────────────────────────────────────────────

  function getPoint(e) {
    if (e.touches) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    return { x: e.clientX, y: e.clientY };
  }

  function handleDragStart(e) {
    startRef.current = getPoint(e);
    setDrag({ x: 0, y: 0, dragging: true });
  }

  function handleDragMove(e) {
    if (!drag.dragging || !startRef.current) return;
    const pt = getPoint(e);
    setDrag((d) => ({ ...d, x: pt.x - startRef.current.x, y: pt.y - startRef.current.y }));
  }

  function handleDragEnd() {
    if (!drag.dragging) return;
    const threshold = 100;
    if (drag.x > threshold) {
      triggerDecision('like');
    } else if (drag.x < -threshold) {
      triggerDecision('skip');
    } else {
      setDrag({ x: 0, y: 0, dragging: false });
    }
  }

  // ── Decision animation ─────────────────────────────────────────────────────

  function triggerDecision(type) {
    setDecision(type);
    const flyX = type === 'like' ? 600 : -600;
    setDrag({ x: flyX, y: 0, dragging: false });
    setTimeout(() => {
      setDecision(null);
      setDrag({ x: 0, y: 0, dragging: false });
      if (type === 'like') onLike(earring);
      else onSkip(earring);
    }, 350);
  }

  // ── Derived styles ─────────────────────────────────────────────────────────

  const rotate = drag.x / 20; // degrees
  const likeOpacity = Math.min(1, Math.max(0, drag.x / 100));
  const skipOpacity = Math.min(1, Math.max(0, -drag.x / 100));

  const cardTransform = {
    transform: `translateX(${drag.x}px) translateY(${drag.y * 0.3}px) rotate(${rotate}deg)`,
    transition: drag.dragging ? 'none' : 'transform 0.35s ease',
    cursor: drag.dragging ? 'grabbing' : 'grab',
    userSelect: 'none',
    touchAction: 'none',
  };

  return (
    <div style={wrapStyle}>
      {/* Remaining count */}
      <p style={remainingStyle}>{remaining} earrings left</p>

      {/* Card */}
      <div
        ref={cardRef}
        style={{ ...stackStyle, ...cardTransform }}
        onMouseDown={handleDragStart}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={handleDragStart}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
      >
        {/* LIKE stamp */}
        <div style={{ ...stampStyle, ...likeStampStyle, opacity: likeOpacity }}>
          LIKE ♥
        </div>
        {/* SKIP stamp */}
        <div style={{ ...stampStyle, ...skipStampStyle, opacity: skipOpacity }}>
          SKIP ✕
        </div>

        <EarringCard earring={earring}>
          {/* "Open in shop" link */}
          <a
            href={earring.link}
            target="_blank"
            rel="noreferrer"
            style={shopLinkStyle}
            onMouseDown={(e) => e.stopPropagation()}
          >
            View in shop →
          </a>
        </EarringCard>
      </div>

      {/* Buttons — like first so it appears on the right in RTL layout */}
      <div style={btnRowStyle}>
        <button style={{ ...btnStyle, ...likeBtnStyle }} onClick={() => triggerDecision('like')}>
          ♥
        </button>
        <button
          style={{ ...btnStyle, ...undoBtnStyle, opacity: canUndo ? 1 : 0.3 }}
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo last swipe"
        >
          ↩
        </button>
        <button style={{ ...btnStyle, ...skipBtnStyle }} onClick={() => triggerDecision('skip')}>
          ✕
        </button>
      </div>
    </div>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const wrapStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 24,
  padding: '0 16px',
};

const remainingStyle = {
  fontSize: 13,
  color: '#999',
  letterSpacing: 0.5,
};

const stackStyle = {
  width: '100%',
  maxWidth: 380,
  position: 'relative',
};

const stampStyle = {
  position: 'absolute',
  top: 24,
  padding: '6px 18px',
  borderRadius: 8,
  fontSize: 22,
  fontWeight: 800,
  letterSpacing: 2,
  zIndex: 10,
  pointerEvents: 'none',
  border: '3px solid',
};

const likeStampStyle = {
  left: 16,
  color: '#2ecc71',
  borderColor: '#2ecc71',
  transform: 'rotate(-15deg)',
};

const skipStampStyle = {
  right: 16,
  color: '#e74c3c',
  borderColor: '#e74c3c',
  transform: 'rotate(15deg)',
};

const shopLinkStyle = {
  display: 'block',
  textAlign: 'center',
  padding: '10px 0',
  color: '#c07850',
  fontSize: 14,
  textDecoration: 'none',
  fontWeight: 500,
  borderTop: '1px solid #f0e8e0',
};

const btnRowStyle = {
  display: 'flex',
  gap: 24,
  justifyContent: 'center',
  alignItems: 'center',
};

const btnStyle = {
  width: 64,
  height: 64,
  borderRadius: '50%',
  border: 'none',
  fontSize: 24,
  cursor: 'pointer',
  fontWeight: 700,
  boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
  transition: 'transform 0.1s',
};

const undoBtnStyle = {
  background: '#fff',
  color: '#888',
  width: 48,
  height: 48,
  fontSize: 20,
};

const skipBtnStyle = {
  background: '#fff',
  color: '#e74c3c',
};

const likeBtnStyle = {
  background: '#fff',
  color: '#2ecc71',
};
