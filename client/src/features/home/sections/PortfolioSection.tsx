import { fetchPortfolio } from '@/features/dashboard/pages/portfolio/portfolio.api';
import type { PortfolioItem as DashboardPortfolioItem } from '@/features/dashboard/pages/portfolio/portfolio.types';
import { PortfolioItemCard } from '@/features/portfolio/components/PortfolioItemCard';
import type { PortfolioItem } from '@/features/portfolio/types';
import SecComponent from '@/shared/components/SecContainer';
import { TEXT } from '@/shared/constants/style.constants';
import { cn } from '@/shared/utils/cn';
import { Box, Card, Flex, Heading, Skeleton, Text } from '@radix-ui/themes';
import { useQuery } from '@tanstack/react-query';
import { motion, type Variants } from 'motion/react';
import { memo } from 'react';

// ─── Module-level constants ───────────────────────────────────────────────────
// None of these change between renders, so there is no benefit in placing them
// inside the component where they would be recreated on every call.

const PORTFOLIO_QUERY_KEY = ['portfolio'] as const;

/** Viewport options — plain objects created once, used as stable references. */
const VIEWPORT_ONCE: Parameters<typeof motion.div>[0]['viewport'] = {
  once: true,
  margin: '-60px',
};
const VIEWPORT_GRID: Parameters<typeof motion.div>[0]['viewport'] = {
  once: true,
  margin: '-80px',
};

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
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
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

/**
 * Stable mapper: defined at module scope so its reference never changes.
 * React Query compares the `select` reference to decide whether to re-run
 * the transformation — a stable reference = zero wasted mapping passes.
 */
function selectPortfolioItems(items: DashboardPortfolioItem[]): PortfolioItem[] {
  return items.map((item) => ({
    siteName: item.site_name,
    siteRole: item.site_role,
    siteUrl: item.site_url,
    siteImageUrl: item.site_image_url,
    useTech: item.use_tech,
    description: item.description,
  }));
}

/** Pre-built skeleton array — created once, not on every render. */
const SKELETON_INDICES = [0, 1, 2, 3] as const;

// ─── Memoised skeleton card ───────────────────────────────────────────────────
// Pure UI, no props — memo prevents reconciliation on parent re-renders.
const CardSkeleton = memo(function CardSkeleton() {
  return (
    <Card size="2">
      <Flex direction="column" gap="3">
        <Skeleton className="h-48 w-full rounded-md" />
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-full" />
      </Flex>
    </Card>
  );
});

// ─── Component ────────────────────────────────────────────────────────────────
export default function PortfolioSection() {
  const {
    data: portfolioItems = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: PORTFOLIO_QUERY_KEY,
    queryFn: fetchPortfolio,
    /**
     * Stable module-level function — React Query won't re-run the mapping
     * unless `data` itself changes (identity comparison).
     */
    select: selectPortfolioItems,
    staleTime: 1_000 * 60 * 5,
  });

  return (
    <SecComponent className="w-full" py="8">
      <Box className="flex flex-col items-center gap-8 md:gap-10 lg:gap-12 xl:gap-14">
        {/* Heading */}
        <motion.div
          className="text-center"
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

        {/* Grid */}
        <motion.div
          className={cn('grid w-full', 'grid-cols-1 md:grid-cols-2', 'gap-5 md:gap-3 lg:gap-4')}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_GRID}
        >
          {isLoading ? (
            // Stable array, memoised component — no reconciliation churn
            SKELETON_INDICES.map((i) => <CardSkeleton key={i} />)
          ) : isError ? (
            <Card size="3" className="md:col-span-2">
              <Text size={TEXT.base.size} color="red">
                Couldn&apos;t load portfolio items right now. Please try again later.
              </Text>
            </Card>
          ) : portfolioItems.length === 0 ? (
            <Card size="3" className="md:col-span-2">
              <Text size={TEXT.base.size} color="gray">
                Portfolio items coming soon.
              </Text>
            </Card>
          ) : (
            portfolioItems.map((item) => (
              <motion.div key={item.siteUrl} variants={cardVariants}>
                <PortfolioItemCard item={item} />
              </motion.div>
            ))
          )}
        </motion.div>
      </Box>
    </SecComponent>
  );
}
