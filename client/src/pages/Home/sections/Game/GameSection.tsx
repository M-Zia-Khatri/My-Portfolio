import { Card, Heading } from "@radix-ui/themes";
import { GuessNumProvider } from "./features/context/GuessNumContext";
import CheckHiddenNumber from "./component/CheckHiddenNumber";
import Feedback from "./component/Feedback";
import GuessResult from "./component/GuessResult";
import HiddenNumber from "./component/HiddenNumber";
import ScoreHistory from "./component/ScoreHistory";
import ViewDelHistory from "./component/ViewDelHistory";
import { HEADING } from "@/constants/style.constants";
import SecComponent from "@/components/SecContainer";

export default function GameSection() {
  return (
    <SecComponent className="w-full h-dvh" height={{ lg: '100%' }} py={"8"} >
      <GuessNumProvider>
        <div className="w-full h-full flex flex-col lg:flex-row gap-6">
          {/* Left: Results Summary (desktop only) */}
          <aside className="hidden lg:flex w-full lg:w-1/4 ">
            <Card
              size={'2'}
              className="w-full h-full flex flex-col"
              style={{
                // background: "var(--gray-2)",
                // outlineWidth: "2px",
              }}
            >
              <GuessResult />
            </Card>
          </aside>

          {/* Mobile feedback toast */}
          <Feedback />

          {/* Center: Game Area */}
          <section className="flex-1 flex flex-col gap-4">
            <Card size={'2'} className="w-full text-center">
              <Heading as="h2" size={HEADING.h2.size} className="font-bold">Gess the number</Heading>
            </Card>

            {/* Hidden Number + Timer */}
            <Card size={'3'}
            >
              <HiddenNumber />
            </Card>

            {/* Guess Buttons */}
            <Card size={"2"}
              className="flex-1 overflow-auto"
            >
              <CheckHiddenNumber />
            </Card>
          </section>

          {/* Right: Score History */}
          <aside className="w-full lg:w-1/3 ">
            <Card size={'2'}
              className="h-full flex flex-col justify-between gap-4"
            >
              <div className="flex-1 overflow-hidden">
                <ScoreHistory />
              </div>
              <ViewDelHistory />
            </Card>
          </aside>
        </div>
      </GuessNumProvider>
    </SecComponent>
  );
}