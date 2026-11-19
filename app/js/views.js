// views.js — every screen of the Vice City Trophy Ledger:
// the checklist with its guide pane, the roadmap, the missables page and sources.

import { displayName, displayDescription, filterTrophies, gradeCounts, KIND_LABELS } from './filters.js';

export const STAGES = [
  { n: 1, title: 'Play the story', text: 'Chapters 1 to 4, the final mission and the story missions inside them. Do the chapter-gated things as they appear — there is no mission replay.' },
  { n: 2, title: 'Side strands & one-off moments', text: 'Stranger questlines and their finales, Bret’s hunting, and the one-off moments (tank, plane, bowling alley, cocktail). Side finales stay open after the credits.' },
  { n: 3, title: 'Free-roam grind', text: 'Activities, races, shooting ranges, robberies and the long counters. Most of this stays open after the story, so grind it at your own pace.' },
  { n: 4, title: 'Collectibles & cleanup', text: 'Cards, WAiNK tags, vehicles, garages, meditation spots and full exploration. Tag and scan as you travel so the cleanup is short.' },
  { n: 5, title: '100% & platinum', text: 'Finish the in-game 100% checklist, then the platinum pops on its own. A Long Road is the last gold for most players.' },
];

export const MISSABLE_REASONS = {
  2: 'The opening mission, Gone Fishing, plays once in Chapter 1 — no mission replay.',
  3: 'Chapter 1 ends once and cannot be replayed; keep a manual save at the chapter start.',
  4: 'Chapter 2 ends once and cannot be replayed; keep a manual save at the chapter start.',
  5: 'Chapter 3 ends once and cannot be replayed. Do the time-sensitive Yago race while you are here.',
  6: 'Chapter 4 ends once and cannot be replayed; do the optional vault mission before the credits.',
  7: 'The final mission plays once. Keep a manual save from just before it.',
  8: 'Story mission Breakfast Run plays once; character switching opens right after it.',
  9: 'Story mission The Cartel Heist plays once.',
  10: 'Story mission Child’s Play plays once.',
  11: 'Story mission Headliners plays once.',
  12: 'Story mission VCIA Takedown plays once.',
  13: 'Story mission Operation Savage Glory plays once.',
  25: 'Race Against Yago in Chapter 3 is time-sensitive — an hourglass icon marks it. Save first, race it the moment it appears.',
  28: 'Lucia’s balcony meditation in Chapter 1 disappears once the chapter ends. Do it in Chapter 1 and keep a Chapter 1 save.',
};

export const SOURCE_NOTES = [
  { name: 'Exophase', site: 'exophase.com', note: 'The official trophy list: every name, description and grade, as PlayStation publishes it.' },
  { name: 'PSNProfiles', site: 'psnprofiles.com', note: 'The official trophy list cross-checked, plus the progress target PSN tracks for each counted trophy (for example 250 stunts, 42 Shooting Range challenges).' },
  { name: 'PowerPyx', site: 'powerpyx.com', note: 'GTA 6 Trophy Guide & Roadmap: difficulty and time estimates, the no-mission-replay warning, and which trophies were still unpinned at launch.' },
  { name: 'OutputLag', site: 'outputlag.com', note: 'GTA 6 Trophy List: chapter-save advice, the Chapter 1 meditation warning, the Yago race warning, and step details for the robbery and free-roam trophies.' },
  { name: 'GTABase', site: 'gtabase.com', note: 'GTA 6 achievements and trophies list: grades, Gamerscore values and hidden flags, agreeing with the lists above.' },
];

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function gradePill(grade) {
  return `<span class="pill ${escapeHtml(grade)}">${escapeHtml(grade)}</span>`;
}

export function trophyRowHtml(t, state) {
  const earned = state.earned.has(t.id);
  const name = displayName(t, state.earned, state.hideSpoilers);
  const desc = displayDescription(t, state.earned, state.hideSpoilers);
  const target = t.target ? `<span class="tag">PSN target: ${escapeHtml(String(t.target))}</span>` : '';
  const missable = t.missable ? '<span class="tag missable">Missable</span>' : '';
  const hiddenTag = t.hidden && !earned ? '<span class="hidden-tag"> · hidden</span>' : '';
  const earnedTag = earned ? '<span class="tag earned-tag">Earned</span>' : '';
  const selected = state.selectedId === t.id ? ' selected' : '';
  return `<button type="button" class="trophy-row${earned ? ' earned' : ''}${selected}" data-trophy="${t.id}">
    <input type="checkbox" ${earned ? 'checked' : ''} aria-label="Mark ${escapeHtml(name)} as earned" data-check="${t.id}">
    <span>
      <span class="trophy-name">${escapeHtml(name)}${hiddenTag}</span>
      <span class="trophy-desc">${escapeHtml(desc)}</span>
      <span class="trophy-meta">${gradePill(t.grade)}<span class="tag">${escapeHtml(KIND_LABELS[t.kind] || t.kind)}</span>${missable}${target}${earnedTag}</span>
    </span>
    <span aria-hidden="true">›</span>
  </button>`;
}

export function renderChecklist(listPane, trophies, state) {
  const shown = filterTrophies(trophies, state);
  if (shown.length === 0) {
    listPane.innerHTML = `<p class="empty-note">No trophies match. There are no online trophies in GTA 6 at launch — the whole list is single-player, so the Online filter is empty by design. Try another filter or clear the search.</p>`;
    return;
  }
  listPane.innerHTML = shown.map((t) => trophyRowHtml(t, state)).join('');
}

export function renderDetail(detailPane, trophies, state) {
  const t = trophies.find((x) => x.id === state.selectedId) || trophies[0];
  if (!t) {
    detailPane.innerHTML = '<p class="empty-note">Pick a trophy to read its guide.</p>';
    return;
  }
  const earned = state.earned.has(t.id);
  const name = displayName(t, state.earned, state.hideSpoilers);
  const desc = displayDescription(t, state.earned, state.hideSpoilers);
  const stage = STAGES.find((s) => s.n === t.stage);
  const sources = t.sources.map((s) => escapeHtml(s)).join(' · ');
  detailPane.innerHTML = `
    <h2>${escapeHtml(name)}</h2>
    <p class="official">Official: “${escapeHtml(desc)}”</p>
    <p>${gradePill(t.grade)} <span class="tag">${escapeHtml(KIND_LABELS[t.kind] || t.kind)}</span>${t.missable ? '<span class="tag missable">Missable</span>' : ''}${t.hidden ? '<span class="tag">Hidden on PSN</span>' : ''}${t.target ? `<span class="tag">PSN target: ${escapeHtml(String(t.target))}</span>` : ''}${earned ? '<span class="tag earned-tag">Earned</span>' : ''}</p>
    <h3>Guide</h3>
    <p>${escapeHtml(t.guide)}</p>
    ${t.missable ? `<h3>When it can be missed</h3><p>${escapeHtml(MISSABLE_REASONS[t.id] || 'Tied to a story moment with no mission replay — do it when it appears.')}</p>` : ''}
    <h3>Roadmap</h3>
    <p>Stage ${t.stage} — ${escapeHtml(stage ? stage.title : '')}. ${escapeHtml(stage ? stage.text : '')}</p>
    <p class="sources"><b>Sources:</b> ${sources}. Names, descriptions and grades are the official list; the guide above is written for this ledger in our own words.</p>
    <p><button type="button" class="btn" data-toggle-earned="${t.id}">${earned ? 'Mark as not earned' : 'Mark as earned'}</button></p>`;
}

export function renderProgress(trophies, state) {
  const earnedCount = state.earned.size;
  document.getElementById('earnedCount').textContent = String(earnedCount);
  document.getElementById('progressFill').style.width = `${Math.round((earnedCount / trophies.length) * 100)}%`;
  const { counts, totals } = gradeCounts(trophies, state.earned);
  document.getElementById('progressGrades').textContent =
    `Platinum ${counts.platinum}/${totals.platinum} · Gold ${counts.gold}/${totals.gold} · Silver ${counts.silver}/${totals.silver} · Bronze ${counts.bronze}/${totals.bronze}`;
}

export function renderRoadmap(viewPane, trophies, state) {
  const blocks = STAGES.map((stage) => {
    const items = trophies.filter((t) => t.stage === stage.n);
    const done = items.filter((t) => state.earned.has(t.id)).length;
    const rows = items.map((t) => {
      const name = displayName(t, state.earned, state.hideSpoilers);
      const doneClass = state.earned.has(t.id) ? ' class="done"' : '';
      const miss = t.missable ? ' ⚠ missable' : '';
      return `<li${doneClass}>${state.earned.has(t.id) ? '✓ ' : ''}${escapeHtml(name)} — ${gradePill(t.grade)}${miss}</li>`;
    }).join('');
    return `<section class="stage"><h3>Stage ${stage.n} — ${escapeHtml(stage.title)} <span class="stage-count">${done}/${items.length} earned</span></h3><p>${escapeHtml(stage.text)}</p><ul>${rows}</ul></section>`;
  }).join('');
  viewPane.innerHTML = `
    <h2>Roadmap to the platinum</h2>
    <p class="lede">Five stages, in order, built from the official descriptions: which story chapters and missions, which collectibles and counts. The platinum, Vice Got a Price!, pops when the other 54 are done — about 200 hours by the launch guides’ estimate, difficulty 4/10.</p>
    ${blocks}`;
}

export function renderMissables(viewPane, trophies, state) {
  const items = trophies.filter((t) => t.missable);
  const done = items.filter((t) => state.earned.has(t.id)).length;
  const cards = items.map((t) => {
    const name = displayName(t, state.earned, state.hideSpoilers);
    const desc = displayDescription(t, state.earned, state.hideSpoilers);
    return `<article class="missable-card"><h3>${escapeHtml(name)} ${gradePill(t.grade)}</h3>
      <p><b>Official:</b> “${escapeHtml(desc)}”</p>
      <p><b>Why it is flagged:</b> ${escapeHtml(MISSABLE_REASONS[t.id] || '')}</p>
      <p>${escapeHtml(t.guide)}</p>
      <p class="sources"><b>Sources:</b> ${t.sources.map((s) => escapeHtml(s)).join(' · ')}</p></article>`;
  }).join('');
  viewPane.innerHTML = `
    <h2>Missable trophies — ${done}/${items.length} earned</h2>
    <p class="lede">14 trophies are flagged missable. GTA 6 has no mission replay and no New Game Plus, so anything tied to a story mission or a chapter window is flagged: play it when it appears, and keep a manual save at the start of every chapter plus one before the final mission. The two that are easy to actually miss are Positive Mental Attitude (the Chapter 1 balcony meditation) and the time-sensitive Yago race inside Strangers &amp; Freaks.</p>
    <div class="warn-box"><b>Save discipline:</b> the game has 15 manual save slots plus one autosave. Keep one save at the start of each chapter and one untouched save from just before the final mission, and rotate the rest. Never use cheats on your trophy save — they should switch off trophies and saving.</div>
    ${cards}`;
}

export function renderSources(viewPane) {
  const cards = SOURCE_NOTES.map((s) => `<article class="source-card"><h3>${escapeHtml(s.name)}</h3><p>${escapeHtml(s.site)}</p><p>${escapeHtml(s.note)}</p></article>`).join('');
  viewPane.innerHTML = `
    <h2>Sources</h2>
    <p class="lede">Every guide in this ledger names its sources beside it. The official names, descriptions and grades come from the PlayStation list as published on Exophase and PSNProfiles; the how-to detail draws on the launch guides below, rewritten here in our own words — never copied. Where a launch guide had not yet pinned a trophy down, the guide says so plainly instead of inventing a step.</p>
    ${cards}`;
}
