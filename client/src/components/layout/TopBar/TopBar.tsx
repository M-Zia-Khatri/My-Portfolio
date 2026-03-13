import { NavLink } from 'react-router';                          // ← remove useLocation
import { useNavigationStore } from '@/lib/store/navigation.store'; // ← add
import { AppNavigation } from '@/constants/navigation.constants';
import { motion } from 'framer-motion';
import { Box, Button, Card, Container, Flex, Link, Text } from '@radix-ui/themes';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Home', href: AppNavigation.HOME },
  { label: 'Skills', href: AppNavigation.SKILLS },
  { label: 'About', href: AppNavigation.ABOUT },
  { label: 'Portfolio', href: AppNavigation.PORTFOLIO },
  { label: 'Experience', href: AppNavigation.EXPERIENCE },
  { label: 'Contact', href: AppNavigation.CONTACT },
] as const;

export default function TopBar() {
  const {activeHash , setActiveHash} = useNavigationStore(); // ← single source of truth
  console.log(activeHash)

  const itemVariants = {
    initial: { y: 0, opacity: 0.9, fontWeight: 400 },
    hover: {
      y: -5, opacity: 1, fontWeight: 500, scale: 1.02,
      transition: { duration: 0.25, ease: 'easeOut' },
    },
  };

  const underlineVariants = {
    initial: { scaleX: 0, opacity: 0 },
    active: { scaleX: 1, opacity: 1, transition: { duration: 0.3, ease: 'easeIn' } },
    hover:  { scaleX: 1, opacity: 1, transition: { delay: 0.1, duration: 0.3, ease: 'easeIn' } },
  };

  return (
    <Box asChild className='fixed top-4 z-50 w-full px-4'>
      <header>
        <Container size={{ initial: '3' }}>
          <Card
            asChild size='2' variant='surface'
            className={cn(
              'mx-auto flex w-full items-center rounded-full outline-2 -outline-offset-2 backdrop-blur-lg',
              'h-15', 'gap-4', 'px-8',
              activeHash === AppNavigation.HOME
                ? 'bg-none'
                : 'shadow-[0_2px_15px_color-mix(in_srgb,var(--blue-3),transparent_10%)]',
            )}
            style={{ outlineColor: 'var(--gray-6)' }}
          >
            <motion.div
              className='flex w-full items-center justify-between gap-4'
              initial={{ y: -80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.65, ease: 'easeOut' }}
            >
              {/* brand logo */}
              <Link asChild underline='none' className='shrink-0'>
                <NavLink to={AppNavigation.HOME} className='flex items-center gap-2'>
                  <img src='/vite.svg' alt='Brand logo' className='h-8 w-8' />
                  <Text size='3' weight='bold' className='text-white'>My Portfolio</Text>
                </NavLink>
              </Link>

              {/* nav links */}
              <Box asChild className='flex-1 overflow-x-auto'>
                <nav aria-label='Main navigation'>
                  <Flex asChild align='center' justify='center' gap='5'>
                    <ul className='min-w-max'>
                      {navItems.map((item) => {
                        const isRoute = !item.href.startsWith('#');
                        const isActive = activeHash === item.href;

                        return (
                          <motion.li
                            key={item.label}
                            initial='initial'
                            whileHover='hover'
                            className='relative list-none'
                            variants={itemVariants}
                            onClick={()=>{setActiveHash(item.href)}}
                          >
                            <Link asChild underline='none'>
                              {isRoute ? (
                                <NavLink to={item.href} className='relative inline-flex items-center pb-1'>
                                  <Text size='2' className='text-white'>{item.label}</Text>
                                  <motion.span
                                    variants={underlineVariants}
                                    animate={isActive ? 'active' : 'initial'}
                                    className='absolute right-0 -bottom-0.5 left-0 h-0.5 origin-left rounded-full'
                                    style={{ backgroundColor: 'var(--blue-9)' }}
                                  />
                                </NavLink>
                              ) : (
                                <a href={item.href} className='relative inline-flex items-center pb-1'>
                                  <Text size='2' className='text-white'>{item.label}</Text>
                                  <motion.span
                                    variants={underlineVariants}
                                    animate={isActive ? 'active' : 'initial'}
                                    className='absolute right-0 -bottom-0.5 left-0 h-0.5 origin-left rounded-full'
                                    style={{ backgroundColor: 'var(--blue-9)' }}
                                  />
                                </a>
                              )}
                            </Link>
                          </motion.li>
                        );
                      })}
                    </ul>
                  </Flex>
                </nav>
              </Box>

              {/* let's talk btn */}
              <Button asChild radius='full' size='2' color='gray' className='shrink-0'>
                <motion.a href='mailto:hello@example.com' className='relative overflow-hidden'>
                  <motion.span
                    initial={{ skewX: '-18deg' }}
                    animate={{ x: [-24, 140, -24] }}
                    transition={{ delay: 1.5, repeatDelay: 2.5, duration: 1, repeat: Infinity, repeatType: 'reverse' }}
                    className='pointer-events-none absolute top-0 left-0 h-full w-4 bg-(--blue-10) blur-sm'
                  />
                  <Text weight='bold'>Let's Talk</Text>
                </motion.a>
              </Button>
            </motion.div>
          </Card>
        </Container>
      </header>
    </Box>
  );
}