import { LEVEL_CAP, MAX_PERKS, browser } from '../content_scripts/constants.js';
import {
  PERK_METADATA,
  PERK_UNLOCK_ORDERS,
  RANDOMIZER_INDEX,
} from '../content_scripts/perkConstants.js';

const STATE_KEYS = [
  'completedBoards',
  'currentHue',
  'prestige',
  'activePerks',
  'selectedUnlockOrder',
  'randomizerOrder',
  'playingId',
  'winningStreak',
  'gladiatorLossBuffer',
  'playedOpenings',
  'preparationStatus',
];

export const STREAMER_STATE_KEYS = STATE_KEYS;

const readState = () => new Promise((resolve) => {
  browser.storage.local.get(STATE_KEYS, resolve);
});

const perkBadge = (perk, stored) => {
  if (perk === 'gladiator') return stored.gladiatorLossBuffer || 0;
  if (perk === 'versatility') return (stored.playedOpenings || []).length;
  if (perk === 'preparation') return Boolean(stored.preparationStatus);
  return null;
};

export const computeNextUnlock = (level, selectedUnlockOrder, randomizerOrder) => {
  const order = selectedUnlockOrder === RANDOMIZER_INDEX
    ? randomizerOrder
    : PERK_UNLOCK_ORDERS[selectedUnlockOrder];

  if (!order || order.length === 0) return null;

  const upcoming = order
    .filter((entry) => entry.level > level)
    .sort((a, b) => a.level - b.level)[0];
  if (!upcoming) return null;

  const meta = PERK_METADATA.find((perk) => perk.id === upcoming.id);
  if (!meta) return null;

  return { id: meta.internalName, level: upcoming.level };
};

export const buildState = async () => {
  const stored = await readState();

  const completedBoards = stored.completedBoards || 0;
  const currentHue = stored.currentHue || 0;
  const prestige = stored.prestige || 0;
  const activePerks = stored.activePerks || [];
  const selectedUnlockOrder = stored.selectedUnlockOrder || 0;
  const level = completedBoards + 1;

  return {
    v: 1,
    type: 'state',
    ts: Date.now(),
    level,
    levelCap: LEVEL_CAP,
    hue: currentHue,
    hueDeg: (currentHue / 100) * 360,
    prestige,
    prestigeEmblem: prestige > 0 ? ((prestige - 1) % 5) + 1 : 0,
    specialization: { index: selectedUnlockOrder, unlocked: prestige >= 1 },
    maxPerks: MAX_PERKS,
    perks: activePerks.map((perk) => ({ id: perk, badge: perkBadge(perk, stored) })),
    nextUnlock: computeNextUnlock(level, selectedUnlockOrder, stored.randomizerOrder),
    winningStreak: stored.winningStreak || 0,
    inGame: Boolean(stored.playingId),
    preparationMet: Boolean(stored.preparationStatus),
  };
};
