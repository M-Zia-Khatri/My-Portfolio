import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef } from 'react';
import type { Skill } from '../types';

interface CodeTabBarProps {
  skill: Skill;
  openTabs: Skill[];
  onTabClick: (skill: Skill) => void;
  onTabClose: (skill: Skill) => void;
}

const TAB_PADDING_PX = 12;

export default function CodeTabBar({ skill, openTabs, onTabClick, onTabClose }: CodeTabBarProps) {
  const tabBarRef = useRef<HTMLDivElement>(null);
  const hasMountedRef = useRef(false);

  useEffect(() => {
    const bar = tabBarRef.current;
    if (!bar) return;

    const activeTab = bar.querySelector<HTMLElement>("[data-active='true']");
    if (!activeTab) return;

    // Guard initial render to avoid any mount-time viewport scrolling.
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    // Scroll only the horizontal tab strip (never the document viewport).
    const barRect = bar.getBoundingClientRect();
    const tabRect = activeTab.getBoundingClientRect();

    const overflowLeft = tabRect.left - barRect.left;
    const overflowRight = tabRect.right - barRect.right;

    if (overflowLeft < 0) {
      bar.scrollTo({
        left: bar.scrollLeft + overflowLeft - TAB_PADDING_PX,
        behavior: 'smooth',
      });
      return;
    }

    if (overflowRight > 0) {
      bar.scrollTo({
        left: bar.scrollLeft + overflowRight + TAB_PADDING_PX,
        behavior: 'smooth',
      });
    }
  }, [skill.name, openTabs.length]);

  return (
    <div
      className="flex shrink-0 items-stretch"
      style={{
        background: 'rgba(0,0,0,0.5)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {/* macOS window dots */}
      <div className="flex shrink-0 items-center gap-[6px] px-3">
        {(['#ff5f57', '#febc2e', '#28c840'] as const).map((c, i) => (
          <motion.span
            key={i}
            whileHover={{ scale: 1.25 }}
            className="inline-block h-[11px] w-[11px] cursor-default rounded-full"
            style={{ background: c }}
          />
        ))}
      </div>

      <div className="my-2 w-px shrink-0 bg-white/10" />

      {/* Scrollable tabs */}
      <div ref={tabBarRef} className="tab-scrollbar flex min-w-0 flex-1 items-stretch">
        <AnimatePresence initial={false}>
          {openTabs.map((tab) => {
            const isActive = tab.name === skill.name;
            // B4 fixed: read iconComponent (the resolved React component) instead of icon.
            const TabIcon = tab.iconComponent;
            return (
              <motion.div
                key={tab.name}
                data-active={isActive}
                initial={{ opacity: 0, maxWidth: 0, paddingLeft: 0, paddingRight: 0 }}
                animate={{ opacity: 1, maxWidth: 200, paddingLeft: 12, paddingRight: 12 }}
                exit={{ opacity: 0, maxWidth: 0, paddingLeft: 0, paddingRight: 0 }}
                transition={{ duration: 0.22, ease: 'easeInOut' }}
                onClick={() => onTabClick(tab)}
                className="group/tab relative flex shrink-0 cursor-pointer items-center gap-[7px] overflow-hidden text-[11px] leading-none select-none"
                style={{
                  background: isActive ? `${tab.color}16` : 'transparent',
                  borderRight: '1px solid rgba(255,255,255,0.06)',
                  color: isActive ? tab.color : 'rgba(255,255,255,0.38)',
                  paddingTop: 9,
                  paddingBottom: 9,
                }}
              >
                {isActive && (
                  <motion.span
                    layoutId="tab-underline"
                    className="absolute right-0 bottom-0 left-0 h-[2px]"
                    style={{ background: tab.color }}
                    transition={{ type: 'spring', stiffness: 340, damping: 28 }}
                  />
                )}

                <motion.span
                  animate={isActive ? { rotate: [0, 10, -8, 0] } : { rotate: 0 }}
                  transition={{ duration: 0.45, ease: 'easeInOut' }}
                  className="shrink-0"
                >
                  {/* B4 fixed: was tab.icon — now tab.iconComponent */}
                  <TabIcon size={12} />
                </motion.span>

                <span className="font-medium tracking-tight whitespace-nowrap">{tab.fileName}</span>

                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    onTabClose(tab);
                  }}
                  whileTap={{ scale: 0.75 }}
                  className="relative ml-0.5 flex h-[14px] w-[14px] shrink-0 cursor-pointer items-center justify-center text-[10px]"
                  style={{ color: tab.color }}
                  aria-label={`Close ${tab.fileName}`}
                >
                  <motion.span
                    className="absolute h-[5px] w-[5px] rounded-full"
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

      {/* Language badge */}
      <div className="flex shrink-0 items-center px-4 text-[10px] tracking-widest text-white uppercase opacity-25">
        {skill.lang}
      </div>
    </div>
  );
}
