import { Injectable, effect, signal } from '@angular/core';

export type Theme = 'dark' | 'light';

/** Mesma chave lida pelo script inline do `index.html`, que aplica o tema antes do Angular iniciar. */
const THEME_STORAGE_KEY = 'cashflow.theme';

function initialTheme(): Theme {
  return localStorage.getItem(THEME_STORAGE_KEY) === 'light' ? 'light' : 'dark';
}

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly theme = signal<Theme>(initialTheme());

  constructor() {
    effect(() => {
      const theme = this.theme();
      document.documentElement.dataset['theme'] = theme;
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#000000' : '#f4f4f5');
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    });
  }

  toggle() {
    this.theme.update((t) => (t === 'dark' ? 'light' : 'dark'));
  }
}
