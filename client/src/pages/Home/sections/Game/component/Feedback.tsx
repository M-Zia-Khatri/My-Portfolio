import { useEffect, useState } from "react";
import { Callout } from "@radix-ui/themes";
import { InfoCircledIcon, CheckCircledIcon, Cross2Icon } from "@radix-ui/react-icons";
import { useGuessNum } from "../features/context/GuessNumContext";

export default function Feedback() {
  const { guessResults } = useGuessNum();
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (guessResults.length === 0) return;

    const last = guessResults[guessResults.length - 1];
    setMessage(last.message);
    setVisible(true);

    const timer = window.setTimeout(() => {
      setVisible(false);
    }, 3500);

    return () => clearTimeout(timer);
  }, [guessResults]);

  if (!visible) return null;

  const isWin = message === "you win";
  const isClose = message === "very close";

  const color = isWin ? "green" : isClose ? "amber" : "blue";
  const Icon = isWin ? CheckCircledIcon : isClose ? InfoCircledIcon : Cross2Icon;

  return (
    <div className="fixed z-50 bottom-8 left-1/2 -translate-x-1/2 w-fit min-w-48">
      <Callout.Root color={color} variant="surface" size="2">
        <Callout.Icon>
          <Icon />
        </Callout.Icon>
        <Callout.Text className="capitalize font-medium">
          {message.replace(/cols/, "close")}
        </Callout.Text>
      </Callout.Root>
    </div>
  );
}