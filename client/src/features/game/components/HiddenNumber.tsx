import { TEXT } from '@/shared/constants/style.constants';
import { Button, Text, TextField } from '@radix-ui/themes';
import { Timer } from 'lucide-react';
import { memo, useState } from 'react';
import { useGuessNumActions, useGuessNumMeta, useGuessNumTimer } from '../context/GuessNumContext';
import SelDifficultLevel from './SelDifficultLevel';

const TimerAndLevel = memo(function TimerAndLevel() {
  const { started, showNumber } = useGuessNumMeta();
  const { timeLeft } = useGuessNumTimer();

  const m = Math.floor(timeLeft / 60);
  const s = timeLeft % 60;
  const formattedTime = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  const isUrgent = timeLeft <= 30 && started && !showNumber;

  return (
    <div className="flex items-center justify-between gap-3">
      <Text
        size={TEXT.lg.size}
        className="flex items-center font-extrabold"
        color={isUrgent ? 'red' : 'blue'}
      >
        <Timer size={16} />
        &nbsp; {formattedTime}
      </Text>

      <div
        style={{
          opacity: started && !showNumber ? 0.4 : 1,
          pointerEvents: started && !showNumber ? 'none' : 'auto',
        }}
      >
        <SelDifficultLevel />
      </div>
    </div>
  );
});

const StartControls = memo(function StartControls() {
  const { started, showNumber, playerName } = useGuessNumMeta();
  const { startGame, setStarted } = useGuessNumActions();
  const [draftName, setDraftName] = useState(playerName);

  if (started || showNumber) return null;

  const canStart = draftName.trim().length > 0;

  return (
    <div className="flex flex-col items-center gap-4">
      <TextField.Root
        placeholder="Enter your name"
        value={draftName}
        onChange={(e) => setDraftName(e.target.value)}
        size="3"
        style={{ maxWidth: 280, width: '100%' }}
      />
      <Button
        size="3"
        variant="solid"
        color="blue"
        onClick={() => {
          startGame(draftName);
          setStarted(true);
        }}
        disabled={!canStart}
        style={{ minWidth: 120 }}
      >
        Start
      </Button>
    </div>
  );
});

const HiddenBall = memo(function HiddenBall() {
  const { started, showNumber, randomNumber, didWin } = useGuessNumMeta();

  if (!started) return null;

  return (
    <div className="flex justify-center">
      <div
        className="flex h-28 w-28 items-center justify-center rounded-full text-5xl font-extrabold transition-all duration-500"
        style={
          showNumber
            ? {
                background: didWin ? 'var(--green-4)' : 'var(--red-4)',
                color: didWin ? 'var(--green-11)' : 'var(--red-11)',
                border: `3px solid ${didWin ? 'var(--green-7)' : 'var(--red-7)'}`,
                boxShadow: `0 0 32px ${didWin ? 'var(--green-a6)' : 'var(--red-a6)'}`,
              }
            : {
                background: 'var(--blue-4)',
                color: 'transparent',
                border: '3px solid var(--blue-7)',
                boxShadow: '0 0 32px var(--blue-a5)',
              }
        }
      >
        {showNumber ? randomNumber : '??'}
      </div>
    </div>
  );
});

const PostGameResult = memo(function PostGameResult() {
  const { showNumber, didWin } = useGuessNumMeta();
  const { timeLeft } = useGuessNumTimer();
  const { restartGame } = useGuessNumActions();

  if (!showNumber) return null;

  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <Text size="4" weight="bold" style={{ color: didWin ? 'var(--green-11)' : 'var(--red-11)' }}>
        {didWin ? '🎉 You got it!' : timeLeft === 0 ? "⏰ Time's up — try again" : 'You lose — try again'}
      </Text>
      <Button
        size="3"
        variant="solid"
        color={didWin ? 'green' : 'blue'}
        onClick={restartGame}
        style={{ minWidth: 140 }}
      >
        Play Again
      </Button>
    </div>
  );
});

export default function HiddenNumber() {
  return (
    <section className="flex flex-col gap-5">
      <TimerAndLevel />
      <StartControls />
      <HiddenBall />
      <PostGameResult />
    </section>
  );
}
