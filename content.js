import { init } from './content_scripts/initialization.js';
import { startClockMirror } from './content_scripts/streamerClock.js';

init();
startClockMirror();

