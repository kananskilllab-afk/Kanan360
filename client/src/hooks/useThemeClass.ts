import { useEffect } from 'react';
import { useUiStore } from '@/store/uiStore';

// Applies the .dark class shadcn's tokens key off — kept in one hook so
// theme switching never has to be wired up more than once.
export function useThemeClass() {
  const theme = useUiStore((s) => s.theme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);
}
