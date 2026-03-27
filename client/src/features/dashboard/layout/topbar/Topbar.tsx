import { AppNavigation } from '@/shared/constants/navigation.constants';
import { cn } from '@/shared/utils/cn';
import { HamburgerMenuIcon } from '@radix-ui/react-icons';
import { Box, Button, DropdownMenu, Flex, Link, Separator, Text } from '@radix-ui/themes';
import { Monitor, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { NavLink } from 'react-router';

export type NavItem = {
  label: string;
  link: string;
};

const DEFAULT_NAV: NavItem[] = [
  { label: 'Dashboard', link: AppNavigation.DASHBOARD },
  { label: 'Skills', link: '/dashboard/skills' },
  { label: 'Portfolio', link: '/dashboard/portfolio' },
  { label: 'Contact', link: '/dashboard/contact' },
];

export default function Topbar() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = time.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  return (
    <header className="sticky top-0 z-40 w-full border-b border-(--gray-5) bg-(--gray-2)/80 backdrop-blur-md">
      <Flex align="center" justify="between" px="6" height="64px">
        {/* Left Side: Brand */}
        <Flex align="center" gap="3">
          <Box className="rounded-lg bg-(--blue-9) p-1.5 text-white shadow-[0_0_15px_rgba(112,193,229,0.3)]">
            <Monitor size={18} />
          </Box>
          <Text size="3" weight="bold" className="tracking-tight text-white select-none">
            Admin Portal
          </Text>
        </Flex>

        {/* Right Side: Nav + Time */}
        <Flex align="center" gap="5">
          <nav className="hidden md:block">
            <Flex gap="5" align="center">
              {DEFAULT_NAV.map((item) => (
                <NavLink
                  key={item.link}
                  to={item.link}
                  end
                  className={({ isActive }) =>
                    cn(
                      'text-sm font-medium transition-colors hover:text-(--blue-11)',
                      isActive ? 'text-(--blue-11)' : 'text-(--gray-10)',
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </Flex>
          </nav>

          <Separator orientation="vertical" size="2" className="hidden md:block" />

          <Flex
            align="center"
            gap="2"
            px="3"
            py="1"
            className="rounded-full border border-(--gray-5) bg-(--gray-3)/50 font-mono text-[13px] text-(--blue-11)"
          >
            <Clock size={14} className="opacity-70" />
            <span className="tabular-nums">{formattedTime}</span>
          </Flex>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <DropdownMenu.Root>
              <DropdownMenu.Trigger>
                <Button variant="soft" color="gray" size="2">
                  <HamburgerMenuIcon />
                </Button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content variant="soft" color="blue">
                {DEFAULT_NAV.map((item) => (
                  <DropdownMenu.Item key={item.link} asChild>
                    <NavLink to={item.link}>{item.label}</NavLink>
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          </div>
        </Flex>
      </Flex>
    </header>
  );
}