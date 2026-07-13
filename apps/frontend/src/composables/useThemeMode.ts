import { computed, ref } from 'vue';

type ThemeMode = 'dark' | 'light';

const STORAGE_KEY = 'utvm-theme-mode';
const mode = ref<ThemeMode>('dark');
let initialized = false;

const applyThemeToDocument = (nextMode: ThemeMode) => {
  if (typeof document === 'undefined') return;

  document.body.classList.toggle('theme-light', nextMode === 'light');
  document.body.classList.toggle('theme-dark', nextMode === 'dark');
};

const safeStoredMode = (): ThemeMode | null => {
  if (typeof window === 'undefined') return null;

  const value = window.localStorage.getItem(STORAGE_KEY);
  return value === 'light' || value === 'dark' ? value : null;
};

export function useThemeMode() {
  const initTheme = () => {
    if (initialized) return;

    const stored = safeStoredMode();
    mode.value = stored ?? 'dark';
    applyThemeToDocument(mode.value);
    initialized = true;
  };

  const setTheme = (nextMode: ThemeMode) => {
    mode.value = nextMode;
    applyThemeToDocument(nextMode);

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, nextMode);
    }
  };

  const toggleTheme = () => {
    setTheme(mode.value === 'dark' ? 'light' : 'dark');
  };

  return {
    mode,
    isLight: computed(() => mode.value === 'light'),
    initTheme,
    setTheme,
    toggleTheme,
  };
}
