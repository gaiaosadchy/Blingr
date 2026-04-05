import { useState, useRef } from 'react';
import EarringCard from './EarringCard';

/**
 * Swipeable card — fills all available vertical space so buttons are
 * always visible without scrolling on mobile.
 */
export default function SwipeCard({ earring, price, onLike, onSkip, onUndo, canUndo }) {
  const [drag, setDrag] = useState({ x: 0, y: 0, dragging: false });
  const startRef = useRef(null);

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
    if (drag.x > 100) triggerDecision('like');
    else if (drag.x < -100) triggerDecision('skip');
    else setDrag({ x: 0, y: 0, dragging: false });
  }

  // ── Decision animation ─────────────────────────────────────────────────────

  function triggerDecision(type) {
    const flyX = type === 'like' ? 600 : -600;
    setDrag({ x: flyX, y: 0, dragging: false });
    setTimeout(() => {
      setDrag({ x: 0, y: 0, dragging: false });
      if (type === 'like') onLike(earring);
      else onSkip(earring);
    }, 350);
  }

  // ── Derived styles ─────────────────────────────────────────────────────────

  const rotate = drag.x / 20;
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
      {/* Card — fills all space above the buttons */}
      <div style={{ ...cardWrapStyle, ...cardTransform }}
        onMouseDown={handleDragStart}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={handleDragStart}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
      >
        {/* LIKE stamp */}
        <div style={{ ...stampStyle, ...likeStampStyle, opacity: likeOpacity }}>LIKE ♥</div>
        {/* SKIP stamp */}
        <div style={{ ...stampStyle, ...skipStampStyle, opacity: skipOpacity }}>SKIP ✕</div>

        <EarringCard earring={earring} price={price}>
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

      {/* Buttons — always at the bottom, never hidden */}
      <div style={btnRowStyle}>
        <button style={{ ...btnStyle, ...likeBtnStyle }} onClick={() => triggerDecision('like')}>♥</button>
        <button
          style={{ ...btnStyle, ...undoBtnStyle, opacity: canUndo ? 1 : 0.3 }}
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo last swipe"
        >↩</button>
        <button style={{ ...btnStyle, ...skipBtnStyle }} onClick={() => triggerDecision('skip')}>✕</button>
      </div>
    </div>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────────────

const wrapStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '100%',
  height: '100%',
  padding: '8px 16px 0',
  boxSizing: 'border-box',
};

const cardWrapStyle = {
  flex: 1,
  minHeight: 0,           // allows flex child to shrink below its content size
  width: '100%',
  maxWidth: 420,
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
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
  flexShrink: 0,
};

const btnRowStyle = {
  display: 'flex',
  gap: 24,
  justifyContent: 'center',
  alignItems: 'center',
  padding: '16px 0 20px',
  flexShrink: 0,
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
  WebkitTapHighlightColor: 'transparent',
};

const undoBtnStyle = {
  background: '#fff',
  color: '#888',
  width: 48,
  height: 48,
  fontSize: 20,
};

const skipBtnStyle = { background: '#fff', color: '#e74c3c' };
const likeBtnStyle = { background: '#fff', color: '#2ecc71' };
