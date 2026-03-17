import SecComponent from "@/components/SecContainer";
import { HEADING } from "@/constants/style.constants";
import { Heading } from "@radix-ui/themes";
import GuessNumber from "./component/GuessNumber";

export default function GameSection() {
  return (
    <SecComponent className="w-full">
      <div className="flex w-full flex-col items-center gap-6">
        <Heading as="h2" size={HEADING.h2.size} className="font-bold">
          Game
        </Heading>
        <GuessNumber />
      </div>
    </SecComponent>
  );
}