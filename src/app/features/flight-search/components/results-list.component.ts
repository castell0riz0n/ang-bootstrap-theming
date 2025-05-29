import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FlightService } from '../../../_core/services/flight.service';
import { LanguageService } from '../../../_core/services/language.service';
import { BreadcrumbService } from '../../../_core/services/breadcrumb.service';
import { StickyLayoutService } from '../../../_core/services/sticky-layout.service';
import { Flight, FlightSearchCriteria } from '../../../_core/models/flight.model';

@Component({
  selector: 'app-results-list',
  standalone: false,
  template: `
    <div class="results-container"
         [appRtlSupport]="(languageService.currentLanguage$ | async)?.direction!">

      <!-- Page Header -->
      <div class="results-header bg-light py-3 mb-4">
        <div class="container">
          <div class="row align-items-center">
            <div class="col-md-8">
              <h1 class="h3 mb-0">
                <i class="bi bi-airplane me-2"></i>
                {{ 'FLIGHT_SEARCH.FLIGHT_RESULTS' | translate }}
              </h1>
              <p class="text-muted mb-0">
                {{ searchSummary }}
              </p>
            </div>
            <div class="col-md-4 text-md-end">
              <span class="badge bg-primary fs-6">
                {{ flights.length }} {{ 'FLIGHT_SEARCH.RESULTS_FOUND' | translate }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="container">
        <div class="row">
          <!-- Filters Sidebar -->
          <div class="col-lg-3 mb-4">
            <div class="filters-container sticky-top" [style.top.px]="filtersTopOffset">
              <div class="card">
                <div class="card-header">
                  <h5 class="card-title mb-0">
                    <i class="bi bi-funnel me-2"></i>
                    {{ 'FLIGHT_SEARCH.FILTERS' | translate }}
                  </h5>
                </div>
                <div class="card-body">
                  <!-- Price Range Filter -->
                  <div class="filter-section mb-4">
                    <h6>{{ 'FLIGHT_SEARCH.PRICE_RANGE' | translate }}</h6>
                    <div class="form-check" *ngFor="let range of priceRanges">
                      <input class="form-check-input"
                             type="checkbox"
                             [id]="range.id"
                             [(ngModel)]="range.selected"
                             (change)="applyFilters()">
                      <label class="form-check-label" [for]="range.id">
                        {{ range.label }}
                      </label>
                    </div>
                  </div>

                  <!-- Stops Filter -->
                  <div class="filter-section mb-4">
                    <h6>{{ 'FLIGHT_SEARCH.STOPS' | translate }}</h6>
                    <div class="form-check">
                      <input class="form-check-input"
                             type="checkbox"
                             id="directOnly"
                             [(ngModel)]="filters.directOnly"
                             (change)="applyFilters()">
                      <label class="form-check-label" for="directOnly">
                        {{ 'FLIGHT_SEARCH.DIRECT' | translate }}
                      </label>
                    </div>
                  </div>

                  <!-- Airlines Filter -->
                  <div class="filter-section">
                    <h6>{{ 'FLIGHT_SEARCH.AIRLINES' | translate }}</h6>
                    <div class="form-check" *ngFor="let airline of availableAirlines">
                      <input class="form-check-input"
                             type="checkbox"
                             [id]="airline.code"
                             [(ngModel)]="airline.selected"
                             (change)="applyFilters()">
                      <label class="form-check-label" [for]="airline.code">
                        {{ airline.name }}
                      </label>
                    </div>
                  </div>

                  <!-- Clear Filters -->
                  <div class="mt-4">
                    <button class="btn btn-outline-secondary w-100"
                            (click)="clearFilters()">
                      <i class="bi bi-x-circle me-2"></i>
                      {{ 'FLIGHT_SEARCH.CLEAR_FILTERS' | translate }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Results Column -->
          <div class="col-lg-9">
            <!-- Loading State -->
            <div *ngIf="isLoading" class="text-center py-5">
              <div class="spinner-border text-primary mb-3" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
              <h4>{{ 'FLIGHT_SEARCH.SEARCHING_FLIGHTS' | translate }}</h4>
              <p class="text-muted">{{ 'FLIGHT_SEARCH.PLEASE_WAIT' | translate }}</p>
            </div>

            <!-- Results Content -->
            <div *ngIf="!isLoading">
              <!-- Sort and View Options -->
              <div class="results-controls d-flex justify-content-between align-items-center mb-3">
                <div class="sort-options">
                  <label class="form-label me-2">{{ 'FLIGHT_SEARCH.SORT_BY' | translate }}:</label>
                  <select class="form-select form-select-sm d-inline-block"
                          style="width: auto;"
                          [(ngModel)]="sortBy"
                          (change)="sortFlights()">
                    <option value="price">{{ 'FLIGHT_SEARCH.SORT_PRICE' | translate }}</option>
                    <option value="duration">{{ 'FLIGHT_SEARCH.SORT_DURATION' | translate }}</option>
                    <option value="departure">{{ 'FLIGHT_SEARCH.SORT_DEPARTURE' | translate }}</option>
                    <option value="arrival">{{ 'FLIGHT_SEARCH.SORT_ARRIVAL' | translate }}</option>
                  </select>
                </div>

                <div class="view-options">
                  <div class="btn-group" role="group">
                    <input type="radio" class="btn-check" name="viewMode" id="listView"
                           value="list" [(ngModel)]="viewMode">
                    <label class="btn btn-outline-secondary btn-sm" for="listView">
                      <i class="bi bi-list"></i>
                    </label>

                    <input type="radio" class="btn-check" name="viewMode" id="gridView"
                           value="grid" [(ngModel)]="viewMode">
                    <label class="btn btn-outline-secondary btn-sm" for="gridView">
                      <i class="bi bi-grid"></i>
                    </label>
                  </div>
                </div>
              </div>

              <!-- Flight Results -->
              <div class="flight-results"
                   [class.grid-view]="viewMode === 'grid'"
                   [class.list-view]="viewMode === 'list'">

                <div *ngFor="let flight of filteredFlights; trackBy: trackByFlightId"
                     class="flight-result-item mb-3"
                     [class.col-md-6]="viewMode === 'grid'">
                  <app-flight-card
                    [flight]="flight">
                  </app-flight-card>
                </div>
              </div>

              <!-- No Results -->
              <div *ngIf="filteredFlights.length === 0" class="no-results text-center py-5">
                <div class="mb-4">
                  <i class="bi bi-search display-1 text-muted"></i>
                </div>
                <h4>{{ 'FLIGHT_SEARCH.NO_RESULTS' | translate }}</h4>
                <p class="text-muted mb-4">
                  {{ 'FLIGHT_SEARCH.NO_RESULTS_MESSAGE' | translate }}
                </p>
                <div class="d-flex gap-2 justify-content-center">
                  <button class="btn btn-outline-primary" (click)="clearFilters()">
                    {{ 'FLIGHT_SEARCH.CLEAR_FILTERS' | translate }}
                  </button>
                  <button class="btn btn-primary" (click)="modifySearch()">
                    {{ 'FLIGHT_SEARCH.MODIFY_SEARCH' | translate }}
                  </button>
                </div>
              </div>

              <!-- Load More (if pagination is needed) -->
              <div *ngIf="hasMoreResults" class="text-center mt-4">
                <button class="btn btn-outline-primary"
                        (click)="loadMoreResults()"
                        [disabled]="isLoadingMore">
                  <span *ngIf="!isLoadingMore">
                    {{ 'FLIGHT_SEARCH.LOAD_MORE' | translate }}
                  </span>
                  <span *ngIf="isLoadingMore">
                    <span class="spinner-border spinner-border-sm me-2"></span>
                    {{ 'FLIGHT_SEARCH.LOADING' | translate }}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .results-container {
      min-height: calc(100vh - 200px);
    }

    .results-header {
      border-bottom: 1px solid var(--bs-border-color);
    }

    .filters-container {
      position: sticky;
      z-index: 10;
    }

    .filter-section h6 {
      font-weight: 600;
      color: var(--bs-primary);
      margin-bottom: 0.75rem;
    }

    .flight-results.grid-view {
      display: flex;
      flex-wrap: wrap;
      margin: -0.5rem;
    }

    .flight-results.grid-view .flight-result-item {
      padding: 0.5rem;
      flex: 0 0 50%;
    }

    .no-results {
      background-color: var(--bs-light);
      border-radius: 0.5rem;
      margin: 2rem 0;
    }

    .results-controls {
      background-color: var(--bs-light);
      padding: 1rem;
      border-radius: 0.5rem;
      border: 1px solid var(--bs-border-color);
    }

    @media (max-width: 768px) {
      .results-controls {
        flex-direction: column;
        gap: 1rem;
      }

      .flight-results.grid-view .flight-result-item {
        flex: 0 0 100%;
      }
    }

    /* Dark theme support */
    :host-context(.dark-mode) .results-header,
    :host-context(.theme-dark) .results-header,
    :host-context(.theme-green-orange-dark) .results-header,
    :host-context(.theme-indigo-dark) .results-header {
      background-color: var(--bs-dark) !important;
      color: var(--bs-light);
    }
  `]
})
export class ResultsListComponent implements OnInit, OnDestroy {
  flights: Flight[] = [];
  filteredFlights: Flight[] = [];
  isLoading = true;
  isLoadingMore = false;
  hasMoreResults = false;

  searchCriteria: FlightSearchCriteria = {
    fromAirport: '',
    toAirport: '',
    departureDate: '',
    passengers: 1,
    tripType: 'oneWay'
  };

  searchSummary = '';
  filtersTopOffset = 20;

  // View and sorting options
  viewMode: 'list' | 'grid' = 'list';
  sortBy = 'price';

  // Filter options
  filters = {
    directOnly: false,
    maxPrice: 0,
    minPrice: 0
  };

  priceRanges = [
    { id: 'price1', label: '$0 - $250', min: 0, max: 250, selected: false },
    { id: 'price2', label: '$250 - $500', min: 250, max: 500, selected: false },
    { id: 'price3', label: '$500 - $750', min: 500, max: 750, selected: false },
    { id: 'price4', label: '$750+', min: 750, max: 99999, selected: false }
  ];

  availableAirlines: Array<{code: string, name: string, selected: boolean}> = [];

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private flightService: FlightService,
    private breadcrumbService: BreadcrumbService,
    private stickyLayoutService: StickyLayoutService,
    public languageService: LanguageService
  ) {}

  ngOnInit(): void {
    this.setupStickyBehavior();
    this.loadSearchCriteria();
    this.setupBreadcrumbs();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupStickyBehavior(): void {
    // Enable modify search component for this page
    this.stickyLayoutService.toggleComponent('modifySearch', true);

    // Calculate offset for sticky filters based on sticky components height
    this.stickyLayoutService.state$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.filtersTopOffset = state.totalHeight + 20;
      });
  }

  private loadSearchCriteria(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.searchCriteria = {
          fromAirport: params['fromAirport'] || '',
          toAirport: params['toAirport'] || '',
          departureDate: params['departureDate'] || '',
          returnDate: params['returnDate'] || undefined,
          passengers: +params['passengers'] || 1,
          tripType: (params['tripType'] as 'oneWay' | 'roundTrip') || 'oneWay'
        };

        this.updateSearchSummary();
        this.loadFlights();
      });
  }

  private setupBreadcrumbs(): void {
    this.breadcrumbService.buildFlightSearchBreadcrumbs(this.searchCriteria);
  }

  private updateSearchSummary(): void {
    const { fromAirport, toAirport, departureDate, returnDate, passengers } = this.searchCriteria;
    let summary = `${fromAirport} → ${toAirport}`;

    if (departureDate) {
      const depDate = new Date(departureDate).toLocaleDateString();
      summary += ` • ${depDate}`;

      if (returnDate) {
        const retDate = new Date(returnDate).toLocaleDateString();
        summary += ` - ${retDate}`;
      }
    }

    summary += ` • ${passengers} passenger${passengers > 1 ? 's' : ''}`;
    this.searchSummary = summary;
  }

  loadFlights(): void {
    this.isLoading = true;

    this.flightService.searchFlights(this.searchCriteria)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (results) => {
          this.flights = results;
          this.extractAirlines();
          this.applyFilters();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error fetching flights:', error);
          this.isLoading = false;
        }
      });
  }

  private extractAirlines(): void {
    const airlines = new Map<string, string>();
    this.flights.forEach(flight => {
      airlines.set(flight.airlineName, flight.airlineName);
    });

    this.availableAirlines = Array.from(airlines.entries()).map(([code, name]) => ({
      code,
      name,
      selected: false
    }));
  }

  applyFilters(): void {
    this.filteredFlights = this.flights.filter(flight => {
      // Price range filter
      const selectedPriceRanges = this.priceRanges.filter(range => range.selected);
      if (selectedPriceRanges.length > 0) {
        const inPriceRange = selectedPriceRanges.some(range =>
          flight.price >= range.min && flight.price <= range.max
        );
        if (!inPriceRange) return false;
      }

      // Direct flights only
      if (this.filters.directOnly && flight.stops > 0) {
        return false;
      }

      // Airline filter
      const selectedAirlines = this.availableAirlines.filter(airline => airline.selected);
      if (selectedAirlines.length > 0) {
        const isSelectedAirline = selectedAirlines.some(airline =>
          airline.name === flight.airlineName
        );
        if (!isSelectedAirline) return false;
      }

      return true;
    });

    this.sortFlights();
  }

  sortFlights(): void {
    this.filteredFlights.sort((a, b) => {
      switch (this.sortBy) {
        case 'price':
          return a.price - b.price;
        case 'duration':
          return this.parseDuration(a.duration) - this.parseDuration(b.duration);
        case 'departure':
          return a.departureTime.localeCompare(b.departureTime);
        case 'arrival':
          return a.arrivalTime.localeCompare(b.arrivalTime);
        default:
          return 0;
      }
    });
  }

  private parseDuration(duration: string): number {
    // Parse duration like "7h 15m" to minutes
    const matches = duration.match(/(\d+)h\s*(\d+)m/);
    if (matches) {
      return parseInt(matches[1]) * 60 + parseInt(matches[2]);
    }
    return 0;
  }

  clearFilters(): void {
    this.filters.directOnly = false;
    this.priceRanges.forEach(range => range.selected = false);
    this.availableAirlines.forEach(airline => airline.selected = false);
    this.applyFilters();
  }

  selectFlight(flight: Flight): void {
    this.router.navigate(['/flights', flight.id]);
  }

  modifySearch(): void {
    this.router.navigate(['/flights']);
  }

  loadMoreResults(): void {
    // Implement pagination if needed
    this.isLoadingMore = true;

    setTimeout(() => {
      this.isLoadingMore = false;
      this.hasMoreResults = false;
    }, 1000);
  }

  trackByFlightId(index: number, flight: Flight): string {
    return flight.id;
  }
}
