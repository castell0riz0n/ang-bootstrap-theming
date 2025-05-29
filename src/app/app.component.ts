import {Component, isDevMode, OnInit} from '@angular/core';
import { LanguageService } from './_core/services/language.service';
import { ThemeDirectionService } from './_core/services/theme-direction.service';
import {EnhancedStickyLayoutService} from './_core/services/enhanced-sticky-layout.service';

@Component({
  selector: 'app-root',
  standalone: false,
  template: `
    <!-- Complete application with sticky system -->
    <app-layout
      [showBreadcrumb]="true"
      [showBreadcrumbActions]="true"
      [showBreadcrumbHistory]="true"
      [showModifySearch]="false"
      [showStickyConfig]="!isProduction">
    </app-layout>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
    }
  `]
})
export class AppComponent implements OnInit {
  isProduction = !isDevMode()

  constructor(
    private languageService: LanguageService,
    private themeDirectionService: ThemeDirectionService,
    private stickyLayoutService: EnhancedStickyLayoutService
  ) {}

  ngOnInit(): void {
    this.initializeServices();
    this.setupStickyDefaults();
    this.setupDirectionHandling();
  }

  private initializeServices(): void {
    // Initialize language service
    this.languageService.initializeLanguage();

    // Initialize theme
    const savedTheme = localStorage.getItem('theme-preference');
    if (savedTheme && this.isValidTheme(savedTheme)) {
      this.themeDirectionService.setTheme(savedTheme as any);
    } else {
      this.themeDirectionService.setTheme('indigo-light');
    }
  }

  private setupStickyDefaults(): void {
    // Configure default sticky behavior
    this.stickyLayoutService.updateConfig({
      header: {
        id: 'header',
        enabled: true,
        order: 1,
        className: 'sticky-header',
        zIndex: 1030
      },
      breadcrumb: {
        id: 'breadcrumb',
        enabled: true,
        order: 2,
        className: 'sticky-breadcrumb',
        zIndex: 1025
      },
      modifySearch: {
        id: 'modifySearch',
        enabled: false, // Will be enabled on search pages
        order: 3,
        className: 'sticky-modify-search',
        zIndex: 1020
      }
    });

    // Enable auto-hide on mobile devices
    if (this.isMobileDevice()) {
      this.stickyLayoutService.enableAutoHide?.('header', 100);
    }
  }

  private setupDirectionHandling(): void {
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

  private isValidTheme(theme: string): boolean {
    const validThemes = [
      'light', 'dark',
      'green-orange-light', 'green-orange-dark',
      'indigo-light', 'indigo-dark'
    ];
    return validThemes.includes(theme);
  }

  private isMobileDevice(): boolean {
    return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }
}
