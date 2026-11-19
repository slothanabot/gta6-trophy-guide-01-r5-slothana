// filters.js — kind filter, search, and the spoiler rule for the ledger.
// Spoiler rule: when hiding is on, a hidden story trophy that is not yet earned
// shows a placeholder name and description instead of the official ones.

export const KIND_LABELS = {
  story: 'Story',
  missable: 'Missable',
  collectibles: 'Collectibles',
  activities: 'Activities',
  online: 'Online',
};

export function spoilerHidden(trophy, earned, hideSpoilers) {
  return hideSpoilers && trophy.hidden && !earned.has(trophy.id);
}

export function displayName(trophy, earned, hideSpoilers) {
  if (spoilerHidden(trophy, earned, hideSpoilers)) return 'Hidden trophy';
  return trophy.name;
}

export function displayDescription(trophy, earned, hideSpoilers) {
  if (spoilerHidden(trophy, earned, hideSpoilers)) {
    return 'Earn this trophy to reveal its name and description.';
  }
  return trophy.description;
}

export function filterTrophies(trophies, state) {
  const query = state.query.trim().toLowerCase();
  return trophies.filter((t) => {
    if (state.kind === 'story' && t.kind !== 'story') return false;
    if (state.kind === 'missable' && !t.missable) return false;
    if (state.kind === 'collectibles' && t.kind !== 'collectibles') return false;
    if (state.kind === 'activities' && t.kind !== 'activities') return false;
    if (state.kind === 'online') return false;
    if (query) {
      const hay = `${t.name} ${t.description} ${t.guide}`.toLowerCase();
      if (!hay.includes(query)) return false;
    }
    return true;
  });
}

export function gradeCounts(trophies, earned) {
  const counts = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  const totals = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const t of trophies) {
    totals[t.grade] += 1;
    if (earned.has(t.id)) counts[t.grade] += 1;
  }
  return { counts, totals };
}
