// boot.js — boot and hash routing for the Vice City Trophy Ledger.
// Loads app/data/trophies.json (a file under app/, never the network),
// restores saved progress, and renders the view the hash names.

import { loadEarned, saveEarned, applyDemoSeed, exportProgress, importProgressFile } from './store.js';
import { renderChecklist, renderDetail, renderProgress, renderRoadmap, renderMissables, renderSources } from './views.js';

const listPane = document.getElementById('listPane');
const detailPane = document.getElementById('detailPane');
const viewPane = document.getElementById('viewPane');
const toolbar = document.getElementById('toolbar');
const searchBox = document.getElementById('searchBox');
const spoilerToggle = document.getElementById('spoilerToggle');

const state = {
  trophies: [],
  earned: loadEarned(),
  kind: 'all',
  query: '',
  hideSpoilers: false,
  selectedId: null,
  route: 'checklist',
};

state.earned = applyDemoSeed(state.earned);

async function loadTrophies() {
  const response = await fetch('./data/trophies.json');
  if (!response.ok) throw new Error(`Could not load the trophy list (${response.status}).`);
  const data = await response.json();
  return data.trophies;
}

function readRoute() {
  const hash = location.hash.replace(/^#\/?/, '');
  const parts = hash.split('/');
  if (parts[0] === 'roadmap') return { route: 'roadmap' };
  if (parts[0] === 'missables') return { route: 'missables' };
  if (parts[0] === 'sources') return { route: 'sources' };
  if (parts[0] === 'trophy' && Number.isInteger(Number(parts[1]))) {
    return { route: 'checklist', selectedId: Number(parts[1]) };
  }
  return { route: 'checklist' };
}

function render() {
  const route = readRoute();
  state.route = route.route;
  if (route.selectedId) state.selectedId = route.selectedId;
  if (!state.selectedId && state.trophies.length) state.selectedId = state.trophies[0].id;

  document.querySelectorAll('.tabs a').forEach((a) => {
    a.classList.toggle('active', a.dataset.route === state.route);
  });
  toolbar.style.display = state.route === 'checklist' ? '' : 'none';

  if (state.route === 'checklist') {
    viewPane.hidden = true;
    viewPane.innerHTML = '';
    listPane.hidden = false;
    detailPane.hidden = false;
    renderChecklist(listPane, state.trophies, state);
    renderDetail(detailPane, state.trophies, state);
  } else {
    listPane.hidden = true;
    detailPane.hidden = true;
    viewPane.hidden = false;
    if (state.route === 'roadmap') renderRoadmap(viewPane, state.trophies, state);
    if (state.route === 'missables') renderMissables(viewPane, state.trophies, state);
    if (state.route === 'sources') renderSources(viewPane);
  }
  renderProgress(state.trophies, state);
}

function toggleEarned(id) {
  if (state.earned.has(id)) state.earned.delete(id);
  else state.earned.add(id);
  saveEarned(state.earned);
  render();
}

listPane.addEventListener('click', (event) => {
  const check = event.target.closest('[data-check]');
  if (check) {
    event.preventDefault();
    toggleEarned(Number(check.dataset.check));
    return;
  }
  const row = event.target.closest('[data-trophy]');
  if (row) {
    state.selectedId = Number(row.dataset.trophy);
    location.hash = `#/trophy/${state.selectedId}`;
    render();
  }
});

detailPane.addEventListener('click', (event) => {
  const btn = event.target.closest('[data-toggle-earned]');
  if (btn) toggleEarned(Number(btn.dataset.toggleEarned));
});

searchBox.addEventListener('input', () => {
  state.query = searchBox.value;
  if (state.route === 'checklist') renderChecklist(listPane, state.trophies, state);
});

document.getElementById('kindChips').addEventListener('click', (event) => {
  const chip = event.target.closest('[data-kind]');
  if (!chip) return;
  state.kind = chip.dataset.kind;
  document.querySelectorAll('#kindChips .chip').forEach((c) => c.classList.toggle('active', c === chip));
  if (state.route === 'checklist') renderChecklist(listPane, state.trophies, state);
});

spoilerToggle.addEventListener('change', () => {
  state.hideSpoilers = spoilerToggle.checked;
  render();
});

document.getElementById('exportBtn').addEventListener('click', () => exportProgress(state.earned));

document.getElementById('importBtn').addEventListener('click', () => {
  document.getElementById('importFile').click();
});

document.getElementById('importFile').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    state.earned = await importProgressFile(file);
    render();
  } catch (err) {
    alert(`Could not import that file: ${err.message}`);
  }
  event.target.value = '';
});

document.getElementById('resetBtn').addEventListener('click', () => {
  if (!confirm('Clear all earned trophies? This cannot be undone.')) return;
  state.earned = new Set();
  saveEarned(state.earned);
  render();
});

window.addEventListener('hashchange', render);

loadTrophies()
  .then((trophies) => {
    state.trophies = trophies;
    render();
  })
  .catch((err) => {
    listPane.innerHTML = `<p class="empty-note">The trophy list could not be loaded: ${err.message}</p>`;
  });
