import { sections } from '@/features/home/Home.config';
import { TEXT } from '@/shared/constants/style.constants';
import { useNavigationStore } from '@/shared/store/navigation.store';
import { Link, Text } from '@radix-ui/themes';
import { motion, type Variants } from 'motion/react';
import { NavLink } from 'react-router';

interface Props {
  item: { label: string; href: string };
  isActive: boolean;
  snapTo: (index: number) => void;
}

const itemVariants: Variants = {
  initial: { y: 0, opacity: 0.9, fontWeight: 400 },
  hover: {
    y: -5,
    opacity: 1,
    fontWeight: 500,
    scale: 1.02,
    margin: '0 1%',
    transition: { duration: 0.25, ease: 'easeOut' },
  },
};

const underlineVariants: Variants = {
  initial: { scaleX: 0, opacity: 0 },
  active: {
    scaleX: 1,
    opacity: 1,
    transition: { duration: 0.3, ease: 'easeIn' },
  },
  hover: {
    scaleX: 1,
    opacity: 1,
    transition: { duration: 0.3, ease: 'easeIn' },
  },
};

export function TopBarItem({ item, isActive, snapTo }: Props) {
  const isRoute = !item.href.startsWith('#');

  const { setActiveHash } = useNavigationStore();

  const handleClick = (e?: React.MouseEvent) => {
    // ✅ always set active immediately
    setActiveHash(item.href);

    if (item.href.startsWith('#')) {
      e?.preventDefault();

      const index = sections.findIndex((s) => `#${s.id}` === item.href);

      console.log('CLICKED:', item.href);
      console.log('INDEX:', index);

      if (index !== -1) {
        setActiveHash(item.href);
        snapTo(index);
      }
    }
  };

  return (
    <motion.li
      initial="initial"
      whileHover="hover"
      className="relative list-none"
      variants={itemVariants}
      onClick={handleClick}
    >
      <Link asChild underline="none">
        {isRoute ? (
          <NavLink to={item.href} className="relative inline-flex items-center pb-1">
            <Text size={TEXT.base.size} className="text-white">
              {item.label}
            </Text>
            <motion.span
              variants={underlineVariants}
              initial="initial"
              animate={isActive ? 'active' : 'initial'}
              className="absolute right-0 -bottom-0.5 left-0 h-0.5 w-8 origin-left rounded-full"
              style={{ backgroundColor: 'var(--blue-9)' }}
            />
          </NavLink>
        ) : (
          <a
            href={item.href}
            onClick={handleClick}
            className="relative inline-flex items-center pb-1"
          >
            <Text size={TEXT.base.size} className="text-white">
              {item.label}
            </Text>
            <motion.span
              variants={underlineVariants}
              initial="initial"
              animate={isActive ? 'active' : 'initial'}
              className="absolute right-0 -bottom-0.5 left-0 h-0.5 origin-left rounded-full"
              style={{ backgroundColor: 'var(--blue-9)' }}
            />
          </a>
        )}
      </Link>
    </motion.li>
  );
}
