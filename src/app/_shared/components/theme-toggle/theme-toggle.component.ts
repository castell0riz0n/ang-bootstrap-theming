import { Component, OnInit } from '@angular/core';
import { ThemeService, ThemeMode } from '../../../_core/services/theme.service';
import { Observable } from 'rxjs';
import {Theme, ThemeDirectionService} from '../../../_core/services/theme-direction.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: false,
  template: `
    <div class="theme-toggle">
      <button
        class="btn btn-icon"
        (click)="toggleTheme()"
        [attr.aria-label]="(currentTheme$ | async) === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
      >
        <span *ngIf="(currentTheme$ | async) === 'light'" class="icon">🌙</span>
        <span *ngIf="(currentTheme$ | async) === 'dark'" class="icon">☀️</span>
      </button>
    </div>
  `,
  styles: [`
    .theme-toggle {
      display: inline-flex;
      align-items: center;
    }

    .btn-icon {
      background: transparent;
      border: none;
      color: white;
      padding: 0.25rem;
      font-size: 1.25rem;
      line-height: 1;
      transition: transform 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover {
        transform: rotate(12deg);
      }

      &:focus {
        box-shadow: none;
        outline: none;
      }
    }

    .icon {
      display: inline-block;
      transition: all 0.3s ease;
    }
  `]
})
export class ThemeToggleComponent implements OnInit {
  currentTheme$: Observable<Theme>;

  constructor(private themeService: ThemeDirectionService) {
    this.currentTheme$ = this.themeService.theme$;
  }

  ngOnInit(): void {}

  toggleTheme(): void {
    const currentTheme = this.themeService.theme;
    const newTheme: Theme = currentTheme === 'light' ? 'dark' : 'light';

    this.themeService.setTheme(newTheme);

    // Save user preference
    localStorage.setItem('theme', newTheme);
  }
}
