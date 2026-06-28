import { PERK_METADATA, RANDOMIZER_LEVELS } from './perkConstants.js';

export const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
};

export const generateRandomUnlockOrder = () => {
  const ids = PERK_METADATA.map(perk => perk.id);
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  return ids.map((id, index) => ({ id, level: RANDOMIZER_LEVELS[index] }));
};