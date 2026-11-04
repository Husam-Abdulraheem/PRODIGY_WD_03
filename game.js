/**
 * Core Tic-Tac-Toe Game Engine
 * Pure logic and state management with Minimax AI
 */

export const PLAYER_X = 'X';
export const PLAYER_O = 'O';
export const EMPTY = null;

export const WINNING_COMBINATIONS = [
  // Rows
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  // Columns
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  // Diagonals
  [0, 4, 8],
  [2, 4, 6],
];

export const GAME_MODES = {
  PVP: 'pvp',
  AI_EASY: 'ai_easy',
  AI_MEDIUM: 'ai_medium',
  AI_HARD: 'ai_hard',
};

export class TicTacToeEngine {
  constructor(options = {}) {
    this.mode = options.mode || GAME_MODES.AI_HARD;
    this.humanPlayer = options.humanPlayer || PLAYER_X;
    this.aiPlayer = this.humanPlayer === PLAYER_X ? PLAYER_O : PLAYER_X;
    this.startingPlayer = options.startingPlayer || PLAYER_X;
    this.reset();
  }

  reset() {
    this.board = Array(9).fill(EMPTY);
    this.currentPlayer = this.startingPlayer;
    this.winner = null; // PLAYER_X, PLAYER_O, or 'TIE'
    this.winningLine = null; // e.g. [0, 1, 2]
    this.isGameOver = false;
    this.history = [];
  }

  setMode(mode) {
    if (Object.values(GAME_MODES).includes(mode)) {
      this.mode = mode;
    }
  }

  setHumanPlayer(player) {
    if (player === PLAYER_X || player === PLAYER_O) {
      this.humanPlayer = player;
      this.aiPlayer = player === PLAYER_X ? PLAYER_O : PLAYER_X;
    }
  }

  setStartingPlayer(player) {
    if (player === PLAYER_X || player === PLAYER_O) {
      this.startingPlayer = player;
    }
  }

  getAvailableMoves(board = this.board) {
    const moves = [];
    for (let i = 0; i < board.length; i++) {
      if (board[i] === EMPTY) {
        moves.push(i);
      }
    }
    return moves;
  }

  makeMove(index) {
    if (this.isGameOver || index < 0 || index > 8 || this.board[index] !== EMPTY) {
      return false;
    }

    const player = this.currentPlayer;
    this.board[index] = player;
    this.history.push({ index, player });

    const winInfo = TicTacToeEngine.checkWinner(this.board);
    if (winInfo) {
      this.isGameOver = true;
      this.winner = winInfo.winner;
      this.winningLine = winInfo.line;
    } else if (this.getAvailableMoves().length === 0) {
      this.isGameOver = true;
      this.winner = 'TIE';
      this.winningLine = null;
    } else {
      this.currentPlayer = this.currentPlayer === PLAYER_X ? PLAYER_O : PLAYER_X;
    }

    return true;
  }

  undo() {
    if (this.history.length === 0 || this.isGameOver) {
      return false;
    }

    // In AI mode, undoing one human move should also undo the AI's response if AI just moved
    const movesToUndo = (this.isVsAi() && this.history.length >= 2 && this.currentPlayer === this.humanPlayer) ? 2 : 1;

    for (let i = 0; i < movesToUndo; i++) {
      if (this.history.length === 0) break;
      const lastMove = this.history.pop();
      this.board[lastMove.index] = EMPTY;
      this.currentPlayer = lastMove.player;
    }

    this.isGameOver = false;
    this.winner = null;
    this.winningLine = null;
    return true;
  }

  isVsAi() {
    return this.mode !== GAME_MODES.PVP;
  }

  isAiTurn() {
    return this.isVsAi() && !this.isGameOver && this.currentPlayer === this.aiPlayer;
  }

  getAiMove() {
    if (this.isGameOver) return null;

    const availableMoves = this.getAvailableMoves();
    if (availableMoves.length === 0) return null;

    if (this.mode === GAME_MODES.AI_EASY) {
      // Pure random move
      const randomIndex = Math.floor(Math.random() * availableMoves.length);
      return availableMoves[randomIndex];
    }

    if (this.mode === GAME_MODES.AI_MEDIUM) {
      // 1. Can AI win immediately?
      for (const move of availableMoves) {
        const tempBoard = [...this.board];
        tempBoard[move] = this.aiPlayer;
        if (TicTacToeEngine.checkWinner(tempBoard)) {
          return move;
        }
      }

      // 2. Can Human win immediately? Block them!
      for (const move of availableMoves) {
        const tempBoard = [...this.board];
        tempBoard[move] = this.humanPlayer;
        if (TicTacToeEngine.checkWinner(tempBoard)) {
          return move;
        }
      }

      // 3. Take center if available
      if (this.board[4] === EMPTY) {
        return 4;
      }

      // 4. Take random corner
      const corners = [0, 2, 6, 8].filter(i => this.board[i] === EMPTY);
      if (corners.length > 0 && Math.random() < 0.7) {
        return corners[Math.floor(Math.random() * corners.length)];
      }

      // Otherwise random available
      return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }

    // AI_HARD: Unbeatable Minimax with Alpha-Beta Pruning
    return this.getBestMoveMinimax();
  }

  getBestMoveMinimax() {
    const availableMoves = this.getAvailableMoves();
    if (availableMoves.length === 9) {
      // Opening move optimization: pick corner or center
      const openingMoves = [0, 2, 4, 6, 8];
      return openingMoves[Math.floor(Math.random() * openingMoves.length)];
    }

    let bestScore = -Infinity;
    let bestMove = availableMoves[0];

    for (const move of availableMoves) {
      this.board[move] = this.aiPlayer;
      const score = this.minimax(this.board, 0, false, -Infinity, Infinity);
      this.board[move] = EMPTY;

      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }

    return bestMove;
  }

  minimax(board, depth, isMaximizing, alpha, beta) {
    const winInfo = TicTacToeEngine.checkWinner(board);

    if (winInfo) {
      if (winInfo.winner === this.aiPlayer) {
        return 10 - depth; // Prefer faster wins
      }
      return depth - 10; // Prefer delayed losses
    }

    const availableMoves = [];
    for (let i = 0; i < 9; i++) {
      if (board[i] === EMPTY) availableMoves.push(i);
    }

    if (availableMoves.length === 0) {
      return 0; // Draw
    }

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (const move of availableMoves) {
        board[move] = this.aiPlayer;
        const evaluation = this.minimax(board, depth + 1, false, alpha, beta);
        board[move] = EMPTY;

        maxEval = Math.max(maxEval, evaluation);
        alpha = Math.max(alpha, evaluation);
        if (beta <= alpha) break; // Alpha-beta cutoff
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const move of availableMoves) {
        board[move] = this.humanPlayer;
        const evaluation = this.minimax(board, depth + 1, true, alpha, beta);
        board[move] = EMPTY;

        minEval = Math.min(minEval, evaluation);
        beta = Math.min(beta, evaluation);
        if (beta <= alpha) break; // Alpha-beta cutoff
      }
      return minEval;
    }
  }

  static checkWinner(board) {
    for (const line of WINNING_COMBINATIONS) {
      const [a, b, c] = line;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return { winner: board[a], line };
      }
    }
    return null;
  }
}
