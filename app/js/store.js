// store.js — saved progress for the Vice City Trophy Ledger.
// Progress lives in localStorage under one key, as a list of earned trophy ids.
// Export writes that list to a file; import reads it back. No network is used.

export const STORE_KEY = 'vice-city-trophy-ledger-v1';

// The demo set: 13 trophies shown as earned when the page opens with ?demo=1,
// so screenshots and first looks show real progress.
export const DEMO_EARNED = [2, 3, 4, 8, 15, 16, 20, 21, 35, 42, 46, 52, 53];

export function loadEarned() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.earned)) return new Set();
    return new Set(parsed.earned.filter((n) => Number.isInteger(n)));
  } catch (_err) {
    return new Set();
  }
}

export function saveEarned(earned) {
  const payload = { app: 'vice-city-trophy-ledger', version: 1, earned: [...earned].sort((a, b) => a - b) };
  localStorage.setItem(STORE_KEY, JSON.stringify(payload));
  return payload;
}

export function isDemoMode() {
  return new URLSearchParams(location.search).get('demo') === '1';
}

export function applyDemoSeed(earned) {
  if (!isDemoMode()) return earned;
  const seeded = new Set(earned);
  for (const id of DEMO_EARNED) seeded.add(id);
  saveEarned(seeded);
  return seeded;
}

export function exportProgress(earned) {
  const payload = saveEarned(earned);
  const text = JSON.stringify(payload, null, 2);
  const blob = new Blob([text], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'vice-city-trophy-ledger-progress.json';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function importProgressFile(file) {
  const text = await file.text();
  const parsed = JSON.parse(text);
  const list = Array.isArray(parsed) ? parsed : parsed.earned;
  if (!Array.isArray(list)) throw new Error('That file has no earned list in it.');
  const earned = new Set(list.filter((n) => Number.isInteger(n)));
  saveEarned(earned);
  return earned;
}
