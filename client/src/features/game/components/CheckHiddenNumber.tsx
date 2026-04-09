import { Button } from '@radix-ui/themes';
import { useMemo } from 'react';
import { useGuessNumActions, useGuessNumState } from '../context/GuessNumContext';
import useGameSet from '../store/GameSetStore';
import type { GuessResultType } from '../types/guessNumContextTypes';

export default function CheckHiddenNumber() {
  const { showNumber, guessResults, started } = useGuessNumState();
  const { makeGuess } = useGuessNumActions();
  const maxNumber = useGameSet((state) => state.maxNumber);

  const numbers = useMemo(() => Array.from({ length: maxNumber }, (_, i) => i + 1), [maxNumber]);

  const resultMap = useMemo(() => {
    const m = new Map<number, GuessResultType>();
    guessResults.forEach((r) => m.set(r.guess, r));
    return m;
  }, [guessResults]);

  const getVariant = (result: GuessResultType | undefined) => {
    if (!result) return { color: 'gray' as const, variant: 'soft' as const };
    if (result.message === 'you win') return { color: 'green' as const, variant: 'solid' as const };
    if (result.message === 'very close')
      return { color: 'amber' as const, variant: 'solid' as const };
    return { color: 'blue' as const, variant: 'soft' as const };
  };

  return (
    <div className="flex flex-wrap justify-center gap-2">
      {numbers.map((n) => {
        const result = resultMap.get(n);
        const disabled = !!result || showNumber || !started;
        const { color, variant } = getVariant(result);

        return (
          <Button
            key={n}
            size="2"
            color={color}
            variant={variant}
            disabled={disabled}
            onClick={() => makeGuess(n)}
            style={{
              width: 40,
              height: 40,
              cursor: disabled ? 'not-allowed' : 'pointer',
            }}
          >
            {n}
          </Button>
        );
      })}
    </div>
  );
}
