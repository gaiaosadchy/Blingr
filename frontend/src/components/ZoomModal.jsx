import { useEffect } from 'react';

export default function ZoomModal({ src, alt, onClose }) {
  // Close on Escape key
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div style={overlayStyle} onClick={onClose}>
      <button style={closeBtnStyle} onClick={onClose}>✕</button>
      {/* stopPropagation so clicking the image itself doesn't close */}
      <img
        src={src}
        alt={alt}
        style={imgStyle}
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  zIndex: 1000,
  background: 'rgba(0,0,0,0.92)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 16,
};

const closeBtnStyle = {
  position: 'absolute',
  top: 16,
  right: 16,
  background: 'rgba(255,255,255,0.15)',
  border: 'none',
  color: '#fff',
  fontSize: 22,
  width: 44,
  height: 44,
  borderRadius: '50%',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const imgStyle = {
  maxWidth: '100%',
  maxHeight: '90dvh',
  objectFit: 'contain',
  borderRadius: 12,
  boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
};
