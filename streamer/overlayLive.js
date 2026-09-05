import { browser } from '../content_scripts/constants.js';
import { buildState, STREAMER_STATE_KEYS } from './state.js';

const DEBOUNCE_MS = 100;
const TRANSIENT_TYPES = ['toast', 'clock', 'levelup', 'prestige'];

let pending = null;

const dispatch = (payload) => {
  window.dispatchEvent(new CustomEvent('hue-chess', { detail: payload }));
};

const publishState = async () => {
  dispatch(await buildState());
};

const schedulePublish = () => {
  clearTimeout(pending);
  pending = setTimeout(publishState, DEBOUNCE_MS);
};

browser.storage.onChanged.addListener((changes, area) => {
  if (area !== 'local') return;
  if (!Object.keys(changes).some((key) => STREAMER_STATE_KEYS.includes(key))) return;
  schedulePublish();
});

browser.runtime.onMessage.addListener((message) => {
  if (message?.v === 1 && TRANSIENT_TYPES.includes(message.type)) {
    dispatch(message);
  }
});

publishState();
