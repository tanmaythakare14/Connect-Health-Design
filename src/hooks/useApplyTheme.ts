import { useEffect } from 'react';
import { useAppSelector } from '@/store/hooks';
import { selectTheme } from '@/store/slices/uiSlice';

/** Mirrors the persisted theme onto <html> so the `.dark` tokens apply app-wide. */
export function useApplyTheme(): void {
  const theme = useAppSelector(selectTheme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);
}
