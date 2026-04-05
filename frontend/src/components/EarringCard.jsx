/**
 * Displays the earring image, name, price, and source shop.
 * Used both in the swipe stack and the likes grid.
 */
function proxyUrl(url) {
  if (!url) return '';
  return `/api/image?url=${encodeURIComponent(url)}`;
}

export default function EarringCard({ earring, style, children }) {
  return (
    <div style={{ ...cardStyle, ...style }}>
      <img
        src={proxyUrl(earring.image)}
        alt={earring.name}
        style={imgStyle}
        onError={(e) => {
          e.target.style.display = 'none';
        }}
      />
      <div style={infoStyle}>
        <p style={nameStyle}>{earring.name}</p>
        {earring.price && <p style={priceStyle}>{earring.price}</p>}
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
};

const imgStyle = {
  width: '100%',
  height: 420,
  objectFit: 'cover',
  objectPosition: 'center top',
  display: 'block',
};

const infoStyle = {
  padding: '16px 20px',
};

const nameStyle = {
  fontSize: 17,
  fontWeight: 600,
  color: '#222',
  marginBottom: 4,
};

const priceStyle = {
  fontSize: 15,
  color: '#c07850',
  fontWeight: 500,
};

const sourceStyle = {
  fontSize: 12,
  color: '#aaa',
  marginTop: 4,
  textTransform: 'uppercase',
  letterSpacing: 1,
};
