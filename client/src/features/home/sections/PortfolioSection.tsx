import { fetchPortfolio } from '@/features/dashboard/pages/portfolio/portfolio.api';
import { PortfolioItemCard } from '@/features/portfolio/components/PortfolioItemCard';
import SecComponent from '@/shared/components/SecContainer';
import { TEXT } from '@/shared/constants/style.constants';
import { Box, Heading, Text } from '@radix-ui/themes';
import { useQuery } from '@tanstack/react-query';
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

export default function PortfolioSection() {
  const { data: items = [], isLoading } = useQuery({
    queryKey: ['portfolio'],
    queryFn: fetchPortfolio,
  });

  console.log(items);

  if (isLoading) return null;

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
          {items.map((item, idx) => (
            <motion.div key={idx} variants={cardVariants}>
              <PortfolioItemCard item={item} />
            </motion.div>
          ))}
        </motion.div>
      </Box>
    </SecComponent>
  );
}
