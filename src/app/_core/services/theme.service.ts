import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ThemeMode = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private renderer: Renderer2;
  private themeSubject = new BehaviorSubject<ThemeMode>(this.getCurrentTheme());
  public theme$ = this.themeSubject.asObservable();

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
    this.initTheme();
  }

  private getCurrentTheme(): ThemeMode {
    const savedTheme = localStorage.getItem('theme-preference');
    
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      return savedTheme;
    }
    
    // Check user's system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    return 'light'; // Default theme
  }

  private initTheme(): void {
    const theme = this.getCurrentTheme();
    this.setTheme(theme);
    
    // Listen for system preference changes
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (localStorage.getItem('theme-preference')) {
          return; // User has explicitly set a preference, don't auto-switch
        }
        
        const newTheme = e.matches ? 'dark' : 'light';
        this.setTheme(newTheme);
      });
    }
  }

  public setTheme(theme: ThemeMode): void {
    this.themeSubject.next(theme);
    localStorage.setItem('theme-preference', theme);
    
    if (theme === 'dark') {
      this.renderer.addClass(document.body, 'dark-mode');
      this.renderer.removeClass(document.body, 'light-mode');
    } else {
      this.renderer.addClass(document.body, 'light-mode');
      this.renderer.removeClass(document.body, 'dark-mode');
    }
    
    // Update meta theme-color for browser chrome
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#212121' : '#ffffff');
    }
  }

  public toggleTheme(): void {
    const currentTheme = this.themeSubject.value;
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }
}