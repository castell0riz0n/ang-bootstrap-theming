import { Injectable, Inject, Renderer2, RendererFactory2 } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

export type Direction = 'ltr' | 'rtl';

// In theme-direction.service.ts
export type Theme = 'light' | 'dark' | 'green-orange-light' | 'green-orange-dark' | 'indigo-light' | 'indigo-dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeDirectionService {
  private renderer: Renderer2;
  private currentDirectionSubject = new BehaviorSubject<Direction>('ltr');
  private currentThemeSubject = new BehaviorSubject<Theme>('light');

  // Observable streams
  public direction$ = this.currentDirectionSubject.asObservable();
  public theme$ = this.currentThemeSubject.asObservable();

  // Bootstrap CSS File paths
  private ltrCssPath = 'assets/css/bootstrap.min.css';
  private rtlCssPath = 'assets/css/bootstrap.rtl.min.css';

  // Theme CSS paths
  private themePaths = {
    'light': 'assets/css/theme-light.css',
    'dark': 'assets/css/theme-dark.css',
    'green-orange-light': 'assets/css/theme-green-orange-light.css',
    'green-orange-dark': 'assets/css/theme-green-orange-dark.css',
    'indigo-light': 'assets/css/theme-indigo-light.css',
    'indigo-dark': 'assets/css/theme-indigo-dark.css'
  };

  // References to stylesheets
  private bootstrapStylesheet: HTMLLinkElement | null = null;
  private themeStylesheet: HTMLLinkElement | null = null;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    rendererFactory: RendererFactory2
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
    this.initializeStylesheets();
  }

  private initializeStylesheets(): void {
    // Add Bootstrap stylesheet
    this.bootstrapStylesheet = this.document.createElement('link');
    this.bootstrapStylesheet.rel = 'stylesheet';
    this.bootstrapStylesheet.href = this.ltrCssPath;
    this.renderer.appendChild(this.document.head, this.bootstrapStylesheet);

    // Add Theme stylesheet
    this.themeStylesheet = this.document.createElement('link');
    this.themeStylesheet.rel = 'stylesheet';
    this.themeStylesheet.href = this.themePaths.light;
    this.renderer.appendChild(this.document.head, this.themeStylesheet);
  }

  /**
   * Set the document direction (LTR or RTL)
   */
  public setDirection(direction: Direction): void {
    if (direction === this.currentDirectionSubject.value) {
      return; // No change needed
    }

    // Update document direction
    document.documentElement.dir = direction;
    document.documentElement.setAttribute('dir', direction);

    // Update body classes
    if (direction === 'rtl') {
      document.body.classList.add('rtl');
      document.body.classList.remove('ltr');
    } else {
      document.body.classList.add('ltr');
      document.body.classList.remove('rtl');
    }

    // Update Bootstrap stylesheet
    if (this.bootstrapStylesheet) {
      this.bootstrapStylesheet.href = direction === 'rtl' ? this.rtlCssPath : this.ltrCssPath;
    }

    // Update subject
    this.currentDirectionSubject.next(direction);
  }

  /**
   * Set the theme
   */
  public setTheme(theme: Theme): void {
    if (theme === this.currentThemeSubject.value) {
      return; // No change needed
    }

    // Update body classes
    this.removeAllThemeClasses();
    this.renderer.addClass(this.document.body, `theme-${theme}`);

    // For backward compatibility
    if (theme.includes('dark')) {
      this.renderer.addClass(this.document.body, 'dark-mode');
      this.renderer.removeClass(this.document.body, 'light-mode');
    } else {
      this.renderer.addClass(this.document.body, 'light-mode');
      this.renderer.removeClass(this.document.body, 'dark-mode');
    }

    // Update theme stylesheet
    if (this.themeStylesheet && this.themePaths[theme]) {
      this.themeStylesheet.href = this.themePaths[theme];
    }

    // Update subject
    this.currentThemeSubject.next(theme);
  }

  /**
   * Remove all theme classes from body
   */
  private removeAllThemeClasses(): void {
    this.renderer.removeClass(this.document.body, 'theme-light');
    this.renderer.removeClass(this.document.body, 'theme-dark');
    this.renderer.removeClass(this.document.body, 'theme-green-orange-light');
    this.renderer.removeClass(this.document.body, 'theme-green-orange-dark');
  }

  /**
   * Get current direction
   */
  public get direction(): Direction {
    return this.currentDirectionSubject.value;
  }

  /**
   * Get current theme
   */
  public get theme(): Theme {
    return this.currentThemeSubject.value;
  }

  /**
   * Return available themes
   */
  public get availableThemes(): Theme[] {
    return Object.keys(this.themePaths) as Theme[];
  }

  /**
   * Toggle between light and dark versions of the current theme family
   */
  public toggleDarkMode(): void {
    const currentTheme = this.theme;
    let newTheme: Theme;

    if (currentTheme.includes('green-orange')) {
      // Toggle between green-orange light and dark
      newTheme = currentTheme === 'green-orange-light' ? 'green-orange-dark' : 'green-orange-light';
    } else {
      // Toggle between default light and dark
      newTheme = currentTheme === 'light' ? 'dark' : 'light';
    }

    this.setTheme(newTheme);
  }
}
