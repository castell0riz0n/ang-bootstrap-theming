import { Component, OnInit } from '@angular/core';
import { ThemeDirectionService, Theme } from '../../../_core/services/theme-direction.service';

interface ThemeOption {
  id: Theme;
  name: string;
  description: string;
  icon?: string;
  previewClass: string;
}

@Component({
  selector: 'app-theme-selector',
  standalone: false,
  template: `
    <div class="theme-selector">
      <div class="dropdown">
        <button class="btn btn-sm btn-dropdown dropdown-toggle" type="button" id="themeDropdown"
                data-bs-toggle="dropdown" aria-expanded="false">
          <i class="bi bi-palette me-1"></i>
          {{ 'THEME.THEMES' | translate }}
        </button>
        <div class="dropdown-menu theme-dropdown" aria-labelledby="themeDropdown">
          <h6 class="dropdown-header">{{ 'THEME.SELECT_THEME' | translate }}</h6>

          <div class="theme-options">
            <div *ngFor="let themeOption of themeOptions"
                 class="theme-option"
                 [class.active]="isThemeActive(themeOption.id)"
                 (click)="selectTheme(themeOption.id)">
              <div class="theme-preview" [class]="themeOption.previewClass">
                <div class="preview-header"></div>
                <div class="preview-body">
                  <div class="preview-sidebar"></div>
                  <div class="preview-content">
                    <div class="preview-card"></div>
                  </div>
                </div>
              </div>
              <div class="theme-name">{{ themeOption.name }}</div>
            </div>
          </div>

          <div class="dropdown-divider"></div>

          <button class="dropdown-item d-flex align-items-center justify-content-between"
                  (click)="toggleDarkMode(); $event.stopPropagation()">
            <span>
              <i class="bi" [ngClass]="(isDarkMode() ? 'bi-sun' : 'bi-moon')"></i>
              {{ (isDarkMode() ? 'THEME.LIGHT_MODE' : 'THEME.DARK_MODE') | translate }}
            </span>
            <div class="form-check form-switch mb-0">
              <input class="form-check-input" type="checkbox" role="switch"
                     [checked]="isDarkMode()" (click)="$event.stopPropagation()">
            </div>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .theme-selector {
      display: inline-block;
    }

    .btn-dropdown {
      background-color: transparent;
      color: white;
      border: 1px solid rgba(255,255,255,0.3);
      display: flex;
      align-items: center;
    }

    .theme-dropdown {
      width: 280px;
      padding: 1rem;
    }

    .theme-options {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
      margin-bottom: 0.5rem;
    }

    .theme-option {
      cursor: pointer;
      border-radius: 0.375rem;
      padding: 0.5rem;
      transition: all 0.2s ease;
    }

    .theme-option:hover {
      background-color: rgba(0,0,0,0.05);
    }

    .theme-option.active {
      background-color: rgba(var(--bs-primary-rgb), 0.1);
    }

    .theme-preview {
      height: 100px;
      border-radius: 0.25rem;
      overflow: hidden;
      border: 1px solid rgba(0,0,0,0.1);
      margin-bottom: 0.5rem;
    }

    .theme-name {
      font-size: 0.875rem;
      text-align: center;
    }

    .preview-header {
      height: 20%;
    }

    .preview-body {
      height: 80%;
      display: flex;
    }

    .preview-sidebar {
      width: 30%;
      height: 100%;
    }

    .preview-content {
      width: 70%;
      height: 100%;
      padding: 5px;
    }

    .preview-card {
      height: 50%;
      margin-top: 10px;
      border-radius: 2px;
    }

    /* Default Theme Preview */
    .preview-default-light .preview-header {
      background-color: #0d6efd;
    }

    .preview-default-light .preview-sidebar {
      background-color: #f8f9fa;
    }

    .preview-default-light .preview-content {
      background-color: #ffffff;
    }

    .preview-default-light .preview-card {
      background-color: #f8f9fa;
      border: 1px solid #dee2e6;
    }

    /* Default Dark Theme Preview */
    .preview-default-dark .preview-header {
      background-color: #212529;
    }

    .preview-default-dark .preview-sidebar {
      background-color: #343a40;
    }

    .preview-default-dark .preview-content {
      background-color: #212529;
    }

    .preview-default-dark .preview-card {
      background-color: #2c3034;
      border: 1px solid #495057;
    }

    /* Green Orange Light Theme Preview */
    .preview-green-orange-light .preview-header {
      background-color: #1e5631;
    }

    .preview-green-orange-light .preview-sidebar {
      background-color: #f8f9f5;
    }

    .preview-green-orange-light .preview-content {
      background-color: #ffffff;
    }

    .preview-green-orange-light .preview-card {
      background-color: #f8f9f5;
      border: 1px solid #e8f0e4;
    }

    .preview-green-orange-light .preview-header::after {
      content: '';
      display: block;
      height: 2px;
      background-color: #e67e22;
    }

    /* Green Orange Dark Theme Preview */
    .preview-green-orange-dark .preview-header {
      background-color: #1e5631;
    }

    .preview-green-orange-dark .preview-sidebar {
      background-color: #2c3c32;
    }

    .preview-green-orange-dark .preview-content {
      background-color: #1c2a21;
    }

    .preview-green-orange-dark .preview-card {
      background-color: #2c3c32;
      border: 1px solid #354a3c;
    }

    .preview-green-orange-dark .preview-header::after {
      content: '';
      display: block;
      height: 2px;
      background-color: #f39c12;
    }

    .preview-indigo-light .preview-header {
      background-color: #393969;
    }

    .preview-indigo-light .preview-sidebar {
      background-color: #F9F6F2;
    }

    .preview-indigo-light .preview-content {
      background-color: #FFFFFF;
    }

    .preview-indigo-light .preview-card {
      background-color: #F9F6F2;
      border: 1px solid #E7EBED;
    }

    .preview-indigo-light .preview-header::after {
      content: '';
      display: block;
      height: 2px;
      background-color: #FFD308;
    }

    /* Indigo Dark Theme Preview */
    .preview-indigo-dark .preview-header {
      background-color: #343A40;
    }

    .preview-indigo-dark .preview-sidebar {
      background-color: #343A40;
    }

    .preview-indigo-dark .preview-content {
      background-color: #2C3338;
    }

    .preview-indigo-dark .preview-card {
      background-color: #404952;
      border: 1px solid #23272B;
    }

    .preview-indigo-dark .preview-header::after {
      content: '';
      display: block;
      height: 2px;
      background-color: #FFD308;
    }
  `]
})
export class ThemeSelectorComponent implements OnInit {
  themeOptions: ThemeOption[] = [
    {
      id: 'light',
      name: 'Default Light',
      description: 'Default light theme',
      icon: 'bi-brightness-high',
      previewClass: 'preview-default-light'
    },
    {
      id: 'dark',
      name: 'Default Dark',
      description: 'Default dark theme',
      icon: 'bi-moon',
      previewClass: 'preview-default-dark'
    },
    {
      id: 'green-orange-light',
      name: 'Nature Light',
      description: 'Green and orange light theme',
      icon: 'bi-tree',
      previewClass: 'preview-green-orange-light'
    },
    {
      id: 'green-orange-dark',
      name: 'Nature Dark',
      description: 'Green and orange dark theme',
      icon: 'bi-tree-fill',
      previewClass: 'preview-green-orange-dark'
    },
    {
      id: 'indigo-light',
      name: 'Indigo Light',
      description: 'Clean indigo and yellow light theme',
      icon: 'bi-brightness-high',
      previewClass: 'preview-indigo-light'
    },
    {
      id: 'indigo-dark',
      name: 'Indigo Dark',
      description: 'Sleek indigo and yellow dark theme',
      icon: 'bi-moon-stars',
      previewClass: 'preview-indigo-dark'
    }
  ];

  constructor(private themeService: ThemeDirectionService) {}

  ngOnInit(): void {}

  selectTheme(theme: Theme): void {
    this.themeService.setTheme(theme);
    localStorage.setItem('theme-preference', theme);
  }

  isThemeActive(theme: Theme): boolean {
    return this.themeService.theme === theme;
  }

  isDarkMode(): boolean {
    return this.themeService.theme.includes('dark');
  }

  toggleDarkMode(): void {
    this.themeService.toggleDarkMode();

    // Save theme preference
    localStorage.setItem('theme-preference', this.themeService.theme);
  }
}
