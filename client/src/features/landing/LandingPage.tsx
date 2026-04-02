import { Box, Button, Flex, Heading, Spinner, Text } from '@radix-ui/themes';
import { memo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useHasVisited } from './hooks/useHasVisited';

function LandingPage() {
  const navigate = useNavigate();
  const { hasVisited, hydrated, markVisited } = useHasVisited();

  useEffect(() => {
    if (!hydrated || !hasVisited) return;

    navigate('/home', { replace: true });
  }, [hasVisited, hydrated, navigate]);

  const handleEnter = useCallback(() => {
    markVisited();
    navigate('/home');
  }, [markVisited, navigate]);

  if (!hydrated) {
    return (
      <Flex align="center" justify="center" className="min-h-[60vh]">
        <Spinner size="2" />
      </Flex>
    );
  }

  return (
    <Flex align="center" justify="center" className="min-h-[calc(100dvh-9rem)] px-6">
      <Box
        className="max-w-2xl space-y-5 text-center opacity-0 [animation:fadeUp_.55s_ease-out_forwards]"
        style={{ willChange: 'transform, opacity' }}
      >
        <Text size="2" color="blue" className="tracking-[0.18em] uppercase">
          Welcome
        </Text>
        <Heading as="h1" size="9" className="font-bold text-(--blue-12)">
          M. Zia Khatri
        </Heading>
        <Text size="5" className="text-(--blue-11)">
          Frontend Engineer crafting fast, polished web experiences.
        </Text>
        <Text size="3" className="mx-auto max-w-xl text-(--gray-11)">
          Performance-first React applications, clean UI systems, and interaction design focused on clarity.
        </Text>
        <Button size="3" onClick={handleEnter} className="mt-3">
          Enter Site
        </Button>
      </Box>
    </Flex>
  );
}

export default memo(LandingPage);
