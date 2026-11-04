# Prodigy InfoTech — Web Development Internship
## Task 03: Interactive Tic-Tac-Toe Web Application

![Prodigy InfoTech Task-03](https://img.shields.io/badge/PRODIGY__WD__03-Task--03-6366f1?style=for-the-badge&logo=target)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

An interactive, responsive, and accessible **Tic-Tac-Toe Web Application** built with semantic **HTML5**, modern **CSS3**, and modular **JavaScript (ES6+)**. Features an unbeatable Minimax AI with alpha-beta pruning, multi-level difficulty settings, local two-player mode, dynamic SVG winning strike-through lines, Web Audio API sound synthesis, HTML5 canvas confetti celebration, and full keyboard navigation.

---

## 🌟 Key Features

### 1. Robust Game Engine & AI Opponent
- **Unbeatable Minimax AI**: Implements the classic minimax algorithm with depth scoring and alpha-beta pruning to play mathematically optimal moves.
- **Multiple Game Modes**:
  - **Two Players (PvP)**: Local multiplayer on the same device.
  - **Easy AI**: Random casual moves for beginners.
  - **Medium AI**: Tactical heuristic AI that seizes immediate winning moves, blocks opponent wins, and prioritizes center and corners.
  - **Unbeatable AI (Hard)**: Flawless minimax algorithm with zero defeats.
- **Customization**:
  - Choose your symbol (**X** or **O**).
  - Configurable first move: **You First**, **AI First**, or **Alternate**.
  - Move undo support for taking back decisions.

### 2. Modern Glassmorphic Visual Design & Animations
- Fluid SVG animations for drawing markers (**X** cross lines and **O** circle stroke dashoffset).
- Dynamic SVG winning strike-through line connecting the exact center of winning cells with neon glow effects.
- Ghost preview on empty cell hover indicating the active player's next placement.
- Particle confetti cannon celebration on victory using pure HTML5 canvas (zero external libraries).

### 3. Multi-Theme Customization
- **Cyber Dark (Default)**: Deep midnight navy with neon cyan and magenta accents.
- **Midnight OLED**: High-contrast pitch black with electric sky blue and coral.
- **Tokyo Sunset**: Twilight purple dusk with amber gold and radiant orchid.
- **Emerald Matrix**: Cyber emerald forest with vibrant mint and golden amber.
- **Arctic Light**: Clean minimalist high-contrast light theme with cobalt sapphire and ruby crimson.
- Persistent theme selection stored in `localStorage`.

### 4. Built-in Web Audio API Sound Effects
- Synthesized tones for moves, victory fanfare, draw tone, reset swoosh, and invalid move alerts.
- Zero audio file dependencies (synthesized on-the-fly via native Web Audio API).
- Toggleable sound mute button with persistent state.

### 5. Accessibility (A11y) & Keyboard Navigation
- Full keyboard support:
  - Arrow keys (<kbd>&uarr;</kbd> <kbd>&darr;</kbd> <kbd>&larr;</kbd> <kbd>&rarr;</kbd>) to navigate the 3&times;3 board grid.
  - <kbd>Enter</kbd> or <kbd>Space</kbd> to place marker on the focused cell.
  - Number keys <kbd>1</kbd>&ndash;<kbd>9</kbd> for quick direct placement.
  - Quick action shortcuts: <kbd>R</kbd> (New Round), <kbd>U</kbd> (Undo), <kbd>M</kbd> (Mute audio), <kbd>T</kbd> (Cycle theme), <kbd>?</kbd> (Rules & shortcuts modal).
- ARIA live region announcements (`aria-live="polite"`) for moves, turns, and game outcomes.
- Native `<dialog>` element with backdrop blur and light-dismiss fallback adhering to modern web best practices.

---

## ⌨️ Keyboard Shortcuts Reference

| Key | Action |
| :--- | :--- |
| <kbd>&uarr;</kbd> <kbd>&darr;</kbd> <kbd>&larr;</kbd> <kbd>&rarr;</kbd> | Navigate 3&times;3 grid cells |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Place marker on focused cell |
| <kbd>1</kbd> &ndash; <kbd>9</kbd> | Quick-place marker at cell 1 through 9 |
| <kbd>R</kbd> | Start new round |
| <kbd>U</kbd> | Undo last move |
| <kbd>M</kbd> | Toggle sound effects (Mute / Unmute) |
| <kbd>T</kbd> | Cycle color theme |
| <kbd>?</kbd> | Open rules and keyboard shortcuts modal |
| <kbd>Esc</kbd> | Close modal |

---

## 📁 Repository Structure

```
PRODIGY_WD_03/
├── index.html              # Semantic HTML5 markup, board grid & dialog modal
├── styles.css              # Master stylesheet entrypoint importing modular CSS
├── css/
│   ├── themes.css          # Color palettes and theme custom properties
│   ├── base.css            # Base reset, typography, header and container layout
│   ├── board.css           # 3x3 board grid, SVG markers, hover ghost, win line
│   ├── components.css      # Scoreboard, status banner, controls & dialog modal
│   └── responsive.css      # Responsive media queries for mobile and tablet
├── game.js                 # Pure functional game engine with Minimax AI algorithm
├── audio.js                # Web Audio API sound synthesizer
├── confetti.js             # Canvas particle confetti celebration engine
├── app.js                  # Main UI controller, keyboard navigation & event wiring
├── package.json            # Node.js project metadata and verification scripts
├── scripts/
│   ├── lint.js             # Syntax and HTML/JS integrity validator
│   └── build-check.js      # Production asset integrity and bundle checker
└── test/
    └── game.test.js        # Comprehensive automated test suite (node:test)
```

---

## 🧪 Verification & Testing

To run the automated verification checks and test suite:

```bash
# Run unit tests (10/10 test cases covering win states, tie, minimax logic)
npm test

# Run syntax and code integrity lint
npm run lint

# Run asset integrity check
npm run build

# Run all verification checks together
npm run check
```
