import { useState } from 'react';
import ZoomModal from './ZoomModal';

function proxyUrl(url) {
  if (!url) return '';
  return `/api/image?url=${encodeURIComponent(url)}`;
}

export default function EarringCard({ earring, price, style, children }) {
  const [zoomed, setZoomed] = useState(false);
  const displayPrice = price || earring.price;

  return (
    <div style={{ ...cardStyle, ...style }}>
      <img
        src={proxyUrl(earring.image)}
        alt={earring.name}
        style={imgStyle}
        onClick={() => setZoomed(true)}
        onError={(e) => { e.target.style.display = 'none'; }}
      />

      {zoomed && (
        <ZoomModal
          src={proxyUrl(earring.image)}
          alt={earring.name}
          onClose={() => setZoomed(false)}
        />
      )}

      <div style={infoStyle}>
        <p style={nameStyle}>{earring.name}</p>
        {displayPrice && <p style={priceStyle}>{displayPrice}</p>}
        {earring.source && <p style={sourceStyle}>{earring.source}</p>}
      </div>
      {children}
    </div>
  );
}

const cardStyle = {
  background: '#fff',
  borderRadius: 20,
  overflow: 'hidden',
  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
};

const imgStyle = {
  width: '100%',
  flex: 1,
  minHeight: 0,
  objectFit: 'cover',
  objectPosition: 'center top',
  display: 'block',
  cursor: 'zoom-in',
};

const infoStyle = {
  padding: '12px 16px 8px',
  flexShrink: 0,
};

const nameStyle = {
  fontSize: 16,
  fontWeight: 600,
  color: '#222',
  marginBottom: 2,
};

const priceStyle = {
  fontSize: 15,
  color: '#c07850',
  fontWeight: 600,
  marginTop: 2,
};

const sourceStyle = {
  fontSize: 11,
  color: '#aaa',
  marginTop: 2,
  textTransform: 'uppercase',
  letterSpacing: 1,
};
