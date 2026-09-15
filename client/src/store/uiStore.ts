import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ThemeMode = 'light' | 'dark';

interface UiState {
  theme: ThemeMode;
  sidebarCollapsed: boolean;
  toggleTheme: () => void;
  toggleSidebar: () => void;
}

// Pure UI preference — nothing here is ever fetched from the server, so
// (unlike authStore) persisting it to localStorage is safe and expected.
export const useUiStore = create<UiState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      sidebarCollapsed: false,
      toggleTheme: () => set({ theme: get().theme === 'light' ? 'dark' : 'light' }),
      toggleSidebar: () => set({ sidebarCollapsed: !get().sidebarCollapsed }),
    }),
    { name: 'kb-ui-prefs' },
  ),
);
