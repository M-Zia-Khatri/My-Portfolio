import { memo } from "react";
import { motion } from "motion/react";
import type { TerminalLine as TLine } from "./types";

interface TerminalLineProps {
  line: TLine;
  /** The partial text being typed (only relevant when kind === "command" and isActive) */
  partial?: string;
  isActive: boolean;
  cursor: boolean;
  color: string;
  index: number;
}

const TerminalLine = memo(function TerminalLine({
  line,
  partial,
  isActive,
  cursor,
  color,
  index,
}: TerminalLineProps) {
  return (
    <motion.div
      // layout=false prevents layout recalculation on every re-render
      layout={false}
      // animate only on first mount; subsequent re-renders (cursor blink)
      // will not retrigger the entrance because animate matches the final state
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.1 }}
      className="flex items-start"
      style={{ minHeight: "1.6rem", fontFamily: "inherit" }}
    >
      {line.kind === "blank" ? (
        // Empty spacer — just reserves the row height
        <span className="leading-[1.6rem]">&nbsp;</span>
      ) : line.kind === "comment" ? (
        // Dimmed # comment
        <span
          className="text-[12.5px] leading-[1.6rem] whitespace-pre tracking-tight select-none"
          style={{ color: "rgba(255,255,255,0.28)" }}
        >
          {line.text}
        </span>
      ) : line.kind === "output" ? (
        // Output line — slightly dimmer, no prompt
        <span
          className="text-[12.5px] leading-[1.6rem] whitespace-pre tracking-tight pl-4"
          style={{ color: "rgba(255,255,255,0.55)" }}
        >
          {line.text}
        </span>
      ) : (
        // Command line with $ prompt
        <span className="flex items-center gap-0 text-[12.5px] leading-[1.6rem] whitespace-pre tracking-tight">
          {/* Prompt */}
          <span style={{ color: color }} className="select-none mr-1.5 font-bold">
            $
          </span>
          {/* Command text — partial while typing, full when done */}
          <span style={{ color: "#e2e8f0" }}>
            {isActive ? partial ?? "" : line.text}
          </span>
          {/* Blinking block cursor on the active command */}
          {isActive && (
            <span
              className="inline-block w-[2px] h-[13px] align-middle ml-[1px]"
              style={{
                background: color,
                opacity: cursor ? 1 : 0,
                transition: "opacity 0.08s",
              }}
            />
          )}
        </span>
      )}
    </motion.div>
  );
});

export default TerminalLine;