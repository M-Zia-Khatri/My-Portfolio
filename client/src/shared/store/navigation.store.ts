import { create } from 'zustand';
import { AppNavigation } from '@/shared/constants/navigation.constants';

type NavigationStore = {
  activeHash: string;
  setActiveHash: (hash: string) => void;
};

export const useNavigationStore = create<NavigationStore>((set) => ({
  activeHash: AppNavigation.HOME,
  setActiveHash: (hash) => set({ activeHash: hash }),
}));
