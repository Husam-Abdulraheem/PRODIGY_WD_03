import test from 'node:test';
import assert from 'node:assert/strict';
import {
  TicTacToeEngine,
  PLAYER_X,
  PLAYER_O,
  EMPTY,
  GAME_MODES
} from '../game.js';

test('TicTacToeEngine - Initial State', () => {
  const engine = new TicTacToeEngine();
  assert.equal(engine.board.length, 9);
  assert.ok(engine.board.every(cell => cell === EMPTY));
  assert.equal(engine.currentPlayer, PLAYER_X);
  assert.equal(engine.isGameOver, false);
  assert.equal(engine.winner, null);
  assert.equal(engine.winningLine, null);
});

test('TicTacToeEngine - Valid Moves and Alternating Turns in PvP', () => {
  const engine = new TicTacToeEngine({ mode: GAME_MODES.PVP });
  const move1 = engine.makeMove(0);
  assert.equal(move1, true);
  assert.equal(engine.board[0], PLAYER_X);
  assert.equal(engine.currentPlayer, PLAYER_O);

  const move2 = engine.makeMove(4);
  assert.equal(move2, true);
  assert.equal(engine.board[4], PLAYER_O);
  assert.equal(engine.currentPlayer, PLAYER_X);

  // Cannot place on already occupied cell
  const invalidMove = engine.makeMove(0);
  assert.equal(invalidMove, false);
  assert.equal(engine.currentPlayer, PLAYER_X);
});

test('TicTacToeEngine - Row Win Detection', () => {
  const engine = new TicTacToeEngine({ mode: GAME_MODES.PVP });
  // X: 0, O: 3, X: 1, O: 4, X: 2 -> X wins top row [0, 1, 2]
  engine.makeMove(0);
  engine.makeMove(3);
  engine.makeMove(1);
  engine.makeMove(4);
  engine.makeMove(2);

  assert.equal(engine.isGameOver, true);
  assert.equal(engine.winner, PLAYER_X);
  assert.deepEqual(engine.winningLine, [0, 1, 2]);
});

test('TicTacToeEngine - Column Win Detection', () => {
  const engine = new TicTacToeEngine({ mode: GAME_MODES.PVP });
  // X: 0, O: 1, X: 3, O: 4, X: 6 -> X wins col [0, 3, 6]
  engine.makeMove(0);
  engine.makeMove(1);
  engine.makeMove(3);
  engine.makeMove(4);
  engine.makeMove(6);

  assert.equal(engine.isGameOver, true);
  assert.equal(engine.winner, PLAYER_X);
  assert.deepEqual(engine.winningLine, [0, 3, 6]);
});

test('TicTacToeEngine - Diagonal Win Detection', () => {
  const engine = new TicTacToeEngine({ mode: GAME_MODES.PVP });
  // X: 0, O: 1, X: 4, O: 2, X: 8 -> X wins diagonal [0, 4, 8]
  engine.makeMove(0);
  engine.makeMove(1);
  engine.makeMove(4);
  engine.makeMove(2);
  engine.makeMove(8);

  assert.equal(engine.isGameOver, true);
  assert.equal(engine.winner, PLAYER_X);
  assert.deepEqual(engine.winningLine, [0, 4, 8]);
});

test('TicTacToeEngine - Tie Game Detection', () => {
  const engine = new TicTacToeEngine({ mode: GAME_MODES.PVP });
  // Board setup resulting in a tie:
  // X O X
  // X O O
  // O X X
  const moves = [0, 1, 2, 4, 3, 5, 7, 6, 8];
  for (const idx of moves) {
    engine.makeMove(idx);
  }

  assert.equal(engine.isGameOver, true);
  assert.equal(engine.winner, 'TIE');
  assert.equal(engine.winningLine, null);
});

test('TicTacToeEngine - Undo Move', () => {
  const engine = new TicTacToeEngine({ mode: GAME_MODES.PVP });
  engine.makeMove(0); // X at 0
  engine.makeMove(4); // O at 4

  const undone = engine.undo();
  assert.equal(undone, true);
  assert.equal(engine.board[4], EMPTY);
  assert.equal(engine.currentPlayer, PLAYER_O);
});

test('TicTacToeEngine - Minimax AI Takes Winning Move', () => {
  const engine = new TicTacToeEngine({
    mode: GAME_MODES.AI_HARD,
    humanPlayer: PLAYER_X,
  });
  // AI is O.
  // Board:
  // O O .
  // X X .
  // . . .
  engine.board = [
    PLAYER_O, PLAYER_O, EMPTY,
    PLAYER_X, PLAYER_X, EMPTY,
    EMPTY,    EMPTY,    EMPTY
  ];
  engine.currentPlayer = PLAYER_O;

  const move = engine.getAiMove();
  assert.equal(move, 2, 'AI should take winning move at position 2');
});

test('TicTacToeEngine - Minimax AI Blocks Opponent Win', () => {
  const engine = new TicTacToeEngine({
    mode: GAME_MODES.AI_HARD,
    humanPlayer: PLAYER_X,
  });
  // AI is O.
  // Board:
  // X X .
  // O . .
  // . . .
  engine.board = [
    PLAYER_X, PLAYER_X, EMPTY,
    PLAYER_O, EMPTY,    EMPTY,
    EMPTY,    EMPTY,    EMPTY
  ];
  engine.currentPlayer = PLAYER_O;

  const move = engine.getAiMove();
  assert.equal(move, 2, 'AI should block X from winning at position 2');
});

test('TicTacToeEngine - Minimax AI Unbeatable (Simulation)', () => {
  // Simulate 10 games of Random Human vs Minimax AI: AI should NEVER lose
  for (let game = 0; game < 10; game++) {
    const engine = new TicTacToeEngine({
      mode: GAME_MODES.AI_HARD,
      humanPlayer: PLAYER_X,
    });

    while (!engine.isGameOver) {
      if (engine.currentPlayer === PLAYER_X) {
        const moves = engine.getAvailableMoves();
        const randomMove = moves[Math.floor(Math.random() * moves.length)];
        engine.makeMove(randomMove);
      } else {
        const aiMove = engine.getAiMove();
        assert.ok(aiMove !== null);
        engine.makeMove(aiMove);
      }
    }

    assert.ok(engine.winner === PLAYER_O || engine.winner === 'TIE', `AI should never lose. Winner was: ${engine.winner}`);
  }
});
