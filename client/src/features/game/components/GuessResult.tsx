import { TEXT } from '@/shared/constants/style.constants';
import { CheckCircledIcon, CrossCircledIcon } from '@radix-ui/react-icons';
import { Badge, Callout, Card, Separator, Strong, Text } from '@radix-ui/themes';
import { useMemo } from 'react';
import { useGuessNum } from '../context/GuessNumContext';

const feedbackColor = (message: string) => {
  if (message === 'you win') return 'green';
  if (message === 'very close') return 'amber';
  if (message === 'too low') return 'blue';
  return 'red';
};

export default function GuessResult() {
  const { guessResults, guessTurn, showNumber, randomNumber } = useGuessNum();

  const didWin = useMemo(() => guessResults.some((r) => r.message === 'you win'), [guessResults]);

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Turns left */}
      <Card
        // variant="go"
        className="px-4 py-3 text-center"
        // style={{ background: "var(--gray-3)" }}
      >
        <Text size={TEXT.lg.size} style={{ color: 'var(--gray-11)' }}>
          Guesses left:{' '}
          <Text
            size={TEXT.lg.size}
            className="font-black"
            // weight="bold"
            style={{
              color: guessTurn <= 2 ? 'var(--red-11)' : 'var(--blue-11)',
            }}
          >
            {guessTurn}
          </Text>
        </Text>
      </Card>

      <Separator size="4" className="h-0.375" />

      {/* Guess history */}
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto pr-1">
        {guessResults.length === 0 && (
          <Text size={TEXT.base.size} className="mt-4 text-center font-medium italic">
            No guesses yet.
          </Text>
        )}
        {guessResults.map((result, i) => (
          <Card
            size={'1'}
            key={`${result.guess}-${i}`}
            className="flex items-center justify-between"
            // style={{ background: "var(--gray-3)", border: "1px solid var(--gray-5)" }}
          >
            <Text size={TEXT.base.size} weight="medium">
              #{i + 1} <span className="text-(--blue-11)"> — </span> <Strong>{result.guess}</Strong>
            </Text>
            <Badge
              className="px-2.5"
              color={feedbackColor(result.message) as any}
              variant="soft"
              radius="full"
            >
              {result.message}
            </Badge>
          </Card>
        ))}
      </div>

      {/* Final outcome */}
      {showNumber && randomNumber != null && (
        <Callout.Root color={didWin ? 'green' : 'red'} variant="surface">
          <Callout.Icon>{didWin ? <CheckCircledIcon /> : <CrossCircledIcon />}</Callout.Icon>
          <Callout.Text>
            {didWin ? '🎉 You Win!' : '😢 You Lose!'} The number was <strong>{randomNumber}</strong>
          </Callout.Text>
        </Callout.Root>
      )}
    </div>
  );
}
