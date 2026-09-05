import { emitStreamerEvent } from './streamerEvents.js';

const POLL_MS = 500;

export const CLOCK_SELECTORS = {
  top: '.rclock-top',
  bottom: '.rclock-bottom',
};

let lastSent = null;
let warnedMissingTime = false;

export const parseClockText = (text) => {
  const parts = text.trim().split(':');
  if (parts.length < 2 || parts.length > 3) return null;

  const numbers = parts.map(Number);
  if (numbers.some(Number.isNaN)) return null;

  return parts.length === 3
    ? numbers[0] * 3600 + numbers[1] * 60 + numbers[2]
    : numbers[0] * 60 + numbers[1];
};

const readSide = (selector) => {
  const clock = document.querySelector(selector);
  if (!clock) return null;

  const time = clock.querySelector('.time');
  if (!time) {
    if (!clock.classList.contains('rclock-turn') && !warnedMissingTime) {
      warnedMissingTime = true;
      console.warn(`[perk-chess] ${selector} has no .time element; lichess clock markup may have changed`);
    }
    return null;
  }

  const seconds = clock.classList.contains('outoftime') ? 0 : parseClockText(time.textContent);
  if (seconds === null) return null;

  return { seconds, running: clock.classList.contains('running') };
};

const poll = () => {
  const top = readSide(CLOCK_SELECTORS.top);
  const bottom = readSide(CLOCK_SELECTORS.bottom);

  if (!top && !bottom) {
    if (lastSent !== null) {
      lastSent = null;
      emitStreamerEvent({ type: 'clock', top: null, bottom: null, running: null });
    }
    return;
  }

  let running = null;
  if (top?.running) running = 'top';
  else if (bottom?.running) running = 'bottom';

  const payload = {
    type: 'clock',
    top: top ? top.seconds : null,
    bottom: bottom ? bottom.seconds : null,
    running,
  };

  const signature = `${payload.top}|${payload.bottom}|${payload.running}`;
  if (signature === lastSent) return;
  lastSent = signature;

  emitStreamerEvent(payload);
};

export const startClockMirror = () => {
  setInterval(poll, POLL_MS);
};
