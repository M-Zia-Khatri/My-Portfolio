import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
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

interface GuessNumStateContextType {
  randomNumber: number | null;
  guessResults: GuessResultType[];
  showNumber: boolean;
  guessTurn: number;
  started: boolean;
  nameInput: string;
}

interface GuessNumTimerContextType {
  timeLeft: number;
}

interface GuessNumActionsContextType {
  startGame: () => void;
  makeGuess: (guess: number) => void;
  restartGame: () => void;
  setStarted: (val: boolean) => void;
  setNameInput: React.Dispatch<React.SetStateAction<string>>;
  clearHistory: VoidFunction;
  clearAndReloadHistory: VoidFunction;
}

const GuessNumStateContext = createContext<GuessNumStateContextType | undefined>(undefined);
const GuessNumTimerContext = createContext<GuessNumTimerContextType | undefined>(undefined);
const GuessNumActionsContext = createContext<GuessNumActionsContextType | undefined>(undefined);

type Props = { children: ReactNode };

export const GuessNumProvider: React.FC<Props> = ({ children }) => {
  const maxNumber = useGameSet((state) => state.maxNumber);
  const guessLimit = useGameSet((state) => state.guessLimit);
  const initialTimeLimit = useGameSet((state) => state.timeLimit);
  const difficultLevel = useGameSet((state) => state.difficultLevel);
  const addScoreRecord = useGameSet((state) => state.addScoreRecord);
  const clearScoreHistory = useGameSet((state) => state.clearScoreHistory);

  const [state, dispatch] = useReducer(gameReducer, initialGameState(guessLimit));
  const { randomNumber, guessResults, showNumber, guessTurn, started } = state;

  const [nameInput, setNameInput] = useState('');
  const [_, startTransition] = useTransition();

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

  const setStarted = useCallback((val: boolean) => {
    dispatch({ type: 'SET_STARTED', payload: val });
  }, []);

  const restartGame = useCallback(() => {
    startGame();
    setStarted(true);
  }, [startGame, setStarted]);

  const gameSignature = useMemo(
    () => `${showNumber}-${guessResults.length}-${timeLeft}-${guessTurn}`,
    [showNumber, guessResults.length, timeLeft, guessTurn],
  );
  const lastSavedSignatureRef = useRef<string>('');

  useEffect(() => {
    if (!showNumber || guessResults.length === 0) return;
    if (lastSavedSignatureRef.current === gameSignature) return;

    const isWin = guessResults.some((r) => r.message === 'you win');
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

    startTransition(() => {
      addScoreRecord(record);
    });
    lastSavedSignatureRef.current = gameSignature;
  }, [
    showNumber,
    guessResults,
    timeLeft,
    nameInput,
    guessLimit,
    initialTimeLimit,
    difficultLevel,
    gameSignature,
    addScoreRecord,
  ]);

  const clearAndReloadHistory = useCallback(() => {
    clearScoreHistory();
    startGame();
  }, [clearScoreHistory, startGame]);

  useEffect(startGame, [startGame]);

  const stateValue = useMemo(
    () => ({ randomNumber, guessResults, showNumber, guessTurn, started, nameInput }),
    [randomNumber, guessResults, showNumber, guessTurn, started, nameInput],
  );

  const timerValue = useMemo(() => ({ timeLeft }), [timeLeft]);

  const actionsValue = useMemo(
    () => ({
      startGame,
      makeGuess,
      restartGame,
      setStarted,
      setNameInput,
      clearHistory: clearScoreHistory,
      clearAndReloadHistory,
    }),
    [startGame, makeGuess, restartGame, setStarted, clearScoreHistory, clearAndReloadHistory],
  );

  return (
    <GuessNumActionsContext.Provider value={actionsValue}>
      <GuessNumTimerContext.Provider value={timerValue}>
        <GuessNumStateContext.Provider value={stateValue}>{children}</GuessNumStateContext.Provider>
      </GuessNumTimerContext.Provider>
    </GuessNumActionsContext.Provider>
  );
};

export function useGuessNumState(): GuessNumStateContextType {
  const ctx = useContext(GuessNumStateContext);
  if (!ctx) throw new Error('useGuessNumState must be used within GuessNumProvider');
  return ctx;
}

export function useGuessNumTimer(): GuessNumTimerContextType {
  const ctx = useContext(GuessNumTimerContext);
  if (!ctx) throw new Error('useGuessNumTimer must be used within GuessNumProvider');
  return ctx;
}

export function useGuessNumActions(): GuessNumActionsContextType {
  const ctx = useContext(GuessNumActionsContext);
  if (!ctx) throw new Error('useGuessNumActions must be used within GuessNumProvider');
  return ctx;
}

export function useGuessNum() {
  return {
    ...useGuessNumState(),
    ...useGuessNumTimer(),
    ...useGuessNumActions(),
  };
}
