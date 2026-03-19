import { useMemo } from "react";
import { useGuessNum } from "../features/context/GuessNumContext";
import useGameSet from "../features/stores/GameSetStore";
import type { GuessResultType } from "../features/types/guessNumContextTypes";
import { Button } from "@radix-ui/themes";

export default function CheckHiddenNumber() {
  const { makeGuess, showNumber, guessResults, started } = useGuessNum();
  const { maxNumber } = useGameSet();

  const numbers = useMemo(
    () => Array.from({ length: maxNumber }, (_, i) => i + 1),
    [maxNumber]
  );

  const resultMap = useMemo(() => {
    const m = new Map<number, GuessResultType>();
    guessResults.forEach((r) => m.set(r.guess, r));
    return m;
  }, [guessResults]);

  const getVariant = (result: GuessResultType | undefined) => {
    if (!result) return { color: "gray" as const, variant: "soft" as const };
    if (result.message === "you win")
      return { color: "green" as const, variant: "solid" as const };
    if (result.message === "very close")
      return { color: "amber" as const, variant: "solid" as const };
    return { color: "blue" as const, variant: "soft" as const };
  };

  return (
    <div className="flex flex-wrap gap-2 justify-center">
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
            style={{ width: 40, height: 40, cursor: disabled ? "not-allowed" : "pointer" }}
          >
            {n}
          </Button>
        );
      })}
    </div>
  );
}