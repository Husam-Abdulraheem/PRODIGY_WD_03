/**
 * Tic-Tac-Toe Application Controller
 * Connects Game Engine, Audio Synthesizer, Confetti, and UI
 */

import {
  TicTacToeEngine,
  PLAYER_X,
  PLAYER_O,
  EMPTY,
  GAME_MODES,
} from './game.js';
import { sounds } from './audio.js';
import { ConfettiCannon } from './confetti.js';

// SVG Marker Templates
const SVG_X = `
  <svg class="marker-svg marker-x" viewBox="0 0 100 100" aria-hidden="true">
    <line class="marker-x-path-1" x1="22" y1="22" x2="78" y2="78" />
    <line class="marker-x-path-2" x1="78" y1="22" x2="22" y2="78" />
  </svg>
`;

const SVG_O = `
  <svg class="marker-svg marker-o" viewBox="0 0 100 100" aria-hidden="true">
    <circle class="marker-o-circle" cx="50" cy="50" r="30" />
  </svg>
`;

class TicTacToeApp {
  constructor() {
    this.themes = ['cyber-dark', 'midnight-oled', 'tokyo-sunset', 'emerald-matrix', 'arctic-light'];
    this.currentThemeIndex = 0;

    // Load persisted settings
    this.savedScores = JSON.parse(localStorage.getItem('ttt_scores') || '{"x":0,"o":0,"ties":0}');
    this.savedTheme = localStorage.getItem('ttt_theme') || 'cyber-dark';
    this.savedMode = localStorage.getItem('ttt_mode') || GAME_MODES.AI_HARD;
    this.savedSide = localStorage.getItem('ttt_side') || PLAYER_X;
    this.firstMovePreference = localStorage.getItem('ttt_first_move') || 'human'; // 'human', 'ai', 'alternate'
    this.alternateNext = 'human';

    // Initialize Game Engine
    this.engine = new TicTacToeEngine({
      mode: this.savedMode,
      humanPlayer: this.savedSide,
      startingPlayer: this.savedSide,
    });

    // Cache DOM Elements
    this.boardGrid = document.getElementById('board-grid');
    this.cells = Array.from(document.querySelectorAll('.cell'));
    this.winLineSvg = document.getElementById('win-line-svg');
    this.statusText = document.getElementById('status-text');
    this.statusBanner = document.getElementById('status-banner');

    this.scoreXEl = document.getElementById('score-x');
    this.scoreOEl = document.getElementById('score-o');
    this.scoreTiesEl = document.getElementById('score-ties');
    this.scoreCardX = document.getElementById('score-card-x');
    this.scoreCardO = document.getElementById('score-card-o');
    this.playerXTitle = document.getElementById('player-x-title');
    this.playerOTitle = document.getElementById('player-o-title');

    this.newRoundBtn = document.getElementById('new-round-btn');
    this.resetScoreBtn = document.getElementById('reset-score-btn');
    this.themeBtn = document.getElementById('theme-btn');
    this.soundBtn = document.getElementById('sound-btn');
    this.soundIconOn = document.getElementById('sound-icon-on');
    this.soundIconOff = document.getElementById('sound-icon-off');
    this.helpBtn = document.getElementById('help-btn');
    this.helpDialog = document.getElementById('help-dialog');
    this.dialogCloseIcon = document.getElementById('dialog-close-icon');

    this.modeButtons = Array.from(document.querySelectorAll('[data-mode]'));
    this.sideButtons = Array.from(document.querySelectorAll('[data-side]'));
    this.firstMoveButtons = Array.from(document.querySelectorAll('[data-first]'));

    // Canvas Confetti
    const canvas = document.getElementById('confetti-canvas');
    this.confetti = new ConfettiCannon(canvas);

    this.focusedCellIndex = 0;
    this.isAiThinking = false;

    this.init();
  }

  init() {
    this.applyTheme(this.savedTheme);
    this.updateSoundIcon();
    this.updateScoreboardDisplay();
    this.updateModeUI();
    this.updateSideUI();
    this.updateFirstMoveUI();
    this.updateTitles();

    this.bindEvents();
    this.startNewRound();
  }

  applyTheme(themeName) {
    document.documentElement.setAttribute('data-theme', themeName);
    this.currentThemeIndex = this.themes.indexOf(themeName);
    if (this.currentThemeIndex === -1) this.currentThemeIndex = 0;
    localStorage.setItem('ttt_theme', themeName);
  }

  cycleTheme() {
    this.currentThemeIndex = (this.currentThemeIndex + 1) % this.themes.length;
    const nextTheme = this.themes[this.currentThemeIndex];
    this.applyTheme(nextTheme);
  }

  updateSoundIcon() {
    if (sounds.isMuted) {
      this.soundIconOn.style.display = 'none';
      this.soundIconOff.style.display = 'block';
    } else {
      this.soundIconOn.style.display = 'block';
      this.soundIconOff.style.display = 'none';
    }
  }

  updateTitles() {
    if (this.engine.mode === GAME_MODES.PVP) {
      this.playerXTitle.textContent = 'Player X';
      this.playerOTitle.textContent = 'Player O';
    } else {
      const modeLabel = {
        [GAME_MODES.AI_EASY]: 'AI (Easy)',
        [GAME_MODES.AI_MEDIUM]: 'AI (Med)',
        [GAME_MODES.AI_HARD]: 'AI (Hard)',
      }[this.engine.mode] || 'AI';

      if (this.engine.humanPlayer === PLAYER_X) {
        this.playerXTitle.textContent = 'You (X)';
        this.playerOTitle.textContent = modeLabel;
      } else {
        this.playerXTitle.textContent = modeLabel;
        this.playerOTitle.textContent = 'You (O)';
      }
    }
  }

  updateScoreboardDisplay() {
    this.scoreXEl.textContent = this.savedScores.x;
    this.scoreOEl.textContent = this.savedScores.o;
    this.scoreTiesEl.textContent = this.savedScores.ties;
  }

  saveScores() {
    localStorage.setItem('ttt_scores', JSON.stringify(this.savedScores));
    this.updateScoreboardDisplay();
  }

  resetScores() {
    this.savedScores = { x: 0, o: 0, ties: 0 };
    this.saveScores();
    sounds.playReset();
  }

  updateModeUI() {
    this.modeButtons.forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.mode === this.engine.mode);
    });

    const sideRow = document.getElementById('side-select-row');
    const firstMoveRow = document.getElementById('first-move-row');
    if (this.engine.mode === GAME_MODES.PVP) {
      if (sideRow) sideRow.style.display = 'none';
      if (firstMoveRow) firstMoveRow.style.display = 'none';
    } else {
      if (sideRow) sideRow.style.display = 'flex';
      if (firstMoveRow) firstMoveRow.style.display = 'flex';
    }
  }

  updateSideUI() {
    this.sideButtons.forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.side === this.engine.humanPlayer);
    });
  }

  updateFirstMoveUI() {
    this.firstMoveButtons.forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.first === this.firstMovePreference);
    });
  }

  startNewRound() {
    this.clearWinningLine();
    this.isAiThinking = false;

    // Determine starting player
    let starter = PLAYER_X;
    if (this.engine.mode === GAME_MODES.PVP) {
      starter = PLAYER_X;
    } else {
      if (this.firstMovePreference === 'human') {
        starter = this.engine.humanPlayer;
      } else if (this.firstMovePreference === 'ai') {
        starter = this.engine.aiPlayer;
      } else {
        // Alternate
        starter = this.alternateNext === 'human' ? this.engine.humanPlayer : this.engine.aiPlayer;
        this.alternateNext = this.alternateNext === 'human' ? 'ai' : 'human';
      }
    }

    this.engine.setStartingPlayer(starter);
    this.engine.reset();

    this.renderBoard();
    this.updateStatus();
    sounds.playReset();

    // If AI starts first, trigger move
    if (this.engine.isAiTurn()) {
      this.triggerAiMove();
    }
  }

  clearWinningLine() {
    while (this.winLineSvg.firstChild) {
      this.winLineSvg.removeChild(this.winLineSvg.firstChild);
    }
    this.cells.forEach((cell) => {
      cell.classList.remove('winning-cell', 'win-x', 'win-o');
    });
  }

  renderBoard() {
    const board = this.engine.board;
    const isGameOver = this.engine.isGameOver;

    this.cells.forEach((cell, index) => {
      const val = board[index];
      cell.classList.remove('ghost-x', 'ghost-o');

      if (val === PLAYER_X) {
        if (!cell.querySelector('.marker-x')) {
          cell.innerHTML = SVG_X;
        }
        cell.disabled = true;
        cell.setAttribute('aria-label', `Row ${Math.floor(index / 3) + 1}, Column ${(index % 3) + 1}, X`);
      } else if (val === PLAYER_O) {
        if (!cell.querySelector('.marker-o')) {
          cell.innerHTML = SVG_O;
        }
        cell.disabled = true;
        cell.setAttribute('aria-label', `Row ${Math.floor(index / 3) + 1}, Column ${(index % 3) + 1}, O`);
      } else {
        cell.innerHTML = '';
        cell.disabled = isGameOver || this.isAiThinking;
        cell.setAttribute('aria-label', `Row ${Math.floor(index / 3) + 1}, Column ${(index % 3) + 1}, empty`);
      }
    });
  }

  updateStatus() {
    const { isGameOver, winner, currentPlayer, humanPlayer, mode } = this.engine;

    // Scoreboard active turn highlights
    this.scoreCardX.classList.toggle('active-turn', !isGameOver && currentPlayer === PLAYER_X);
    this.scoreCardO.classList.toggle('active-turn', !isGameOver && currentPlayer === PLAYER_O);

    if (isGameOver) {
      if (winner === 'TIE') {
        this.statusText.innerHTML = `<span>It's a Draw!</span>`;
        this.savedScores.ties++;
        this.saveScores();
        sounds.playTie();
      } else {
        const winnerBadge = winner === PLAYER_X
          ? `<span class="status-badge badge-x">X</span>`
          : `<span class="status-badge badge-o">O</span>`;

        let winnerName = `Player ${winner}`;
        if (mode !== GAME_MODES.PVP) {
          winnerName = winner === humanPlayer ? 'You won!' : 'AI won!';
        }

        this.statusText.innerHTML = `${winnerBadge} <span>${winnerName}</span>`;

        if (winner === PLAYER_X) {
          this.savedScores.x++;
        } else {
          this.savedScores.o++;
        }
        this.saveScores();

        sounds.playWin();

        // Trigger confetti for human win or PvP
        if (mode === GAME_MODES.PVP || winner === humanPlayer) {
          this.confetti.fire(2800);
        }

        // Draw winning line
        this.drawWinningLine(this.engine.winningLine, winner);
      }
    } else {
      if (this.isAiThinking) {
        this.statusText.innerHTML = `<span>AI is calculating...</span>`;
      } else {
        const turnBadge = currentPlayer === PLAYER_X
          ? `<span class="status-badge badge-x">X</span>`
          : `<span class="status-badge badge-o">O</span>`;

        let turnName = `Player ${currentPlayer}'s turn`;
        if (mode !== GAME_MODES.PVP) {
          turnName = currentPlayer === humanPlayer ? 'Your turn' : "AI's turn";
        }
        this.statusText.innerHTML = `${turnBadge} <span>${turnName}</span>`;
      }
    }
  }

  drawWinningLine(line, winner) {
    if (!line || line.length !== 3) return;

    // Highlight cells
    line.forEach((idx) => {
      this.cells[idx].classList.add('winning-cell', winner === PLAYER_X ? 'win-x' : 'win-o');
    });

    const [startIdx, , endIdx] = line;
    const startCell = this.cells[startIdx];
    const endCell = this.cells[endIdx];

    const boardW = this.boardGrid.clientWidth;
    const boardH = this.boardGrid.clientHeight;

    const startX = startCell.offsetLeft + (startCell.offsetWidth / 2);
    const startY = startCell.offsetTop + (startCell.offsetHeight / 2);
    const endX = endCell.offsetLeft + (endCell.offsetWidth / 2);
    const endY = endCell.offsetTop + (endCell.offsetHeight / 2);

    const dx = endX - startX;
    const dy = endY - startY;
    const len = Math.hypot(dx, dy);

    // Extension offset in pixels so line cleanly spans across the cells
    const ext = 28;
    const ux = len > 0 ? (dx / len) : 0;
    const uy = len > 0 ? (dy / len) : 0;

    const x1 = ((startX - ux * ext) / boardW) * 100;
    const y1 = ((startY - uy * ext) / boardH) * 100;
    const x2 = ((endX + ux * ext) / boardW) * 100;
    const y2 = ((endY + uy * ext) / boardH) * 100;

    const lineEl = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    lineEl.setAttribute('x1', `${x1}`);
    lineEl.setAttribute('y1', `${y1}`);
    lineEl.setAttribute('x2', `${x2}`);
    lineEl.setAttribute('y2', `${y2}`);
    lineEl.setAttribute('class', `win-strike-line ${winner === PLAYER_X ? 'line-x' : 'line-o'}`);

    this.winLineSvg.appendChild(lineEl);
  }

  handleCellClick(index) {
    if (this.engine.isGameOver || this.isAiThinking) {
      return;
    }

    if (this.engine.board[index] !== EMPTY) {
      sounds.playError();
      return;
    }

    // In AI mode, prevent human from clicking on AI's turn
    if (this.engine.isVsAi() && this.engine.currentPlayer !== this.engine.humanPlayer) {
      return;
    }

    const currentMover = this.engine.currentPlayer;
    const moved = this.engine.makeMove(index);
    if (!moved) return;

    sounds.playMove(currentMover);
    this.renderBoard();
    this.updateStatus();

    // Check if AI turn follows
    if (this.engine.isAiTurn()) {
      this.triggerAiMove();
    }
  }

  triggerAiMove() {
    this.isAiThinking = true;
    this.renderBoard();
    this.updateStatus();

    // Natural micro-delay for realistic human-like feel
    const delay = this.engine.mode === GAME_MODES.AI_EASY ? 300 : 420;

    setTimeout(() => {
      if (this.engine.isGameOver) {
        this.isAiThinking = false;
        return;
      }

      const aiMove = this.engine.getAiMove();
      if (aiMove !== null) {
        const mover = this.engine.currentPlayer;
        this.engine.makeMove(aiMove);
        sounds.playMove(mover);
      }

      this.isAiThinking = false;
      this.renderBoard();
      this.updateStatus();
    }, delay);
  }

  bindEvents() {
    // Board cells click & hover
    this.cells.forEach((cell) => {
      const index = parseInt(cell.dataset.index, 10);

      cell.addEventListener('click', () => this.handleCellClick(index));

      cell.addEventListener('mouseenter', () => {
        if (!this.engine.isGameOver && !this.isAiThinking && this.engine.board[index] === EMPTY) {
          if (!this.engine.isVsAi() || this.engine.currentPlayer === this.engine.humanPlayer) {
            cell.classList.add(this.engine.currentPlayer === PLAYER_X ? 'ghost-x' : 'ghost-o');
          }
        }
      });

      cell.addEventListener('mouseleave', () => {
        cell.classList.remove('ghost-x', 'ghost-o');
      });
    });

    // Control buttons
    this.newRoundBtn.addEventListener('click', () => this.startNewRound());
    this.resetScoreBtn.addEventListener('click', () => this.resetScores());

    // Theme & Sound
    this.themeBtn.addEventListener('click', () => this.cycleTheme());
    this.soundBtn.addEventListener('click', () => {
      sounds.toggleMute();
      this.updateSoundIcon();
    });

    // Game Mode selection
    this.modeButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const mode = btn.dataset.mode;
        this.engine.setMode(mode);
        localStorage.setItem('ttt_mode', mode);
        this.updateModeUI();
        this.updateTitles();
        this.startNewRound();
      });
    });

    // Player side selection (X vs O)
    this.sideButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const side = btn.dataset.side;
        this.engine.setHumanPlayer(side);
        localStorage.setItem('ttt_side', side);
        this.updateSideUI();
        this.updateTitles();
        this.startNewRound();
      });
    });

    // First move selection
    this.firstMoveButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const first = btn.dataset.first;
        this.firstMovePreference = first;
        localStorage.setItem('ttt_first_move', first);
        this.updateFirstMoveUI();
        this.startNewRound();
      });
    });

    // Modal Dialog handling (Modern Web Guidance compliance)
    this.helpBtn.addEventListener('click', () => {
      this.helpDialog.showModal();
    });

    this.dialogCloseIcon.addEventListener('click', () => {
      this.helpDialog.close();
    });

    // Dialog light-dismiss fallback for browsers lacking native closedby
    if (!('closedBy' in HTMLDialogElement.prototype)) {
      this.helpDialog.addEventListener('click', (event) => {
        if (event.target !== this.helpDialog) return;
        const rect = this.helpDialog.getBoundingClientRect();
        const isDialogContent = (
          rect.top <= event.clientY &&
          event.clientY <= rect.top + rect.height &&
          rect.left <= event.clientX &&
          event.clientX <= rect.left + rect.width
        );
        if (!isDialogContent) {
          this.helpDialog.close();
        }
      });
    }

    // Keyboard Navigation & Shortcuts
    window.addEventListener('keydown', (e) => {
      if (this.helpDialog.open && e.key !== 'Escape') {
        return; // Let dialog handle keys when open
      }

      // Quick cell keys: 1 to 9
      if (e.key >= '1' && e.key <= '9') {
        const cellIndex = parseInt(e.key, 10) - 1;
        this.handleCellClick(cellIndex);
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'r':
          this.startNewRound();
          break;
        case 'm':
          sounds.toggleMute();
          this.updateSoundIcon();
          break;
        case 't':
          this.cycleTheme();
          break;
        case '?':
          this.helpDialog.showModal();
          break;
        // Arrow Keys Navigation across 3x3 grid
        case 'arrowright':
          e.preventDefault();
          this.moveFocus(1);
          break;
        case 'arrowleft':
          e.preventDefault();
          this.moveFocus(-1);
          break;
        case 'arrowdown':
          e.preventDefault();
          this.moveFocus(3);
          break;
        case 'arrowup':
          e.preventDefault();
          this.moveFocus(-3);
          break;
        case 'enter':
        case ' ':
          if (document.activeElement && document.activeElement.classList.contains('cell')) {
            e.preventDefault();
            const idx = parseInt(document.activeElement.dataset.index, 10);
            this.handleCellClick(idx);
          }
          break;
        default:
          break;
      }
    });

    // Re-render win-line on window resize if game is over with winner
    window.addEventListener('resize', () => {
      if (this.engine.isGameOver && this.engine.winner && this.engine.winner !== 'TIE') {
        this.winLineSvg.innerHTML = '';
        this.drawWinningLine(this.engine.winningLine, this.engine.winner);
      }
    });
  }

  moveFocus(offset) {
    let newIndex = this.focusedCellIndex + offset;
    if (newIndex < 0) newIndex += 9;
    if (newIndex >= 9) newIndex -= 9;
    this.focusedCellIndex = newIndex;
    this.cells[this.focusedCellIndex].focus();
  }
}

// Instantiate on DOM load
window.addEventListener('DOMContentLoaded', () => {
  new TicTacToeApp();
});
