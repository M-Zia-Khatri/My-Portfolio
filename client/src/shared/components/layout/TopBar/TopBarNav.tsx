import { Box, Flex } from '@radix-ui/themes';
import { TopBarItem } from './TopBarItem';
import { navItems } from './TopBar.constants';

export function TopBarNav({ activeHash, snapTo }: any) {
  return (
    <Box asChild className="flex-1 overflow-x-auto hidden md:block">
      <nav>
        <Flex asChild align="center" justify="center" gap="5">
          <ul className="min-w-max">
            {navItems.map((item) => (
              <TopBarItem
                key={item.label}
                item={item}
                isActive={activeHash === item.href}
                snapTo={snapTo}
              />
            ))}
          </ul>
        </Flex>
      </nav>
    </Box>
  );
}