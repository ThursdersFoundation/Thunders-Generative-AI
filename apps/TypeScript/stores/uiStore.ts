import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';

interface ModalState {
  [key: string]: boolean;
}

interface UIState {
  sidebarCollapsed: boolean;
  sidebarMobileOpen: boolean;
  theme: Theme;
  activeModal: ModalState;
  searchQuery: string;
  isSearchOpen: boolean;
  notifications: number;

  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setSidebarMobileOpen: (open: boolean) => void;
  setTheme: (theme: Theme) => void;
  openModal: (modalId: string) => void;
  closeModal: (modalId: string) => void;
  isModalOpen: (modalId: string) => boolean;
  setSearchQuery: (query: string) => void;
  toggleSearch: () => void;
  setNotifications: (count: number) => void;
  resetUI: () => void;
}

const initialState = {
  sidebarCollapsed: false,
  sidebarMobileOpen: false,
  theme: 'system' as Theme,
  activeModal: {} as ModalState,
  searchQuery: '',
  isSearchOpen: false,
  notifications: 0,
};

export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

        setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

        setSidebarMobileOpen: (open) => set({ sidebarMobileOpen: open }),

        setTheme: (theme) => {
          set({ theme });
          if (typeof window !== 'undefined') {
            const root = document.documentElement;
            if (theme === 'system') {
              const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
              root.classList.toggle('dark', systemDark);
            } else {
              root.classList.toggle('dark', theme === 'dark');
            }
          }
        },

        openModal: (modalId) =>
          set((state) => ({
            activeModal: { ...state.activeModal, [modalId]: true },
          })),

        closeModal: (modalId) =>
          set((state) => ({
            activeModal: { ...state.activeModal, [modalId]: false },
          })),

        isModalOpen: (modalId) => !!get().activeModal[modalId],

        setSearchQuery: (query) => set({ searchQuery: query }),

        toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen })),

        setNotifications: (count) => set({ notifications: count }),

        resetUI: () => set(initialState),
      }),
      {
        name: 'ui-storage',
        partialize: (state) => ({
          sidebarCollapsed: state.sidebarCollapsed,
          theme: state.theme,
        }),
      },
    ),
    { name: 'UIStore' },
  ),
);
