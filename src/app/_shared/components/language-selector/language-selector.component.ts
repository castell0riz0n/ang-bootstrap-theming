import { Component, OnInit } from '@angular/core';
import { Language, LanguageService } from '../../../_core/services/language.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-language-selector',
  standalone: false,
  template: `
    <div class="language-selector" [class.transitioning]="(isLanguageChanging$ | async)">
      <div class="dropdown">
        <button class="btn btn-dropdown dropdown-toggle" type="button" id="languageDropdown"
                data-bs-toggle="dropdown" aria-expanded="false">
          <ng-container *ngIf="currentLanguage$ | async as currentLang">
            <span class="flag-icon">{{ currentLang?.flagIcon }}</span>
            <span class="lang-name ms-2">{{ currentLang?.nativeName }}</span>
          </ng-container>
        </button>
        <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="languageDropdown">
          <li *ngFor="let lang of languages">
            <a class="dropdown-item" [class.active]="(currentLanguage$ | async)?.code === lang.code"
               (click)="switchLanguage(lang)">
              <span class="flag-icon">{{ lang.flagIcon }}</span>
              <span class="lang-name ms-2">{{ lang.nativeName }}</span>
              <span class="lang-english text-muted ms-1" *ngIf="lang.name !== lang.nativeName">
                ({{ lang.name }})
              </span>
            </a>
          </li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .language-selector {
      position: relative;

      &.transitioning {
        pointer-events: none;
        opacity: 0.7;
      }
    }

    .btn-dropdown {
      display: flex;
      align-items: center;
      background-color: transparent;
      color: white;
      border: 1px solid rgba(255,255,255,0.5);
      padding: 0.375rem 1rem;
      font-weight: 500;
    }

    .dropdown-item {
      display: flex;
      align-items: center;
      padding: 0.5rem 1rem;

      &.active {
        font-weight: 500;
      }
    }

    .flag-icon {
      font-size: 1.2rem;
    }
  `]
})
export class LanguageSelectorComponent implements OnInit {
  languages: Language[] = [];
  currentLanguage$: Observable<Language>;
  isLanguageChanging$: Observable<boolean>;

  constructor(private languageService: LanguageService) {
    this.languages = this.languageService.languages;
    this.currentLanguage$ = this.languageService.currentLanguage$;
    this.isLanguageChanging$ = this.languageService.isLanguageChanging$;
  }

  ngOnInit(): void {}

  switchLanguage(language: Language): void {
    this.languageService.setLanguage(language);
  }
}
