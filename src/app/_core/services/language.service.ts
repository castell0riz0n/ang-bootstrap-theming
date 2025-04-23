import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { ThemeDirectionService } from './theme-direction.service';

export interface Language {
  code: string;
  name: string;
  nativeName: string; // Name of language in its own script
  direction: 'ltr' | 'rtl';
  flagIcon?: string; // Optional flag icon code
  fontFamily?: string; // Optional specific font family override
}

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  // Define supported languages
  private supportedLanguages: Language[] = [
    { code: 'en', name: 'English', nativeName: 'English', direction: 'ltr', flagIcon: '🇺🇸' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', direction: 'rtl', flagIcon: '🇸🇦', fontFamily: 'Vazirmatn' },
    { code: 'fa', name: 'Persian', nativeName: 'فارسی', direction: 'rtl', flagIcon: '🇮🇷', fontFamily: 'Vazirmatn' },
    { code: 'he', name: 'Hebrew', nativeName: 'עברית', direction: 'rtl', flagIcon: '🇮🇱' },
    { code: 'fr', name: 'French', nativeName: 'Français', direction: 'ltr', flagIcon: '🇫🇷' },
    { code: 'es', name: 'Spanish', nativeName: 'Español', direction: 'ltr', flagIcon: '🇪🇸' },
    { code: 'de', name: 'German', nativeName: 'Deutsch', direction: 'ltr', flagIcon: '🇩🇪' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語', direction: 'ltr', flagIcon: '🇯🇵' }
  ];

  // Current language
  private currentLanguageSubject = new BehaviorSubject<Language>(this.getDefaultLanguage());
  currentLanguage$ = this.currentLanguageSubject.asObservable();

  // Flag to indicate language is changing
  private isLanguageChangingSubject = new BehaviorSubject<boolean>(false);
  isLanguageChanging$ = this.isLanguageChangingSubject.asObservable();

  constructor(
    private translateService: TranslateService,
    private themeDirectionService: ThemeDirectionService
  ) {}

  // Getter for supported languages
  get languages(): Language[] {
    return [...this.supportedLanguages]; // Return a copy to prevent unintended modifications
  }

  // Getter for current language
  get currentLanguage(): Language {
    return this.currentLanguageSubject.value;
  }

  initializeLanguage(): void {
    // Get saved language from local storage or use browser language
    const savedLang = localStorage.getItem('userLanguage');
    const language = savedLang
      ? this.supportedLanguages.find(lang => lang.code === savedLang)
      : this.getDefaultLanguage();

    if (language) {
      this.setLanguage(language);
    }

    // Set fallback language
    this.translateService.setDefaultLang('en');

    // Add available languages
    this.translateService.addLangs(this.supportedLanguages.map(lang => lang.code));
  }

  getDefaultLanguage(): Language {
    try {
      // Try to detect browser language
      if (typeof window !== 'undefined' && window.navigator) {
        const browserLang = window.navigator.language.split('-')[0];
        const found = this.supportedLanguages.find(lang => lang.code === browserLang);

        if (found) {
          return found;
        }
      }
    } catch (error) {
      console.error('Error detecting default language:', error);
    }

    // Default to first language (English) or create a fallback if supportedLanguages is empty
    return this.supportedLanguages[0] || {
      code: 'en',
      name: 'English',
      nativeName: 'English',
      direction: 'ltr'
    };
  }

  getLanguageByCode(code: string): Language | undefined {
    return this.supportedLanguages.find(lang => lang.code === code);
  }

  async setLanguage(language: Language): Promise<void> {
    if (language.code === this.currentLanguageSubject.value.code) {
      return; // Already set to this language
    }

    // Set transition flag
    this.isLanguageChangingSubject.next(true);

    // Add transition class for smooth switching
    document.body.classList.add('language-transition');

    try {
      // Short delay to allow for transition
      await new Promise(resolve => setTimeout(resolve, 50));

      // Update TranslateService
      this.translateService.use(language.code);

      // Update document direction using the ThemeDirectionService
      this.themeDirectionService.setDirection(language.direction);

      // Update language tag
      document.documentElement.lang = language.code;

      // Apply specific font-family if specified
      if (language.fontFamily) {
        document.documentElement.style.setProperty('--current-font-family', language.fontFamily);
      } else {
        // Reset to default direction-based font
        document.documentElement.style.removeProperty('--current-font-family');
      }

      // Add language-specific class
      document.body.className = document.body.className
        .split(' ')
        .filter(cls => !cls.startsWith('lang-'))
        .join(' ');
      document.body.classList.add(`lang-${language.code}`);

      // Save user preference
      localStorage.setItem('userLanguage', language.code);

      // Update current language
      this.currentLanguageSubject.next(language);

    } finally {
      // Complete the transition
      setTimeout(() => {
        document.body.classList.remove('language-transition');
        this.isLanguageChangingSubject.next(false);
      }, 300);
    }
  }
}
