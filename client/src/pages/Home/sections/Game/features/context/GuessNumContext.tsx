import React, {
  createContext,
  useContext,
  useCallback,
  type ReactNode,
  useReducer,
  useState,
  useEffect,
} from "react";
import { gameReducer, initialGameState } from "./gameReducer";
import type { GuessResultType } from "../types/guessNumContextTypes";
import useTimer from "../hooks/useTimer";
import useGameSet, { type ScoreRecord } from "../stores/GameSetStore";
import { generateId } from "../Service/idGenerator";

function calculateScore({
  guessResults,
  guessLimit,
  initialTimeLimit,
  timeLeft,
  difficultLevel,
}: {
  guessResults: GuessResultType[];
  guessLimit: number;
  initialTimeLimit: number;
  timeLeft: number;
  difficultLevel: string;
}): number {
  const attemptScore = guessResults.length
    ? (guessLimit / guessResults.length) * 100
    : 0;
  const timeScore = initialTimeLimit ? (timeLeft / initialTimeLimit) * 100 : 0;
  const closeBonus = guessResults.reduce((sum, { message }) => {
    return message === "very close" ? sum + 10 : sum;
  }, 0);
  const levelBonus =
    {
      easy: 100,
      normal: 200,
      hard: 400,
      "very-hard": 800,
      custom: 300,
    }[difficultLevel] ?? 0;

  return attemptScore + timeScore + closeBonus + levelBonus;
}

interface GuessNumContextType {
  randomNumber: number | null;
  guessResults: GuessResultType[];
  showNumber: boolean;
  guessTurn: number;
  timeLeft: number;
  started: boolean;
  nameInput: string;

  startGame: () => void;
  makeGuess: (guess: number) => void;
  restartGame: () => void;

  setStarted: (val: boolean) => void;
  setNameInput: React.Dispatch<React.SetStateAction<string>>;

  clearHistory: VoidFunction;
  clearAndReloadHistory: VoidFunction; // Add this function
}

const GuessNumContext = createContext<GuessNumContextType | undefined>(
  undefined
);

type Props = { children: ReactNode };

export const GuessNumProvider: React.FC<Props> = ({ children }) => {
  const {
    maxNumber,
    guessLimit,
    timeLimit: initialTimeLimit,
    difficultLevel,
    scoreHistory,
    addScoreRecord,
    clearScoreHistory,
  } = useGameSet();


  // Core game state via reducer
  const [state, dispatch] = useReducer(
    gameReducer,
    initialGameState(guessLimit)
  );
  const { randomNumber, guessResults, showNumber, guessTurn, started } = state;

  // Player name
  const [nameInput, setNameInput] = useState("");

  // Countdown timer
  const { timeLeft, reset: resetTimer } = useTimer({
    initialTime: initialTimeLimit,
    isActive: started && !showNumber,
    onExpire: () => dispatch({ type: "REVEAL_NUMBER" }),
  });

  const startGame = useCallback(() => {
    const num = Math.floor(Math.random() * maxNumber) + 1;
    dispatch({
      type: "RESET_GAME",
      payload: { randomNumber: num, guessLimit },
    });
    resetTimer();
  }, [maxNumber, guessLimit, resetTimer]);

  const makeGuess = useCallback(
    (guess: number) => {
      if (randomNumber == null || showNumber) return;
      const dist = Math.abs(guess - randomNumber);
      const threshold = maxNumber / 100;
      let message: GuessResultType["message"];
      if (guess === randomNumber) message = "you win";
      else if (dist <= threshold * 15) message = "very close";
      else if (guess < randomNumber) message = "too low";
      else message = "too high";

      dispatch({ type: "MAKE_GUESS", payload: { guess, message } });
    },
    [randomNumber, showNumber, maxNumber]
  );

  const restartGame = useCallback(() => {
    startGame();
    dispatch({ type: "SET_STARTED", payload: true });
  }, [startGame]);

  useEffect(() => {
    if (!showNumber || guessResults.length === 0) return;
    const last = scoreHistory[scoreHistory.length - 1];
    if (last && last.guessResults === guessResults) return;

    const isWin = guessResults.some((r) => r.message === "you win");
    const record: ScoreRecord = {
      id: generateId(8),
      name: nameInput,
      score: calculateScore({
        guessResults,
        guessLimit,
        initialTimeLimit,
        timeLeft,
        difficultLevel,
      }),
      result: isWin ? "win" : "lose",
      attempts: guessResults.length,
      timeTaken: initialTimeLimit - timeLeft,
      date: new Date(),
      guessLimit,
      difficultLevel,
      guessResults,
    };

    addScoreRecord(record);
  }, [
    showNumber,
    guessResults,
    timeLeft,
    nameInput,
    scoreHistory,
    guessLimit,
    initialTimeLimit,
    difficultLevel,
    addScoreRecord,
  ]);

  // Clear all history and reset game state
  const clearAndReloadHistory = useCallback(() => {
    clearScoreHistory(); // Clear the history
    startGame(); // Restart the game
  }, [clearScoreHistory, startGame]);

  // Initial game start
  useEffect(startGame, [startGame]);

  return (
    <GuessNumContext.Provider
      value={{
        randomNumber,
        guessResults,
        showNumber,
        guessTurn,
        timeLeft,
        started,
        nameInput,

        startGame,
        makeGuess,
        restartGame,

        setStarted: (b) => dispatch({ type: "SET_STARTED", payload: b }),
        setNameInput,

        clearHistory: clearScoreHistory,
        clearAndReloadHistory, // Add this to the context
      }}
    >
      {children}
    </GuessNumContext.Provider>
  );
};

export function useGuessNum(): GuessNumContextType {
  const ctx = useContext(GuessNumContext);
  if (!ctx) throw new Error("useGuessNum must be used within GuessNumProvider");
  return ctx;
}
