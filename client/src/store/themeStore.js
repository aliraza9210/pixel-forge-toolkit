import { create } from 'zustand';

function getInitialTheme() {
  if (typeof window === 'undefined') return 'dark';
  const saved = localStorage.getItem('pixelforge-theme');
  if (saved === 'light' || saved === 'dark') {
    return saved;
  }
  // Default to Dark Mode for first-time visitors as per specifications
  return 'dark';
}

function applyThemeToDOM(theme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (theme === 'light') {
    root.classList.remove('dark');
    root.classList.add('light');
    root.setAttribute('data-theme', 'light');
    root.style.colorScheme = 'light';
  } else {
    root.classList.remove('light');
    root.classList.add('dark');
    root.setAttribute('data-theme', 'dark');
    root.style.colorScheme = 'dark';
  }
}

// Apply on initial script load immediately to prevent flash
if (typeof window !== 'undefined') {
  applyThemeToDOM(getInitialTheme());
}

export const useThemeStore = create((set, get) => ({
  theme: getInitialTheme(),

  toggleTheme: () => {
    const current = get().theme;
    const next = current === 'dark' ? 'light' : 'dark';
    if (typeof window !== 'undefined') {
      localStorage.setItem('pixelforge-theme', next);
    }
    applyThemeToDOM(next);
    set({ theme: next });
  },

  setTheme: (theme) => {
    if (theme !== 'light' && theme !== 'dark') return;
    if (typeof window !== 'undefined') {
      localStorage.setItem('pixelforge-theme', theme);
    }
    applyThemeToDOM(theme);
    set({ theme });
  },
}));

export default useThemeStore;
