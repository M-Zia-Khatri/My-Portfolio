// @/context/gameReducer.ts
import type { GuessResultType } from "../types/guessNumContextTypes";

export interface GameState {
  randomNumber: number | null;
  guessResults: GuessResultType[];
  showNumber: boolean;
  guessTurn: number;
  started: boolean;
}

export type GameAction =
  | {
      type: "RESET_GAME";
      payload: { randomNumber: number; guessLimit: number };
    }
  | {
      type: "MAKE_GUESS";
      payload: GuessResultType;
    }
  | {
      type: "REVEAL_NUMBER";
    }
  | {
      type: "SET_STARTED";
      payload: boolean;
    };

export const initialGameState = (guessLimit: number): GameState => ({
  randomNumber: null,
  guessResults: [],
  showNumber: false,
  guessTurn: guessLimit,
  started: false,
});

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    // start or restart: new random, reset counters/results
    case "RESET_GAME":
      return {
        randomNumber: action.payload.randomNumber,
        guessResults: [],
        showNumber: false,
        guessTurn: action.payload.guessLimit,
        started: false,
      };

    // record one guess, decrement turn, reveal if win or out of turns
    case "MAKE_GUESS": {
      const nextTurns = Math.max(state.guessTurn - 1, 0);
      const didWin = action.payload.message === "you win";
      const willShow = didWin || nextTurns === 0;
      return {
        ...state,
        guessResults: [...state.guessResults, action.payload],
        guessTurn: nextTurns,
        showNumber: willShow,
      };
    }

    // explicitly reveal the number (e.g. timer expired)
    case "REVEAL_NUMBER":
      return { ...state, showNumber: true };

    // only used if you need to toggle “started” from UI
    case "SET_STARTED":
      return { ...state, started: action.payload };

    default:
      return state;
  }
}
