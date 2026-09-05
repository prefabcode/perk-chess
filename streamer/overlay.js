import {
  PERK_METADATA,
  PERK_GRADIENTS,
  PERK_UNLOCK_ORDERS,
  SPECIALIZATION_NAMES,
} from '../content_scripts/perkConstants.js';
import { PERK_SUMMARIES } from './perkSummaries.js';

const IMG_BASE = '../imgs';
const DEFAULT_BG = 'https://lichess1.org/assets/hashed/bg27.3214f8d2.webp';
const FALLBACK_GRADIENT = 'linear-gradient(to right, #37474f, #263238)';
const TOAST_MS = 6000;
const TOAST_LIMIT = 5;
const BANNER_MS = 3800;
const LOW_CLOCK_SECONDS = 10;

const params = new URLSearchParams(location.search);
const isDemo = params.has('demo');
const showGuides = params.has('guides');

const perkByName = new Map(PERK_METADATA.map((perk) => [perk.internalName, perk]));

const el = (id) => document.getElementById(id);
const h = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
};

const dom = {
  root: document.documentElement,
  overlay: el('overlay'),
  prestige: el('prestige'),
  prestigeImg: el('prestige-img'),
  prestigeLabel: el('prestige-label'),
  levelValue: el('level-value'),
  xpFill: el('xp-fill'),
  xpValue: el('xp-value'),
  streak: el('streak'),
  specialization: el('specialization'),
  specValue: el('spec-value'),
  nextKicker: el('next-kicker'),
  nextLevel: el('next-level'),
  nextIcon: el('next-icon'),
  nextName: el('next-name'),
  nextObjective: el('next-objective'),
  nextAway: el('next-away'),
  camera: el('camera'),
  cameraFrame: document.querySelector('.camera__frame'),
  boardSlot: el('board-slot'),
  clockTop: el('clock-top'),
  clockTopTime: el('clock-top-time'),
  clockBottom: el('clock-bottom'),
  clockBottomTime: el('clock-bottom-time'),
  perks: el('perks'),
  toasts: el('toasts'),
  banner: el('banner'),
  guides: el('guides'),
  guideBoard: el('guide-board'),
  guideCamera: el('guide-camera'),
};

let canvasScale = 1;
let bannerTimer = null;
let clockSync = { top: null, bottom: null, running: null, at: 0 };
const painted = { top: '', bottom: '' };

/* ---------- layout ---------- */

function layout() {
  const fixedWidth = Number(params.get('w'));
  const fixedHeight = Number(params.get('h'));
  const isFixed = fixedWidth > 0 && fixedHeight > 0;
  const viewWidth = isFixed ? fixedWidth : window.innerWidth;
  const viewHeight = isFixed ? fixedHeight : window.innerHeight;

  dom.root.style.fontSize = `${Math.min(22, Math.max(11, viewHeight * 0.014))}px`;

  const boardParam = Number(params.get('board'));
  const board = boardParam > 0 ? boardParam : Math.min(viewHeight * 0.86, 900);
  dom.root.style.setProperty('--board-size', `${board}px`);

  const cameraParam = params.get('camera');
  if (cameraParam) {
    dom.root.style.setProperty('--camera-aspect', cameraParam.replace(/[x:]/, ' / '));
  }

  if (isFixed) {
    dom.overlay.classList.add('is-fixed');
    dom.overlay.style.width = `${viewWidth}px`;
    dom.overlay.style.height = `${viewHeight}px`;
    canvasScale = Math.min(window.innerWidth / viewWidth, window.innerHeight / viewHeight);
    dom.overlay.style.transform = `translate(-50%, -50%) scale(${canvasScale})`;
  }

  renderGuides();
}

function applyBackground() {
  const requested = params.get('bg');
  if (requested === 'none') {
    dom.overlay.classList.add('is-bare');
    return;
  }
  dom.root.style.setProperty('--bg-image', `url("${requested || DEFAULT_BG}")`);
}

function renderGuides() {
  if (!showGuides) return;
  dom.guides.hidden = false;
  placeGuide(dom.guideBoard, dom.boardSlot, 'Board capture');
  placeGuide(dom.guideCamera, dom.cameraFrame, 'Camera');
}

function placeGuide(guide, target, name) {
  const origin = dom.overlay.getBoundingClientRect();
  const rect = target.getBoundingClientRect();
  const x = (rect.left - origin.left) / canvasScale;
  const y = (rect.top - origin.top) / canvasScale;
  const width = rect.width / canvasScale;
  const height = rect.height / canvasScale;

  guide.style.left = `${x}px`;
  guide.style.top = `${y}px`;
  guide.style.width = `${width}px`;
  guide.style.height = `${height}px`;
  guide.classList.toggle('guide--inside-label', y < 32);
  guide.querySelector('.guide__label').textContent =
    `${name}  ${Math.round(width)} × ${Math.round(height)} @ ${Math.round(x)}, ${Math.round(y)}`;
}

/* ---------- state ---------- */

function renderState(state) {
  dom.root.style.setProperty('--hue-deg', state.hueDeg ?? 0);

  dom.levelValue.textContent = state.level ?? 1;
  dom.xpFill.style.width = `${Math.min(100, Math.max(0, state.hue ?? 0))}%`;
  dom.xpValue.textContent = `${state.hue ?? 0} / 100`;

  const emblem = state.prestigeEmblem ?? 0;
  dom.prestige.hidden = emblem < 1;
  if (emblem >= 1) {
    dom.prestigeImg.src = `${IMG_BASE}/prestige/prestige-${emblem}.png`;
    dom.prestigeLabel.textContent = `Prestige ${state.prestige}`;
  }

  const spec = state.specialization ?? {};
  dom.specialization.hidden = !spec.unlocked;
  if (spec.unlocked) {
    dom.specValue.textContent = SPECIALIZATION_NAMES[spec.index] ?? '—';
  }

  const streak = state.winningStreak ?? 0;
  dom.streak.hidden = streak < 2;
  dom.streak.textContent = `${streak} win streak`;

  renderPerks(state.perks ?? [], state.maxPerks ?? 2);
  renderNextUnlock(state);
}

function renderNextUnlock(state) {
  const level = state.level ?? 1;
  const next = state.nextUnlock;

  if (next) {
    const meta = perkByName.get(next.id);
    const away = next.level - level;

    dom.nextKicker.textContent = 'Next unlock';
    dom.nextLevel.textContent = `Level ${next.level}`;
    dom.nextIcon.src = `${IMG_BASE}/${next.id}.svg`;
    dom.nextIcon.classList.remove('is-emblem');
    dom.nextName.textContent = meta?.displayName ?? next.id;
    dom.nextObjective.hidden = true;
    dom.nextAway.textContent = away === 1 ? '1 level away' : `${away} levels away`;
    return;
  }

  const levelCap = state.levelCap ?? 15;
  const nextPrestige = (state.prestige ?? 0) + 1;
  const away = Math.max(0, levelCap - level);

  dom.nextKicker.textContent = 'Next milestone';
  dom.nextLevel.textContent = `Level ${levelCap}`;
  dom.nextIcon.src = `${IMG_BASE}/prestige/prestige-${((nextPrestige - 1) % 5) + 1}.png`;
  dom.nextIcon.classList.add('is-emblem');
  dom.nextName.textContent = `Prestige ${nextPrestige}`;
  dom.nextObjective.hidden = false;
  dom.nextObjective.textContent = 'Every perk unlocked';
  dom.nextAway.textContent = away === 1 ? '1 level away' : `${away} levels away`;
}

function renderPerks(perks, maxPerks) {
  const slots = [];
  for (let i = 0; i < maxPerks; i += 1) {
    slots.push(perks[i] ? perkCard(perks[i]) : h('div', 'perk--empty', 'Perk slot open'));
  }
  dom.perks.replaceChildren(...slots);
}

function perkCard({ id, badge }) {
  const meta = perkByName.get(id);
  const summary = PERK_SUMMARIES[id] ?? {};

  const card = h('div', 'perk');

  const head = h('div', 'perk__head');
  head.style.background = PERK_GRADIENTS[id] ?? FALLBACK_GRADIENT;
  const icon = h('img', 'perk__icon');
  icon.src = `${IMG_BASE}/${id}.svg`;
  icon.alt = '';
  head.append(icon, h('span', 'perk__name', meta?.displayName ?? id));
  if (summary.xp) head.append(h('span', 'perk__xp', summary.xp));

  const body = h('div', 'perk__body');
  body.append(h('span', 'perk__objective', summary.objective ?? ''));
  const badgeNode = perkBadge(badge, summary.badgeLabel);
  if (badgeNode) body.append(badgeNode);

  card.append(head, body);
  return card;
}

function perkBadge(badge, label) {
  if (badge == null) return null;
  const node = h('span', 'perk__badge');
  const value = typeof badge === 'boolean' ? (badge ? '✓' : '✗') : badge;
  node.append(h('span', 'perk__badge-value', value));
  if (label) node.append(h('span', 'perk__badge-label', label));
  return node;
}

/* ---------- clocks ---------- */

function syncClock(payload) {
  clockSync = {
    top: payload.top,
    bottom: payload.bottom,
    running: payload.running,
    at: performance.now(),
  };
}

function currentClock(side) {
  const base = clockSync[side];
  if (base == null) return null;
  if (clockSync.running !== side) return base;
  return Math.max(0, base - (performance.now() - clockSync.at) / 1000);
}

function formatClock(seconds) {
  if (seconds == null || Number.isNaN(seconds)) return '--:--';
  const value = Math.max(0, seconds);
  const pad = (n) => String(Math.floor(n)).padStart(2, '0');
  const hours = Math.floor(value / 3600);
  const minutes = Math.floor((value % 3600) / 60);
  const rest = value % 60;

  if (hours > 0) return `${hours}:${pad(minutes)}:${pad(rest)}`;
  if (value < 20) return `${minutes}:${pad(rest)}.${Math.floor((rest % 1) * 10)}`;
  return `${minutes}:${pad(rest)}`;
}

function paintClock(side, box, timeNode) {
  const value = currentClock(side);
  const text = formatClock(value);
  if (painted[side] !== text) {
    timeNode.textContent = text;
    painted[side] = text;
  }
  box.classList.toggle('is-running', clockSync.running === side);
  box.classList.toggle('is-low', value != null && value <= LOW_CLOCK_SECONDS);
}

function tickClocks() {
  paintClock('top', dom.clockTop, dom.clockTopTime);
  paintClock('bottom', dom.clockBottom, dom.clockBottomTime);
  requestAnimationFrame(tickClocks);
}

/* ---------- transient ---------- */

function pushToast({ perkId, message }) {
  const toast = h('div', 'toast');
  toast.style.background = PERK_GRADIENTS[perkId] ?? FALLBACK_GRADIENT;

  if (perkId !== 'total-earned') {
    const icon = h('img', 'toast__icon');
    icon.src = `${IMG_BASE}/${perkId}.svg`;
    icon.alt = '';
    toast.append(icon);
  }
  toast.append(h('span', 'toast__text', message));
  dom.toasts.append(toast);

  while (dom.toasts.childElementCount > TOAST_LIMIT) {
    dom.toasts.firstElementChild.remove();
  }
  updateDim();

  setTimeout(() => {
    toast.classList.add('is-leaving');
    toast.addEventListener('animationend', () => {
      toast.remove();
      updateDim();
    }, { once: true });
  }, TOAST_MS);
}

function updateDim() {
  dom.perks.classList.toggle('is-dimmed', dom.toasts.childElementCount > 0);
}

function showBanner(kicker, value) {
  clearTimeout(bannerTimer);
  dom.banner.classList.remove('is-leaving');
  dom.banner.replaceChildren(
    h('span', 'banner__kicker', kicker),
    h('span', 'banner__value', value),
  );
  dom.banner.hidden = true;
  void dom.banner.offsetWidth;
  dom.banner.hidden = false;

  bannerTimer = setTimeout(() => {
    dom.banner.classList.add('is-leaving');
    dom.banner.addEventListener('animationend', () => {
      dom.banner.hidden = true;
      dom.banner.classList.remove('is-leaving');
    }, { once: true });
  }, BANNER_MS);
}

/* ---------- transport ---------- */

function handlePayload(payload) {
  if (!payload || payload.v !== 1) return;

  switch (payload.type) {
    case 'state':
      renderState(payload);
      break;
    case 'clock':
      syncClock(payload);
      break;
    case 'toast':
      pushToast(payload);
      break;
    case 'levelup':
      showBanner('Level up', payload.level);
      break;
    case 'prestige':
      showBanner('Prestige', payload.prestige);
      break;
  }
}

window.addEventListener('hue-chess', (event) => handlePayload(event.detail));

/* ---------- demo ---------- */

function startDemo() {
  const number = (name, fallback) => {
    const raw = params.get(name);
    return raw == null || raw === '' ? fallback : Number(raw);
  };

  const demo = {
    level: number('level', 7),
    hue: number('hue', 64),
    prestige: number('prestige', 2),
    specIndex: number('spec', 0),
    perkCount: number('perks', 2),
    streak: number('streak', 3),
    perks: [{ id: 'gladiator', badge: 3 }, { id: 'versatility', badge: 5 }],
  };

  const nextUnlockFor = (level, specIndex) => {
    const order = PERK_UNLOCK_ORDERS[specIndex];
    if (!order) return null;
    const upcoming = order
      .filter((entry) => entry.level > level)
      .sort((a, b) => a.level - b.level)[0];
    if (!upcoming) return null;
    const meta = PERK_METADATA.find((perk) => perk.id === upcoming.id);
    return { id: meta.internalName, level: upcoming.level };
  };

  const publish = () => handlePayload({
    v: 1,
    type: 'state',
    ts: Date.now(),
    level: demo.level,
    levelCap: 15,
    hue: demo.hue,
    hueDeg: (demo.hue / 100) * 360,
    prestige: demo.prestige,
    prestigeEmblem: demo.prestige > 0 ? ((demo.prestige - 1) % 5) + 1 : 0,
    specialization: { index: demo.specIndex, unlocked: demo.prestige >= 1 },
    maxPerks: 2,
    perks: demo.perks.slice(0, demo.perkCount),
    nextUnlock: nextUnlockFor(demo.level, demo.specIndex),
    winningStreak: demo.streak,
    inGame: true,
    preparationMet: false,
  });

  const clock = { top: 154, bottom: 118, running: 'bottom' };
  setInterval(() => {
    clock[clock.running] = Math.max(0, clock[clock.running] - 0.5);
    handlePayload({ v: 1, type: 'clock', ts: Date.now(), ...clock });
  }, 500);
  setInterval(() => {
    clock.running = clock.running === 'top' ? 'bottom' : 'top';
  }, 5000);

  const toastable = PERK_METADATA.map((perk) => perk.internalName);

  const demoToast = (id, points) => {
    const name = perkByName.get(id)?.displayName ?? id;
    pushToast({ perkId: id, message: `${name}: ${points} points` });
  };
  if (params.get('fx') !== '0') {
    setTimeout(() => demoToast('gladiator', 14), 700);
    setTimeout(() => demoToast('versatility', 4), 1000);
    setTimeout(() => pushToast({ perkId: 'total-earned', message: 'Total XP Earned: 27 points' }), 1300);
    setTimeout(() => showBanner('Level up', demo.level + 1), 2600);
  }

  document.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();

    if (key >= '1' && key <= '9') {
      const id = toastable[Number(key) - 1];
      const summary = PERK_SUMMARIES[id] ?? {};
      pushToast({ perkId: id, message: `${perkByName.get(id).displayName}: ${summary.xp ?? '+5'} points` });
      return;
    }

    switch (key) {
      case '0':
        pushToast({ perkId: 'total-earned', message: 'Total XP Earned: 27 points' });
        break;
      case 'l':
        demo.level = Math.min(15, demo.level + 1);
        demo.hue = 12;
        showBanner('Level up', demo.level);
        publish();
        break;
      case 'p':
        demo.prestige += 1;
        showBanner('Prestige', demo.prestige);
        publish();
        break;
      case 's':
        demo.specIndex = (demo.specIndex + 1) % SPECIALIZATION_NAMES.length;
        publish();
        break;
      case 'e':
        demo.perkCount = (demo.perkCount + 2) % 3;
        publish();
        break;
      case 'r':
        demo.prestige = demo.prestige > 0 ? 0 : 2;
        publish();
        break;
      case 'arrowup':
        demo.hue = (demo.hue + 5) % 100;
        publish();
        break;
      case 'arrowdown':
        demo.hue = (demo.hue + 95) % 100;
        publish();
        break;
    }
  });

  publish();
}

/* ---------- boot ---------- */

const missingSummaries = PERK_METADATA
  .filter((perk) => !PERK_SUMMARIES[perk.internalName])
  .map((perk) => perk.internalName);
if (missingSummaries.length) {
  console.warn(`[perk-chess overlay] no stream summary for: ${missingSummaries.join(', ')}`);
}

if (globalThis.chrome?.storage?.local) {
  const live = document.createElement('script');
  live.src = 'overlay-live.js';
  document.head.append(live);
}

applyBackground();
window.addEventListener('resize', layout);
layout();
requestAnimationFrame(tickClocks);

if (isDemo) startDemo();
