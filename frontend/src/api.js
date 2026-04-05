/**
 * All API calls in one place.
 * The React dev server proxies /api/* to http://localhost:3001
 * (configured via "proxy" in package.json).
 */

const BASE = '/api';

export async function getStatus() {
  const res = await fetch(`${BASE}/earrings/status`);
  if (!res.ok) throw new Error('Failed to get status');
  return res.json();
}

export async function getNextEarring() {
  const res = await fetch(`${BASE}/earrings/next`);
  if (!res.ok) throw new Error('Failed to get next earring');
  return res.json(); // { done, earring, remaining } or { done: true, message }
}

export async function skipEarring(link) {
  const res = await fetch(`${BASE}/earrings/skip`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ link }),
  });
  if (!res.ok) throw new Error('Failed to skip earring');
  return res.json();
}

export async function likeEarring(earring) {
  const res = await fetch(`${BASE}/likes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(earring),
  });
  if (!res.ok) throw new Error('Failed to like earring');
  return res.json();
}

export async function getLikes() {
  const res = await fetch(`${BASE}/likes`);
  if (!res.ok) throw new Error('Failed to get likes');
  return res.json();
}

export async function fetchPrice(link) {
  const res = await fetch(`${BASE}/price?link=${encodeURIComponent(link)}`);
  if (!res.ok) return '';
  const data = await res.json();
  return data.price || '';
}

export async function undoLastSwipe() {
  const res = await fetch(`${BASE}/earrings/undo`, { method: 'POST' });
  if (!res.ok) throw new Error('Nothing to undo');
  return res.json(); // { ok, earring }
}

export async function unlikeEarring(link) {
  const res = await fetch(`${BASE}/likes`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ link }),
  });
  if (!res.ok) throw new Error('Failed to unlike earring');
  return res.json();
}
