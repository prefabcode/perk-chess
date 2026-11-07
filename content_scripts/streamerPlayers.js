import { emitStreamerEvent } from './streamerEvents.js';

const POLL_MS = 1000;
const RESEND_MS = 3000;

export const PLAYER_SELECTORS = {
  top: '.ruser-top',
  bottom: '.ruser-bottom',
};

let lastSent = null;
let lastPayload = null;
let lastSentAt = 0;
let warnedMissingName = false;

const readLinkedPlayer = (link) => {
  const name = [...link.childNodes]
    .filter((node) => node.nodeType === Node.TEXT_NODE)
    .map((node) => node.textContent)
    .join('')
    .trim() || (link.getAttribute('href') || '').split('/').pop();

  const title = link.querySelector('.utitle')?.textContent.trim() || null;
  return name ? { name, title } : null;
};

const readAnonymousPlayer = (box) => {
  const name = box.querySelector('name')?.textContent.trim();
  return name ? { name, title: null } : null;
};

const readPlayer = (selector) => {
  const box = document.querySelector(selector);
  if (!box) return null;

  const link = box.querySelector('a');
  const player = link ? readLinkedPlayer(link) : readAnonymousPlayer(box);

  if (!player && !warnedMissingName) {
    warnedMissingName = true;
    console.warn(`[perk-chess] ${selector} has no readable name; lichess player markup may have changed`);
  }
  return player;
};

const send = (payload, signature) => {
  lastSent = signature;
  lastPayload = payload;
  lastSentAt = Date.now();
  emitStreamerEvent(payload);
};

const poll = () => {
  const top = readPlayer(PLAYER_SELECTORS.top);
  const bottom = readPlayer(PLAYER_SELECTORS.bottom);

  if (!top && !bottom) {
    if (lastSent !== null) {
      lastSent = null;
      lastPayload = null;
      emitStreamerEvent({ type: 'players', top: null, bottom: null });
    }
    return;
  }

  const payload = { type: 'players', top, bottom };
  const signature = JSON.stringify([top, bottom]);

  if (signature !== lastSent) {
    send(payload, signature);
    return;
  }

  // a browser source that reloads mid-game only hears from us on change, so keep repeating;
  // nulls are never repeated or an idle lichess tab would keep blanking the game tab's names
  if (Date.now() - lastSentAt >= RESEND_MS) send(lastPayload, signature);
};

export const startPlayerMirror = () => {
  setInterval(poll, POLL_MS);
};
