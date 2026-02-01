# Perk Chess

## ELO as a system for motivating people to play more Chess. 

The ELO system is a method for calculating player strength and is used as a matchmaking mechanism to pair players of equal strength together. In the chess world, ELO is a highly coveted and important metric. A simple search on YouTube for the term "chess" at any given time will yield at least a few results associated with ELO. When you sign up for an account on popular chess websites like chess.com and lichess.org, this number is automatically added next to your name and visible as you navigate across the site and play chess games online. As a chess player, you are conditioned to care about this number. After all, this number is associated with how well you play chess, so it is ought to be very important.  

Scores of educational chess content is written to help you achieve a certain ELO ranking. Improving one's ELO ranking, or at the very least, preventing it from dropping too significantly seems to be a primary motivation to playing chess for many players. 

## Introducing Perk Chess, an alternative motivation for playing online Chess

This project was written for those of us who do not care about our ELO. This project exists for those of us who just want to play chess, to have a fun game, without caring about a number going up and down. This project exists for those of us who just want to relax and have fun while playing chess, without the pressure of maintaining or increasing our ELO ranking. Perk Chess exists not as a replacement of the ELO system, but as an alternative, perhaps healthier system of motivation for playing Chess. 

### What is Perk Chess? 

Perk Chess is a browser extension for Lichess.org that adds role-playing game elements to chess which encourage and reward you for playing and winning chess games. 

The goal of Perk Chess is to reach and beat level 15. You start at level 1, each level requires 100 experience points, and you gain these by winning chess games online on Lichess.org. When you win chess games on Lichess.org, your chess board color will slightly change. When you beat a level, the chess board theme changes and you repeat the process for the next level. 

In addition to earning experience points for your wins, Perk Chess features a Perk System. A Perk is something you unlock as you level up, which adds additional experience points if you fulfill the requirements of the Perk. An example of a Perk is "Opportunist". Opportunist adds 3 to 4 additional experience points for winning a game where you are up in material for more than one move. This can be accomplished in a game by simply seeing a tactic, or picking up a hanging piece. You can only have two Perks active at any given time, and you unlock new Perks as you increase your level. 

**Note:** To gain maximum immersion and enjoyment from using Perk Chess, it is recommended to hide your Lichess Chess ELO via this link:

https://lichess.org/account/preferences/display#showRatings

**Note 2: This browser extension for Lichess.org is ENTIRELY cosmetic and does not interact with gameplay. Perk Chess does not provide ANY assistance during online chess games. There are no move suggestions, no forms of analysis and no hints.** 

Perk Chess provides an alternative motivation system to the traditional ELO system. Instead of rating going up and down (often stressful), you'll earn experience points, level up, unlock and discover new perks along the way. 

### Specializations

Specializations are a new feature that is introduced in version 1.1.00. Specializations act like role-playing game classes. Specializations change the order that perks unlock around a specific theme, and thus each embodies and rewards a particular type of player and playstyle. There are six different specializations to choose from, and they are: 

**Strategist** - A balanced specialization for perk unlocks. Strategist is designed for players that just want to play a normal game of chess, with a little bit of an extra reward for winning. This specialization is recommended for new players as well as players who would like to study chess in between games. 

**Gladiator** - For the player that embodies the "never resign" mentality. This specialization rewards players for persevering, not giving up and winning otherwise lost games. After all, fortune favors the bold. 

**Gambiteer** - For the player that loves to sacrifice pawns, gambit material, and attack aggressively. Gambiteer is for the romantics of chess. 

**Chaos Agent** - For the unconventionalist who believes that the rules of chess are meant to be broken. Rewards uncastled kings and unusual play. Bonus points are given for the maniacs that like to move their king on move 2. 

**Berserker** - For the highly aggressive player that throws all caution into the wind, that wants to win fast, win at all costs, and as quickly as possible. 

**Experimentalist** - For the player that believes that variety is the spice of life. This specialization is for those of us who like to try new things in every game.


## Installation For Chrome

1. Clone or download this repository.
2. Run `npm install` to install project dependencies
3. Run `npm run build-chrome` to bundle extension assets (you currently have to do this every time you make a change while developing). This step should generate a folder called `build-chrome` in the base of the perk-chess project directory that contains build assets for the chrome browser. 
4. Navigate to `chrome://extensions` in your chrome browser.
5. Enable "Developer mode" on the top right corner (if not already enabled).
6. Click on "Load unpacked" and select the `build-chrome` directory you generated in step 3. 
7. Navigate to lichess.org, if installed you should see a welcome dialog that explains how Perk Chess works!

## Usage

1. Once installed, navigate to Lichess. You will want to open the Perk selection menu, which will allow you to select your specialization and perks. You can open the perk selection menu by clicking on the **XP Progress Bar** in the top right corner of your lichess navigation bar (right next to where your Lichess username is).  

2. Once you have selected your specialization and perks, go play some games! When you win, you'll now earn XP points! Once you have accumulated 100 XP points in level 1, you will level up to level 2 (and unlock a new perk!). The goal of Perk Chess is to beat all 15 levels within your selected specialization.

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
