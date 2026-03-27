import { PortfolioItemCard } from '@/features/portfolio/components/PortfolioItemCard';
import type { PortfolioItem } from '@/features/portfolio/types';
import SecComponent from '@/shared/components/SecContainer';
import { TEXT } from '@/shared/constants/style.constants';
import { Box, Heading, Text } from '@radix-ui/themes';
import { motion, type Variants } from 'motion/react';

// ✅ Explicit typing
const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 80, damping: 18 },
  },
};

const headingVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

// ✅ These are already correct
const VIEWPORT_ONCE = { once: true, margin: '-60px' } as const;
const VIEWPORT_GRID = { once: true, margin: '-80px' } as const;

const MOCK_ITEM: PortfolioItem = {
  siteName: 'xyz',
  siteRole: 'xyz role',
  siteUrl: 'https://www.google.com',
  siteImageUrl:
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSAyyRRzS5-kkk_Y5vm3O5MBZjWYsczQsR9qA&s',
  useTech: ['react', 'ts', 'node.js'],
  description:
    'Lorem ipsum dolor sit amet consectetur adipisicing elit. Exercitationem enim at veritatis aut ipsum unde dolorum assumenda?',
};

const ITEMS = [1, 2, 3, 4, 5, 6];

export default function PortfolioSection() {
  return (
    <SecComponent className="w-full" py="8">
      <Box className="flex flex-col items-center gap-10">
        <motion.div
          className="flex flex-col items-center gap-2 text-center"
          variants={headingVariants}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
        >
          <Heading as="h2" className="font-bold">
            Portfolio
          </Heading>

          <Text size={TEXT.sm.size} color="blue">
            Selected Work
          </Text>
        </motion.div>

        <motion.div
          className="grid w-full grid-cols-1 gap-5"
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
