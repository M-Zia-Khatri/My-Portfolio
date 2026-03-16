import SecComponent from "@/components/SecContainer";
import { PortfolioItemCard } from "./PortfolioItemCard";
import { Box, Heading } from "@radix-ui/themes";
import { motion } from "motion/react";
import type { PortfolioItem } from "./types";

// Defined once at module level — never recreated on re-render
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 80, damping: 18 } },
};

const headingVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const lineVariants = {
  hidden: { scaleX: 0, opacity: 0 },
  visible: { scaleX: 1, opacity: 1, transition: { duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] } },
};

const VIEWPORT_ONCE = { once: true, margin: "-60px" } as const;
const VIEWPORT_GRID = { once: true, margin: "-80px" } as const;

// Static mock — move to props or a data file in production
const MOCK_ITEM:PortfolioItem = {
  siteName: "xyz",
  siteRole: "xyz role",
  siteUrl: "https://www.google.com",
  siteImageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSAyyRRzS5-kkk_Y5vm3O5MBZjWYsczQsR9qA&s",
  useTech: ["react", "ts", "node.js"],
  description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Exercitationem enim at veritatis aut ipsum unde dolorum assumenda?",
} as const;

const ITEMS = [1, 2, 3, 4, 5, 6];

export default function PortfolioSection() {
  return (
    <SecComponent className="w-full">
      <Box className="flex flex-col items-center gap-10">

        <motion.div
          className="flex flex-col items-center gap-2 text-center"
          variants={headingVariants}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
        >
          <span className="text-[11px] font-semibold tracking-[0.22em] uppercase text-(--blue-10)">
            Selected Work
          </span>
          <Heading as="h2" className="text-white font-bold">Portfolio</Heading>
          <motion.div
            className="mt-1 w-12 h-0.5 bg-linear-to-r from-transparent via-(--blue-7) to-transparent rounded-full"
            variants={lineVariants}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_ONCE}
          />
        </motion.div>

        <motion.div
          className="grid grid-cols-2 w-full gap-5"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_GRID}
        >
          {ITEMS.map((item) => (
            <motion.div key={item} variants={cardVariants}>
              <PortfolioItemCard item={MOCK_ITEM} />
            </motion.div>
          ))}
        </motion.div>

      </Box>
    </SecComponent>
  );
}