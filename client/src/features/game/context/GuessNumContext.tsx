import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
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

interface GuessNumMetaContextType {
  randomNumber: number | null;
  showNumber: boolean;
  guessTurn: number;
  started: boolean;
  playerName: string;
  didWin: boolean;
}

interface GuessNumResultsContextType {
  guessResults: GuessResultType[];
}

interface GuessNumTimerContextType {
  timeLeft: number;
}

interface GuessNumActionsContextType {
  startGame: (playerName?: string) => void;
  makeGuess: (guess: number) => void;
  restartGame: () => void;
  setStarted: (val: boolean) => void;
  clearHistory: VoidFunction;
  clearAndReloadHistory: VoidFunction;
}

const GuessNumMetaContext = createContext<GuessNumMetaContextType | undefined>(undefined);
const GuessNumResultsContext = createContext<GuessNumResultsContextType | undefined>(undefined);
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
  const { randomNumber, guessResults, showNumber, guessTurn, started, playerName, didWin } = state;

  const [_, startTransition] = useTransition();

  const randomNumberRef = useRef<number | null>(randomNumber);
  const showNumberRef = useRef(showNumber);

  useEffect(() => {
    randomNumberRef.current = randomNumber;
    showNumberRef.current = showNumber;
  }, [randomNumber, showNumber]);

  const { timeLeft, reset: resetTimer } = useTimer({
    initialTime: initialTimeLimit,
    isActive: started && !showNumber,
    onExpire: () => dispatch({ type: 'REVEAL_NUMBER' }),
  });

  const actionsValue = useMemo(
    () => ({
      startGame: (name?: string) => {
        if (typeof name === 'string') {
          dispatch({ type: 'SET_PLAYER_NAME', payload: name.trim() });
        }
        const num = Math.floor(Math.random() * maxNumber) + 1;
        dispatch({
          type: 'RESET_GAME',
          payload: { randomNumber: num, guessLimit },
        });
        resetTimer();
      },
      makeGuess: (guess: number) => {
        const currentNumber = randomNumberRef.current;
        if (currentNumber == null || showNumberRef.current) return;
        const dist = Math.abs(guess - currentNumber);
        const threshold = maxNumber / 100;
        let message: GuessResultType['message'];
        if (guess === currentNumber) message = 'you win';
        else if (dist <= threshold * 15) message = 'very close';
        else if (guess < currentNumber) message = 'too low';
        else message = 'too high';

        dispatch({ type: 'MAKE_GUESS', payload: { guess, message } });
      },
      restartGame: () => {
        const num = Math.floor(Math.random() * maxNumber) + 1;
        dispatch({
          type: 'RESET_GAME',
          payload: { randomNumber: num, guessLimit },
        });
        dispatch({ type: 'SET_STARTED', payload: true });
        resetTimer();
      },
      setStarted: (val: boolean) => dispatch({ type: 'SET_STARTED', payload: val }),
      clearHistory: clearScoreHistory,
      clearAndReloadHistory: () => {
        clearScoreHistory();
        const num = Math.floor(Math.random() * maxNumber) + 1;
        dispatch({
          type: 'RESET_GAME',
          payload: { randomNumber: num, guessLimit },
        });
        resetTimer();
      },
    }),
    [clearScoreHistory, guessLimit, maxNumber, resetTimer],
  );

  const gameSignature = useMemo(
    () => `${showNumber}-${guessResults.length}-${timeLeft}-${guessTurn}`,
    [showNumber, guessResults.length, timeLeft, guessTurn],
  );
  const lastSavedSignatureRef = useRef<string>('');

  useEffect(() => {
    if (!showNumber || guessResults.length === 0) return;
    if (lastSavedSignatureRef.current === gameSignature) return;

    const record: ScoreRecord = {
      id: generateId(8),
      name: playerName,
      score: calculateScore({
        guessResults,
        guessLimit,
        initialTimeLimit,
        timeLeft,
        difficultLevel,
      }),
      result: didWin ? 'win' : 'lose',
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
    addScoreRecord,
    difficultLevel,
    didWin,
    gameSignature,
    guessLimit,
    guessResults,
    initialTimeLimit,
    playerName,
    showNumber,
    timeLeft,
  ]);

  useEffect(() => {
    actionsValue.startGame();
  }, [actionsValue]);

  const metaValue = useMemo(
    () => ({ randomNumber, showNumber, guessTurn, started, playerName, didWin }),
    [didWin, guessTurn, playerName, randomNumber, showNumber, started],
  );

  const resultsValue = useMemo(() => ({ guessResults }), [guessResults]);
  const timerValue = useMemo(() => ({ timeLeft }), [timeLeft]);

  return (
    <GuessNumActionsContext.Provider value={actionsValue}>
      <GuessNumTimerContext.Provider value={timerValue}>
        <GuessNumMetaContext.Provider value={metaValue}>
          <GuessNumResultsContext.Provider value={resultsValue}>
            {children}
          </GuessNumResultsContext.Provider>
        </GuessNumMetaContext.Provider>
      </GuessNumTimerContext.Provider>
    </GuessNumActionsContext.Provider>
  );
};

export function useGuessNumMeta(): GuessNumMetaContextType {
  const ctx = useContext(GuessNumMetaContext);
  if (!ctx) throw new Error('useGuessNumMeta must be used within GuessNumProvider');
  return ctx;
}

export function useGuessNumResults(): GuessNumResultsContextType {
  const ctx = useContext(GuessNumResultsContext);
  if (!ctx) throw new Error('useGuessNumResults must be used within GuessNumProvider');
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
    ...useGuessNumMeta(),
    ...useGuessNumResults(),
    ...useGuessNumTimer(),
    ...useGuessNumActions(),
  };
}
