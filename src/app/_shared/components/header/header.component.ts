import { Component, OnInit } from '@angular/core';
import { Language, LanguageService } from '../../../_core/services/language.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: false,
  template: `
    <header class="header-container">
      <nav class="navbar navbar-expand-lg navbar-dark navbar-airline">
        <div class="container">
          <a class="navbar-brand" routerLink="/">
            <img src="assets/images/logo.svg" alt="SkyWings" width="40" height="40" class="d-inline-block align-text-top me-2">
            {{ 'APP.TITLE' | translate }}
          </a>

          <button class="navbar-toggler" type="button" data-bs-toggle="collapse"
                  data-bs-target="#navbarMain" aria-controls="navbarMain"
                  aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
          </button>

          <div class="collapse navbar-collapse" id="navbarMain">
            <ul class="navbar-nav me-auto mb-2 mb-lg-0">
              <li class="nav-item">
                <a class="nav-link" routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
                  {{ 'NAVIGATION.HOME' | translate }}
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" routerLink="/flights" routerLinkActive="active">
                  {{ 'NAVIGATION.FLIGHTS' | translate }}
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" routerLink="/bookings" routerLinkActive="active">
                  {{ 'NAVIGATION.BOOKINGS' | translate }}
                </a>
              </li>
            </ul>

            <div class="d-flex align-items-center">
              <!-- Theme Selector -->
              <app-theme-selector class="me-2"></app-theme-selector>

              <!-- Language Selector -->
              <app-language-selector class="me-3"></app-language-selector>

              <!-- Auth Buttons -->
              <div class="auth-buttons d-flex">
                <a class="btn btn-outline-light me-2" routerLink="/auth/login">
                  {{ 'NAVIGATION.LOGIN' | translate }}
                </a>
                <a class="btn btn-accent" routerLink="/auth/register">
                  {{ 'NAVIGATION.REGISTER' | translate }}
                </a>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  `,
  styles: [`
    .navbar-airline {
      padding: 0.75rem 1rem;
      transition: background-color 0.3s ease;
    }

    .navbar-brand {
      display: flex;
      align-items: center;
    }

    .active {
      font-weight: bold;
      position: relative;

      &::after {
        content: '';
        position: absolute;
        bottom: -2px;
        left: 0.5rem;
        right: 0.5rem;
        height: 2px;
        background-color: white;

        .rtl & {
          right: 0.5rem;
          left: 0.5rem;
        }
      }
    }

    @media (max-width: 992px) {
      .navbar-collapse {
        padding: 1rem 0;
      }

      .d-flex {
        flex-direction: column;
        align-items: flex-start !important;
      }

      .me-3, .me-2 {
        margin-right: 0 !important;
        margin-bottom: 1rem;

        .rtl & {
          margin-left: 0 !important;
        }
      }

      .auth-buttons {
        width: 100%;
        flex-direction: column;

        .btn {
          margin: 0.25rem 0;
          width: 100%;
          text-align: center;
        }
      }
    }

    // RTL specific adjustments
    :host-context(.rtl) {
      .me-3 {
        margin-right: 0 !important;
        margin-left: 1rem;
      }

      .me-2 {
        margin-right: 0 !important;
        margin-left: 0.5rem;
      }

      .navbar-nav {
        padding-right: 0;
      }

      .active::after {
        right: 0.5rem;
        left: 0.5rem;
      }
    }
  `]
})
export class HeaderComponent implements OnInit {
  constructor(public languageService: LanguageService) {}

  ngOnInit(): void {}
}
