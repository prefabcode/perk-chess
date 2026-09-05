import { browser } from './constants.js';

export const emitStreamerEvent = (payload) => {
  try {
    const sending = browser.runtime.sendMessage({ v: 1, ts: Date.now(), ...payload });
    if (sending?.catch) sending.catch(() => {});
  } catch (error) {
    // chrome throws "Receiving end does not exist" when no overlay page is open
  }
};
