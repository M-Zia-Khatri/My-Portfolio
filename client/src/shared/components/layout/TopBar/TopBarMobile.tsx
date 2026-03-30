import { Button, Dialog, Flex } from '@radix-ui/themes';
import { Menu } from 'lucide-react';
import { navItems } from './TopBar.constants';
import { TopBarItem } from './TopBarItem';

export function TopBarMobile({ activeHash, snapTo }: any) {
  return (
    <div className="md:hidden">
      <Dialog.Root>
        <Dialog.Trigger>
          <Button color="gray" className="px-2 py-2">
            <Menu />
          </Button>
        </Dialog.Trigger>

        <Dialog.Content className="fixed top-0 left-0 m-0 w-full max-w-none h-[60vh] rounded-t-none rounded-b-xl backdrop-blur-md bg-(--gray-2)/50">
          <nav>
            <Flex asChild align="center" justify="center" direction="column" gap="5">
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
        </Dialog.Content>
      </Dialog.Root>
    </div>
  );
}
