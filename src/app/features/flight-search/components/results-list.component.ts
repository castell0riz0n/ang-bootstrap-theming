import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FlightService } from '../../../_core/services/flight.service';
import { LanguageService } from '../../../_core/services/language.service';
import { Flight, FlightSearchCriteria } from '../../../_core/models/flight.model';

@Component({
  selector: 'app-results-list',
  standalone: false,
  template: `
    <div class="results-container" [appRtlSupport]="(languageService.currentLanguage$ | async)?.direction!">
      <div class="container py-5">
        <div class="row">
          <!-- Search Parameters Summary -->
          <div class="col-12 mb-4">
            <div class="search-summary card">
              <div class="card-body">
                <div class="d-flex flex-wrap justify-content-between align-items-center">
                  <div class="route-info">
                    <h5 class="mb-1">{{ searchCriteria.fromAirport }} → {{ searchCriteria.toAirport }}</h5>
                    <p class="mb-0 text-muted">
                      {{ searchCriteria.departureDate | date }} 
                      <span *ngIf="searchCriteria.returnDate">
                        - {{ searchCriteria.returnDate | date }}
                      </span>
                      • {{ searchCriteria.passengers }} {{ 'FLIGHT_SEARCH.PASSENGER_COUNT' | translate }}
                    </p>
                  </div>
                  <button class="btn btn-outline-primary mt-2 mt-md-0" routerLink="/flights">
                    {{ 'FLIGHT_SEARCH.MODIFY_SEARCH' | translate }}
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Filters Section -->
          <div class="col-lg-3 mb-4">
            <div class="filters-container card">
              <div class="card-body">
                <h5 class="card-title mb-3">{{ 'FLIGHT_SEARCH.FILTERS' | translate }}</h5>
                
                <!-- Price Range Filter -->
                <div class="filter-section mb-4">
                  <h6>{{ 'FLIGHT_SEARCH.PRICE_RANGE' | translate }}</h6>
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="price1">
                    <label class="form-check-label" for="price1">$0 - $250</label>
                  </div>
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="price2">
                    <label class="form-check-label" for="price2">$250 - $500</label>
                  </div>
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="price3">
                    <label class="form-check-label" for="price3">$500 - $750</label>
                  </div>
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="price4">
                    <label class="form-check-label" for="price4">$750+</label>
                  </div>
                </div>
                
                <!-- Stops Filter -->
                <div class="filter-section mb-4">
                  <h6>{{ 'FLIGHT_SEARCH.STOPS' | translate }}</h6>
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="direct">
                    <label class="form-check-label" for="direct">{{ 'FLIGHT_SEARCH.DIRECT' | translate }}</label>
                  </div>
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="oneStop">
                    <label class="form-check-label" for="oneStop">{{ 'FLIGHT_SEARCH.ONE_STOP' | translate }}</label>
                  </div>
                </div>
                
                <!-- Departure Time -->
                <div class="filter-section">
                  <h6>{{ 'FLIGHT_SEARCH.DEPARTURE_TIME' | translate }}</h6>
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="morning">
                    <label class="form-check-label" for="morning">{{ 'FLIGHT_SEARCH.MORNING' | translate }}</label>
                  </div>
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="afternoon">
                    <label class="form-check-label" for="afternoon">{{ 'FLIGHT_SEARCH.AFTERNOON' | translate }}</label>
                  </div>
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="evening">
                    <label class="form-check-label" for="evening">{{ 'FLIGHT_SEARCH.EVENING' | translate }}</label>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Results Section -->
          <div class="col-lg-9">
            <!-- Loading state -->
            <div *ngIf="isLoading" class="text-center py-5">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
              <p class="mt-3">{{ 'FLIGHT_SEARCH.SEARCHING_FLIGHTS' | translate }}</p>
            </div>
            
            <!-- Results -->
            <div *ngIf="!isLoading">
              <!-- Sort options -->
              <div class="results-header d-flex justify-content-between align-items-center mb-3">
                <p class="mb-0">
                  {{ flights.length }} {{ 'FLIGHT_SEARCH.RESULTS_FOUND' | translate }}
                </p>
                <div class="sort-options">
                  <select class="form-select form-select-sm">
                    <option value="price">{{ 'FLIGHT_SEARCH.SORT_PRICE' | translate }}</option>
                    <option value="duration">{{ 'FLIGHT_SEARCH.SORT_DURATION' | translate }}</option>
                    <option value="departure">{{ 'FLIGHT_SEARCH.SORT_DEPARTURE' | translate }}</option>
                    <option value="arrival">{{ 'FLIGHT_SEARCH.SORT_ARRIVAL' | translate }}</option>
                  </select>
                </div>
              </div>
              
              <!-- Flight Cards -->
              <div *ngFor="let flight of flights" class="mb-3">
                <app-flight-card [flight]="flight"></app-flight-card>
              </div>
              
              <!-- No results state -->
              <div *ngIf="flights.length === 0" class="text-center py-5">
                <div class="alert alert-info">
                  {{ 'FLIGHT_SEARCH.NO_RESULTS' | translate }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .search-summary {
      border-left: 4px solid var(--bs-primary);
      
      :host-context(.rtl) & {
        border-left: none;
        border-right: 4px solid var(--bs-primary);
      }
    }
    
    .filters-container {
      position: sticky;
      top: 20px;
    }
    
    .filter-section {
      position: relative;
      
      h6 {
        font-weight: 600;
        margin-bottom: 0.75rem;
      }
    }
    
    // RTL form checkbox fixes
    :host-context(.rtl) {
      .form-check {
        padding-right: 1.5em;
        padding-left: 0;
        text-align: right;
      }
      
      .form-check-input {
        float: right;
        margin-left: 0;
        margin-right: -1.5em;
      }
    }
    
    // Dark mode adjustments
    :host-context(.dark-mode) {
      .form-select {
        background-color: #333;
        color: #fff;
        border-color: #444;
      }
    }
  `]
})
export class ResultsListComponent implements OnInit {
  flights: Flight[] = [];
  isLoading = true;
  searchCriteria: FlightSearchCriteria = {
    fromAirport: '',
    toAirport: '',
    departureDate: '',
    passengers: 1,
    tripType: 'oneWay'
  };
  
  constructor(
    private route: ActivatedRoute,
    private flightService: FlightService,
    public languageService: LanguageService
  ) {}
  
  ngOnInit(): void {
    // Get search criteria from query params
    this.route.queryParams.subscribe(params => {
      this.searchCriteria = {
        fromAirport: params['fromAirport'] || '',
        toAirport: params['toAirport'] || '',
        departureDate: params['departureDate'] || '',
        returnDate: params['returnDate'] || undefined,
        passengers: +params['passengers'] || 1,
        tripType: (params['tripType'] as 'oneWay' | 'roundTrip') || 'oneWay'
      };
      
      // Load flights
      this.loadFlights();
    });
  }
  
  loadFlights(): void {
    this.isLoading = true;
    
    this.flightService.searchFlights(this.searchCriteria).subscribe({
      next: (results) => {
        this.flights = results;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching flights:', error);
        this.isLoading = false;
      }
    });
  }
}