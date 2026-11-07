import { init } from './content_scripts/initialization.js';
import { startClockMirror } from './content_scripts/streamerClock.js';
import { startPlayerMirror } from './content_scripts/streamerPlayers.js';

init();
startClockMirror();
startPlayerMirror();

