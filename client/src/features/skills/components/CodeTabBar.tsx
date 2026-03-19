import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { Skill } from "../types";

interface CodeTabBarProps {
  skill: Skill;
  openTabs: Skill[];
  onTabClick: (skill: Skill) => void;
  onTabClose: (skill: Skill) => void;
}

export default function CodeTabBar({
  skill,
  openTabs,
  onTabClick,
  onTabClose,
}: CodeTabBarProps) {
  const tabBarRef = useRef<HTMLDivElement>(null);

  // Auto-scroll the active tab into view whenever it changes
  useEffect(() => {
    const bar = tabBarRef.current;
    if (!bar) return;
    bar
      .querySelector<HTMLElement>("[data-active='true']")
      ?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
  }, [skill.name, openTabs.length]);

  return (
    <div
      className="flex items-stretch shrink-0"
      style={{
        background: "rgba(0,0,0,0.5)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {/* macOS window dots */}
      <div className="flex items-center gap-[6px] px-3 shrink-0">
        {(["#ff5f57", "#febc2e", "#28c840"] as const).map((c, i) => (
          <motion.span
            key={i}
            whileHover={{ scale: 1.25 }}
            className="w-[11px] h-[11px] rounded-full inline-block cursor-default"
            style={{ background: c }}
          />
        ))}
      </div>

      <div className="w-px my-2 bg-white/10 shrink-0" />

      {/* Scrollable tabs */}
      <div
        ref={tabBarRef}
        className="tab-scrollbar flex items-stretch flex-1 min-w-0"
      >
        <AnimatePresence initial={false}>
          {openTabs.map((tab) => {
            const isActive = tab.name === skill.name;
            return (
              <motion.div
                key={tab.name}
                data-active={isActive}
                initial={{ opacity: 0, maxWidth: 0, paddingLeft: 0, paddingRight: 0 }}
                animate={{ opacity: 1, maxWidth: 200, paddingLeft: 12, paddingRight: 12 }}
                exit={{ opacity: 0, maxWidth: 0, paddingLeft: 0, paddingRight: 0 }}
                transition={{ duration: 0.22, ease: "easeInOut" }}
                onClick={() => onTabClick(tab)}
                className="relative flex items-center gap-[7px] text-[11px] leading-none
                           select-none cursor-pointer shrink-0 overflow-hidden group/tab"
                style={{
                  background: isActive ? `${tab.color}16` : "transparent",
                  borderRight: "1px solid rgba(255,255,255,0.06)",
                  color: isActive ? tab.color : "rgba(255,255,255,0.38)",
                  paddingTop: 9,
                  paddingBottom: 9,
                }}
              >
                {/* Sliding active underline */}
                {isActive && (
                  <motion.span
                    layoutId="tab-underline"
                    className="absolute bottom-0 left-0 right-0 h-[2px]"
                    style={{ background: tab.color }}
                    transition={{ type: "spring", stiffness: 340, damping: 28 }}
                  />
                )}

                {/* Icon wobble when tab becomes active */}
                <motion.span
                  animate={isActive ? { rotate: [0, 10, -8, 0] } : { rotate: 0 }}
                  transition={{ duration: 0.45, ease: "easeInOut" }}
                  className="shrink-0"
                >
                  <tab.icon size={12} />
                </motion.span>

                <span className="whitespace-nowrap font-medium tracking-tight">
                  {tab.fileName}
                </span>

                {/* Close button: idle dot → ✕ on hover */}
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    onTabClose(tab);
                  }}
                  whileTap={{ scale: 0.75 }}
                  className="relative flex items-center justify-center w-[14px] h-[14px]
                             ml-0.5 cursor-pointer shrink-0 text-[10px]"
                  style={{ color: tab.color }}
                  aria-label={`Close ${tab.fileName}`}
                >
                  <motion.span
                    className="absolute w-[5px] h-[5px] rounded-full"
                    style={{ background: tab.color, opacity: 0.5 }}
                    whileHover={{ opacity: 0, scale: 0 }}
                    transition={{ duration: 0.12 }}
                  />
                  <motion.span
                    className="absolute text-red-400"
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileHover={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.12 }}
                  >
                    ✕
                  </motion.span>
                </motion.button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Language badge — pinned right */}
      <div className="px-4 flex items-center text-[10px] tracking-widest opacity-25
                      text-white uppercase shrink-0">
        {skill.lang}
      </div>
    </div>
  );
}
