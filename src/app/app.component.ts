import { Component, OnInit } from '@angular/core';
import { LanguageService } from './_core/services/language.service';
import { ThemeDirectionService } from './_core/services/theme-direction.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: false,
  template: `
    <div class="app-container">
      <app-header></app-header>
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
      <app-footer></app-footer>
    </div>
  `,
  styles: [`
    .app-container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    .main-content {
      flex: 1;
      padding: 20px;
    }
  `]
})
export class AppComponent implements OnInit {
  constructor(
    private languageService: LanguageService,
    private themeDirectionService: ThemeDirectionService
  ) {}

  ngOnInit(): void {
    // Initialize the application language
    this.languageService.initializeLanguage();

    // Set theme based on user preference or system preference
    const savedTheme = localStorage.getItem('theme-preference');
    if (savedTheme && ['light', 'dark', 'green-orange-light', 'green-orange-dark'].includes(savedTheme)) {
      this.themeDirectionService.setTheme(savedTheme as any);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      // Use dark theme if system prefers it
      this.themeDirectionService.setTheme('dark');
    }

    // Listen for system theme changes if no explicit user preference
    if (!savedTheme && window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        const newTheme = e.matches ? 'dark' : 'light';
        this.themeDirectionService.setTheme(newTheme);
      });
    }

    // Subscribe to direction changes to update body class
    this.themeDirectionService.direction$.subscribe(direction => {
      if (direction === 'ltr') {
        document.body.classList.add('ltr');
        document.body.classList.remove('rtl');
      } else {
        document.body.classList.add('rtl');
        document.body.classList.remove('ltr');
      }
    });
  }
}
