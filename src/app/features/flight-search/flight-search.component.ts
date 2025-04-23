import { Component, OnInit } from '@angular/core';
import { LanguageService } from '../../_core/services/language.service';

@Component({
  selector: 'app-flight-search',
  standalone: false,
  template: `
    <div class="flight-search-container" [appRtlSupport]="(languageService.currentLanguage$ | async)?.direction!">
      <div class="container py-5">
        <div class="row">
          <div class="col-lg-4 mb-4 mb-lg-0">
            <!-- Search form sidebar -->
            <app-search-form></app-search-form>
          </div>
          
          <div class="col-lg-8">
            <!-- Placeholder content - would actually show flight results -->
            <div class="text-center py-5 placeholder-content">
              <h2>{{ 'FLIGHT_SEARCH.PLACEHOLDER_TITLE' | translate }}</h2>
              <p>{{ 'FLIGHT_SEARCH.PLACEHOLDER_TEXT' | translate }}</p>
              <p>{{ 'FLIGHT_SEARCH.USE_FORM' | translate }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .flight-search-container {
      min-height: 70vh;
    }
    
    .placeholder-content {
      background-color: #f8f9fa;
      border-radius: 10px;
      padding: 3rem;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
      
      :host-context(.dark-mode) & {
        background-color: #2a2a2a;
      }
    }
    
    @media (max-width: 992px) {
      .flight-search-container {
        min-height: 50vh;
      }
      
      .placeholder-content {
        padding: 2rem;
      }
    }
  `]
})
export class FlightSearchComponent implements OnInit {
  constructor(public languageService: LanguageService) {}
  
  ngOnInit(): void {}
}