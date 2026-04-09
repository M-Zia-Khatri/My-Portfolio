import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useState,
  useTransition,
  type ReactNode,
} from 'react';
import useTimer from '../hooks/useTimer';
import { generateId } from '../services/idGenerator';
import useGameSet, { type ScoreRecord } from '../store/GameSetStore';
import type { GuessResultType } from '../types/guessNumContextTypes';
import { gameReducer, initialGameState } from './gameReducer';

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
  const attemptScore = guessResults.length ? (guessLimit / guessResults.length) * 100 : 0;
  const timeScore = initialTimeLimit ? (timeLeft / initialTimeLimit) * 100 : 0;
  const closeBonus = guessResults.reduce((sum, { message }) => {
    return message === 'very close' ? sum + 10 : sum;
  }, 0);
  const levelBonus =
    {
      easy: 100,
      normal: 200,
      hard: 400,
      'very-hard': 800,
      custom: 300,
    }[difficultLevel] ?? 0;

  return attemptScore + timeScore + closeBonus + levelBonus;
}

// --- 1. Game Engine Context (Stable State & Actions) ---
interface GameEngineContextType {
  randomNumber: number | null;
  guessResults: GuessResultType[];
  showNumber: boolean;
  guessTurn: number;
  started: boolean;
  startGame: () => void;
  makeGuess: (guess: number) => void;
  restartGame: () => void;
  setStarted: (val: boolean) => void;
  clearHistory: VoidFunction;
  clearAndReloadHistory: VoidFunction;
}

const GameEngineContext = createContext<GameEngineContextType | undefined>(undefined);

// --- 2. Game Timer Context (High Frequency Updates) ---
interface GameTimerContextType {
  timeLeft: number;
}

const GameTimerContext = createContext<GameTimerContextType | undefined>(undefined);

// --- 3. Game User Input Context (High Frequency Updates) ---
interface GameUserInputContextType {
  nameInput: string;
  setNameInput: React.Dispatch<React.SetStateAction<string>>;
}

const GameUserInputContext = createContext<GameUserInputContextType | undefined>(undefined);

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

  const [state, dispatch] = useReducer(gameReducer, initialGameState(guessLimit));
  const { randomNumber, guessResults, showNumber, guessTurn, started } = state;

  const [nameInput, setNameInput] = useState('');
  const [isPending, startTransition] = useTransition();

  const { timeLeft, reset: resetTimer } = useTimer({
    initialTime: initialTimeLimit,
    isActive: started && !showNumber,
    onExpire: () => dispatch({ type: 'REVEAL_NUMBER' }),
  });

  const startGame = useCallback(() => {
    const num = Math.floor(Math.random() * maxNumber) + 1;
    dispatch({
      type: 'RESET_GAME',
      payload: { randomNumber: num, guessLimit },
    });
    resetTimer();
  }, [maxNumber, guessLimit, resetTimer]);

  const makeGuess = useCallback(
    (guess: number) => {
      if (randomNumber == null || showNumber) return;
      const dist = Math.abs(guess - randomNumber);
      const threshold = maxNumber / 100;
      let message: GuessResultType['message'];
      if (guess === randomNumber) message = 'you win';
      else if (dist <= threshold * 15) message = 'very close';
      else if (guess < randomNumber) message = 'too low';
      else message = 'too high';

      dispatch({ type: 'MAKE_GUESS', payload: { guess, message } });
    },
    [randomNumber, showNumber, maxNumber],
  );

  const restartGame = useCallback(() => {
    startGame();
    dispatch({ type: 'SET_STARTED', payload: true });
  }, [startGame]);

  useEffect(() => {
    if (!showNumber || guessResults.length === 0) return;
    const last = scoreHistory[scoreHistory.length - 1];
    if (last && last.guessResults === guessResults) return;

    const isWin = guessResults.some((r) => r.message === 'you win');

    // Use transition for non-urgent state update (adding to history)
    startTransition(() => {
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
        result: isWin ? 'win' : 'lose',
        attempts: guessResults.length,
        timeTaken: initialTimeLimit - timeLeft,
        date: new Date(),
        guessLimit,
        difficultLevel,
        guessResults,
      };
      addScoreRecord(record);
    });
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

  const clearAndReloadHistory = useCallback(() => {
    clearScoreHistory();
    startGame();
  }, [clearScoreHistory, startGame]);

  useEffect(startGame, [startGame]);

  const engineValue: GameEngineContextType = {
    randomNumber,
    guessResults,
    showNumber,
    guessTurn,
    started,
    startGame,
    makeGuess,
    restartGame,
    setStarted: (b) => dispatch({ type: 'SET_STARTED', payload: b }),
    clearHistory: clearScoreHistory,
    clearAndReloadHistory,
  };

  const timerValue: GameTimerContextType = {
    timeLeft,
  };

  const inputValue: GameUserInputContextType = {
    nameInput,
    setNameInput,
  };

  return (
    <GameEngineContext.Provider value={engineValue}>
      <GameTimerContext.Provider value={timerValue}>
        <GameUserInputContext.Provider value={inputValue}>
          {children}
        </GameUserInputContext.Provider>
      </GameTimerContext.Provider>
    </GameEngineContext.Provider>
  );
};

// --- Specialized Hooks ---

export function useGameEngine(): GameEngineContextType {
  const ctx = useContext(GameEngineContext);
  if (!ctx) throw new Error('useGameEngine must be used within GuessNumProvider');
  return ctx;
}

export function useGameTimer(): GameTimerContextType {
  const ctx = useContext(GameTimerContext);
  if (!ctx) throw new Error('useGameTimer must be used within GuessNumProvider');
  return ctx;
}

export function useGameUserInput(): GameUserInputContextType {
  const ctx = useContext(GameUserInputContext);
  if (!ctx) throw new Error('useGameUserInput must be used within GuessNumProvider');
  return ctx;
}

// Deprecated compatibility hook - will be replaced in Task #4
export function useGuessNum(): GameEngineContextType & GameTimerContextType & GameUserInputContextType {
  const engine = useGameEngine();
  const timer = useGameTimer();
  const input = useGameUserInput();
  return { ...engine, ...timer, ...input };
}
