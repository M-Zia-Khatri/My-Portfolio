import { create } from 'zustand';
import { AppNavigation } from '@/constants/navigation.constants';

type NavigationStore = {
  activeHash: string;
  setActiveHash: (hash: string) => void;
};

export const useNavigationStore = create<NavigationStore>((set) => ({
  activeHash: window.location.hash || AppNavigation.HOME,
  setActiveHash: (hash) => set({ activeHash: hash }),
}));