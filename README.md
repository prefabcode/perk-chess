# Perk Chess

Perk Chess is a browser extension that adds gamification elements to Lichess. This extension adds experience points, levels, an unlockable perk system to lichess.org (more on the perk system later). With this extension enabled, you'll earn **XP Points** every time you win a game. These points slightly change the color of your chessboard and are also used to track your progress throughout each level.

![perk-chess-demo](https://github.com/user-attachments/assets/26f7d783-bc36-414b-bb34-0448abc795be)


### Discover Perks
Perk Chess features a **Perk System** that boosts the number of XP Points you earn for every win in exchange for completing specific challenges on Lichess. As you progress and gain levels in Perk Chess, you'll unlock new perks that provide different ways to accumulate bonus XP Points for your wins!

### Level Up with XP Points
Each level requires 100 XP Points, and every level features a unique chessboard theme. Journey through 15 distinct levels, discover 12 unique perks, and complete the Perk Chess Challenge!

### Get Started
To choose your perks, simply click on the **XP Progress Bar** in the top right corner of your navigation bar.

## Features

- **XP Points System (implemented)**: Accumulate XP points by winning chess games. The color of your chess board changes as you earn more points. Progress through 15 unique levels. 
- **Time Control-Based Rewards (implemented)** : Different time controls grant varying ranges of XP points. 
- **Progress Tracking (implemented)**: A progress bar displays your current level and how far you are from reaching the next level.
- **Perk System (12/12 perks implemented)**: As you level up in Perk Chess, you will unlock new perks that allow you to gain bonus XP points from your wins. Perk Chess features 12 perks to unlock spread across 15 levels. 
- **Easter Egg Perks (implemented)**: Perk Chess will ship with a few easter eggs. 
- **Prestige System (implemented)**: When you complete all 15 levels in Perk Chess, your progress will reset to level 1 and you will enter prestige mode. Prestige mode adds a unique icon to your perk selection menu, that changes as you obtain more prestige.

## Installation For Chrome

1. Clone or download this repository.
2. Run `npm install` to install project dependencies
3. Run `npm run build-chrome` to bundle extension assets (you currently have to do this every time you make a change while developing). This step should generate a folder called `build-chrome` in the base of the perk-chess project directory that contains build assets for the chrome browser. 
4. Navigate to `chrome://extensions` in your chrome browser.
5. Enable "Developer mode" on the top right corner (if not already enabled).
6. Click on "Load unpacked" and select the `build-chrome` directory you generated in step 3. 
7. Navigate to lichess.org, if installed you should see a welcome dialog that explains how Perk Chess works!

## Installation for Firefox

1. Clone or download this repository.
2. Run `npm install` to install project dependencies
3. Run `npm run build-moz` to bundle extension assets (you currently have to do this every time you make a change while developing). This step should generate a folder called `build-firefox` in the base of the Perk chess project directory that contains build assets for the firefox browser.
4. Navigate to `about:debugging#/runtime/this-firefox` in your firefox browser.
5. Click "Load Temporary Add-on", navigate to the `build-firefox` folder you generated in step 3, open it and select the manifest.json file. 
6. If successful, you should see Perk Chess added as a temporary extension. Navigate to lichess.org, if everything installed correctly you should see a welcome dialog that explains how Perk Chess works! 

## Usage

1. Once installed, navigate to Lichess. You will want to open the Perk selection menu, which will allow you to select perks. You can select perks by clicking on the **XP Progress Bar** in the top right corner of your navigation bar. At level 1, there will be 1 perk that you can select called "Opportunist". You will unlock more perks as you level up in Perk Chess. 

2. Once you have selected your perks, go play some games! When you win, you'll now earn XP points! Once you have accumulated 100 XP points in level one, you will level up to level 2 (and unlock a new perk!). You can check your current XP points earned for a level by clicking the **XP Progress Bar** on the top right corner of lichess, near your username. 

### File Structure

- `content_scripts/*.js`: Contains extension logic for all functionality within Perk Chess.
- `imgs/*.svg`: contains image assets used throughout the project. 
- `background-{browser}.js`: Handles the browser action click to open the settings modal.
- `content.js`: Entry point for the project. 
- `settings.html`: This is the extension settings modal (accessable by clicking the Perk-Chess browser extension icon).
- `perks.html`: This is the perk selection modal. 
- `customStyles.css`: Style file for the extension.
- `moz-manifest.json`: Firefox add-on manifest file.
- `chrome-manifest.json`: Chrome extension manifest file.
- `build.js`: Contains logic for gathering extension assets and bundling them to `build-chrome` and `build-firefox` directories. 

## Contributing

Feel free to submit issues or pull requests if you have suggestions or improvements.

## License

This project is licensed under the GPL-3.0 License.
