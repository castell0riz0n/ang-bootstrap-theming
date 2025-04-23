import { Component, OnInit } from '@angular/core';
import { LanguageService } from '../../../_core/services/language.service';

@Component({
  selector: 'app-footer',
  standalone: false,
  template: `
    <footer class="footer" >
      <div class="container" [appRtlSupport]="(languageService.currentLanguage$ | async)?.direction!">
        <div class="row py-4">
          <div class="col-md-4 mb-4 mb-md-0">
            <h5 class="footer-title">{{ 'APP.TITLE' | translate }}</h5>
            <p class="footer-description">{{ 'APP.TAGLINE' | translate }}</p>
            <div class="social-links">
              <a href="#" class="social-link" aria-label="Facebook">
                <i class="bi bi-facebook"></i>
              </a>
              <a href="#" class="social-link" aria-label="Twitter">
                <i class="bi bi-twitter"></i>
              </a>
              <a href="#" class="social-link" aria-label="Instagram">
                <i class="bi bi-instagram"></i>
              </a>
              <a href="#" class="social-link" aria-label="LinkedIn">
                <i class="bi bi-linkedin"></i>
              </a>
            </div>
          </div>
          
          <div class="col-md-2 col-6 mb-4 mb-md-0">
            <h6 class="footer-subtitle">{{ 'FOOTER.COMPANY' | translate }}</h6>
            <ul class="footer-links">
              <li><a href="#">{{ 'FOOTER.ABOUT_US' | translate }}</a></li>
              <li><a href="#">{{ 'FOOTER.CAREERS' | translate }}</a></li>
              <li><a href="#">{{ 'FOOTER.NEWS' | translate }}</a></li>
              <li><a href="#">{{ 'FOOTER.CONTACT' | translate }}</a></li>
            </ul>
          </div>
          
          <div class="col-md-2 col-6 mb-4 mb-md-0">
            <h6 class="footer-subtitle">{{ 'FOOTER.SUPPORT' | translate }}</h6>
            <ul class="footer-links">
              <li><a href="#">{{ 'FOOTER.HELP_CENTER' | translate }}</a></li>
              <li><a href="#">{{ 'FOOTER.FAQ' | translate }}</a></li>
              <li><a href="#">{{ 'FOOTER.BAGGAGE' | translate }}</a></li>
              <li><a href="#">{{ 'FOOTER.REFUNDS' | translate }}</a></li>
            </ul>
          </div>
          
          <div class="col-md-4">
            <h6 class="footer-subtitle">{{ 'FOOTER.NEWSLETTER' | translate }}</h6>
            <p>{{ 'FOOTER.NEWSLETTER_DESC' | translate }}</p>
            <div class="input-group mb-3">
              <input type="email" class="form-control" placeholder="Email" aria-label="Email">
              <button class="btn btn-primary" type="button">
                {{ 'FOOTER.SUBSCRIBE' | translate }}
              </button>
            </div>
          </div>
        </div>
        
        <div class="footer-bottom py-3 border-top">
          <div class="row align-items-center">
            <div class="col-md-6 text-center text-md-start mb-2 mb-md-0">
              <p class="mb-0">© {{ currentYear }} SkyWings Airlines. {{ 'FOOTER.ALL_RIGHTS' | translate }}</p>
            </div>
            <div class="col-md-6 text-center text-md-end">
              <ul class="legal-links">
                <li><a href="#">{{ 'FOOTER.PRIVACY' | translate }}</a></li>
                <li><a href="#">{{ 'FOOTER.TERMS' | translate }}</a></li>
                <li><a href="#">{{ 'FOOTER.LEGAL' | translate }}</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background-color: var(--bs-primary);
      color: white;
      padding-top: 2rem;
    }
    
    .footer-title {
      font-weight: bold;
      margin-bottom: 1rem;
    }
    
    .footer-subtitle {
      color: rgba(255, 255, 255, 0.9);
      font-weight: 500;
      margin-bottom: 1rem;
    }
    
    .footer-description {
      opacity: 0.8;
      margin-bottom: 1rem;
    }
    
    .social-links {
      display: flex;
      gap: 1rem;
    }
    
    .social-link {
      color: white;
      font-size: 1.25rem;
      transition: opacity 0.2s ease;
      
      &:hover {
        opacity: 0.8;
      }
    }
    
    .footer-links {
      list-style: none;
      padding-left: 0;
      
      .rtl & {
        padding-right: 0;
      }
      
      li {
        margin-bottom: 0.5rem;
      }
      
      a {
        color: rgba(255, 255, 255, 0.8);
        text-decoration: none;
        transition: color 0.2s ease;
        
        &:hover {
          color: white;
        }
      }
    }
    
    .footer-bottom {
      border-color: rgba(255, 255, 255, 0.1) !important;
    }
    
    .legal-links {
      display: flex;
      list-style: none;
      padding-left: 0;
      margin-bottom: 0;
      justify-content: center;
      
      @media (min-width: 768px) {
        justify-content: flex-end;
      }
      
      .rtl & {
        padding-right: 0;
      }
      
      li {
        margin-left: 1.5rem;
        
        &:first-child {
          margin-left: 0;
        }
        
        .rtl & {
          margin-left: 0;
          margin-right: 1.5rem;
          
          &:first-child {
            margin-right: 0;
          }
        }
      }
      
      a {
        color: rgba(255, 255, 255, 0.7);
        text-decoration: none;
        font-size: 0.875rem;
        
        &:hover {
          color: white;
        }
      }
    }
    
    // Dark mode adjustments
    :host-context(.dark-mode) {
      .footer {
        background-color: #1a1a1a;
      }
      
      .footer-bottom {
        border-color: rgba(255, 255, 255, 0.05) !important;
      }
    }
  `]
})
export class FooterComponent implements OnInit {
  currentYear: number = new Date().getFullYear();

    constructor(
      public languageService: LanguageService
    ) {}
    

  ngOnInit(): void { }
}