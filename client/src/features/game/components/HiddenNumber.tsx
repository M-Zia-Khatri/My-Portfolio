import { useMemo } from "react";
import { Button, Text, TextField } from "@radix-ui/themes";
import { useGuessNum } from "../context/GuessNumContext";
import SelDifficultLevel from "./SelDifficultLevel";
import { TEXT } from "@/shared/constants/style.constants";
import {  Timer } from "lucide-react";

export default function HiddenNumber() {
  const {
    restartGame,
    randomNumber,
    showNumber,
    guessResults,
    timeLeft,
    started,
    setStarted,
    nameInput,
    setNameInput,
  } = useGuessNum();

  const isWin = useMemo(
    () => guessResults.some((r) => r.message === "you win"),
    [guessResults]
  );

  const formattedTime = useMemo(() => {
    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }, [timeLeft]);

  const isUrgent = timeLeft <= 30 && started && !showNumber;

  const handlePlayAgain = () => {
    restartGame();
    setStarted(true);
  };

  return (
    <section className="flex flex-col gap-5">
      {/* Timer row + Difficulty selector */}
      <div className="flex items-center justify-between gap-3">
        <Text
          size={TEXT.lg.size}
          className="font-extrabold flex items-center "
          color={isUrgent ? 'red' : 'blue'}
        >
          <Timer size={16} />&nbsp; {formattedTime}
        </Text>

        {/* Disabled once game is in progress */}
        <div style={{ opacity: started && !showNumber ? 0.4 : 1, pointerEvents: started && !showNumber ? "none" : "auto" }}>
          <SelDifficultLevel />
        </div>
      </div>

      {/* Pre-start: enter name & play */}
      {!started && !showNumber && (
        <div className="flex flex-col items-center gap-4">
          <TextField.Root
            placeholder="Enter your name"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            size="3"
            style={{ maxWidth: 280, width: "100%" }}
          />
          <Button
            size="3"
            variant="solid"
            color="blue"
            onClick={() => setStarted(true)}
            style={{ minWidth: 120 }}
          >
            Start
          </Button>
        </div>
      )}

      {/* Hidden number display */}
      {started && (
        <div className="flex justify-center">
          <div
            className="w-28 h-28 flex items-center justify-center rounded-full text-5xl font-extrabold transition-all duration-500"
            style={
              showNumber
                ? {
                  background: isWin ? "var(--green-4)" : "var(--red-4)",
                  color: isWin ? "var(--green-11)" : "var(--red-11)",
                  border: `3px solid ${isWin ? "var(--green-7)" : "var(--red-7)"}`,
                  boxShadow: `0 0 32px ${isWin ? "var(--green-a6)" : "var(--red-a6)"}`,
                }
                : {
                  background: "var(--blue-4)",
                  color: "transparent",
                  border: "3px solid var(--blue-7)",
                  boxShadow: "0 0 32px var(--blue-a5)",
                }
            }
          >
            {showNumber ? randomNumber : "??"}
          </div>
        </div>
      )}

      {/* Post-game result & replay */}
      {showNumber && (
        <div className="text-center flex flex-col items-center gap-3">
          <Text
            size="4"
            weight="bold"
            style={{ color: isWin ? "var(--green-11)" : "var(--red-11)" }}
          >
            {isWin
              ? "🎉 You got it!"
              : timeLeft === 0
                ? "⏰ Time's up — try again"
                : "You lose — try again"}
          </Text>
          <Button
            size="3"
            variant="solid"
            color={isWin ? "green" : "blue"}
            onClick={handlePlayAgain}
            style={{ minWidth: 140 }}
          >
            Play Again
          </Button>
        </div>
      )}
    </section>
  );
}