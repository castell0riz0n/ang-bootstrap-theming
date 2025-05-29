import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LanguageService } from '../../../_core/services/language.service';
import { FlightSearchCriteria } from '../../../_core/models/flight.model';

@Component({
  selector: 'app-modify-search',
  standalone: false,
  template: `
    <div class="modify-search-container"
         [appRtlSupport]="(languageService.currentLanguage$ | async)?.direction!">

      <div class="container-fluid">
        <form [formGroup]="searchForm" (ngSubmit)="onModifySearch()" class="modify-search-form">

          <!-- Compact Search Form -->
          <div class="row g-2 align-items-end">

            <!-- From/To Section -->
            <div class="col-md-3 col-6">
              <div class="search-route-container">
                <div class="route-inputs">
                  <input type="text"
                         class="form-control form-control-sm route-from"
                         formControlName="fromAirport"
                         [placeholder]="'FLIGHT_SEARCH.FROM' | translate"
                         readonly>

                  <button type="button"
                          class="btn btn-sm btn-outline-secondary route-swap"
                          (click)="swapRoutes()"
                          [title]="'FLIGHT_SEARCH.SWAP_ROUTES' | translate">
                    <i class="bi bi-arrow-left-right"></i>
                  </button>

                  <input type="text"
                         class="form-control form-control-sm route-to"
                         formControlName="toAirport"
                         [placeholder]="'FLIGHT_SEARCH.TO' | translate"
                         readonly>
                </div>
              </div>
            </div>

            <!-- Date Section -->
            <div class="col-md-2 col-6" *ngIf="searchCriteria?.tripType === 'oneWay'">
              <input type="date"
                     class="form-control form-control-sm"
                     formControlName="departureDate"
                     [min]="getTodayDate()">
            </div>

            <div class="col-md-3" *ngIf="searchCriteria?.tripType === 'roundTrip'">
              <div class="date-range-container">
                <input type="date"
                       class="form-control form-control-sm date-from"
                       formControlName="departureDate"
                       [min]="getTodayDate()">
                <span class="date-separator">-</span>
                <input type="date"
                       class="form-control form-control-sm date-to"
                       formControlName="returnDate"
                       [min]="searchForm.get('departureDate')?.value">
              </div>
            </div>

            <!-- Passengers -->
            <div class="col-md-2 col-6">
              <select class="form-select form-select-sm" formControlName="passengers">
                <option value="1">1 {{ 'FLIGHT_SEARCH.PASSENGER' | translate }}</option>
                <option value="2">2 {{ 'FLIGHT_SEARCH.PASSENGERS' | translate }}</option>
                <option value="3">3 {{ 'FLIGHT_SEARCH.PASSENGERS' | translate }}</option>
                <option value="4">4 {{ 'FLIGHT_SEARCH.PASSENGERS' | translate }}</option>
                <option value="5">5 {{ 'FLIGHT_SEARCH.PASSENGERS' | translate }}</option>
                <option value="6">6 {{ 'FLIGHT_SEARCH.PASSENGERS' | translate }}</option>
              </select>
            </div>

            <!-- Action Buttons -->
            <div class="col-md-2 col-12">
              <div class="action-buttons">
                <button type="submit"
                        class="btn btn-primary btn-sm"
                        [disabled]="searchForm.invalid || isSearching">
                  <span *ngIf="!isSearching">
                    <i class="bi bi-search flip-rtl me-1"></i>
                    {{ compactMode ? ('FLIGHT_SEARCH.SEARCH' | translate) : ('FLIGHT_SEARCH.MODIFY_SEARCH' | translate) }}
                  </span>
                  <span *ngIf="isSearching">
                    <span class="spinner-border spinner-border-sm me-1" role="status"></span>
                    {{ 'FLIGHT_SEARCH.SEARCHING' | translate }}
                  </span>
                </button>

                <button type="button"
                        class="btn btn-outline-secondary btn-sm ms-2"
                        (click)="toggleExpandedMode()"
                        [title]="expandedMode ? ('FLIGHT_SEARCH.COMPACT_MODE' | translate) : ('FLIGHT_SEARCH.MORE_OPTIONS' | translate)">
                  <i [class]="expandedMode ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Extended Options (Collapsible) -->
          <div class="extended-options"
               [class.show]="expandedMode"
               [@slideDown]="expandedMode ? 'open' : 'closed'">

            <div class="row g-3 mt-2">
              <!-- Trip Type -->
              <div class="col-md-3">
                <label class="form-label-sm">{{ 'FLIGHT_SEARCH.TRIP_TYPE' | translate }}</label>
                <div class="btn-group w-100" role="group">
                  <input type="radio" class="btn-check" formControlName="tripType" id="oneWay" value="oneWay">
                  <label class="btn btn-outline-primary btn-sm" for="oneWay">
                    {{ 'FLIGHT_SEARCH.ONE_WAY' | translate }}
                  </label>

                  <input type="radio" class="btn-check" formControlName="tripType" id="roundTrip" value="roundTrip">
                  <label class="btn btn-outline-primary btn-sm" for="roundTrip">
                    {{ 'FLIGHT_SEARCH.ROUND_TRIP' | translate }}
                  </label>
                </div>
              </div>

              <!-- Cabin Class -->
              <div class="col-md-3">
                <label class="form-label-sm">{{ 'FLIGHT_SEARCH.CABIN_CLASS' | translate }}</label>
                <select class="form-select form-select-sm" formControlName="cabinClass">
                  <option value="economy">{{ 'FLIGHT_SEARCH.ECONOMY' | translate }}</option>
                  <option value="premium">{{ 'FLIGHT_SEARCH.PREMIUM_ECONOMY' | translate }}</option>
                  <option value="business">{{ 'FLIGHT_SEARCH.BUSINESS' | translate }}</option>
                  <option value="first">{{ 'FLIGHT_SEARCH.FIRST_CLASS' | translate }}</option>
                </select>
              </div>

              <!-- Flexible Dates -->
              <div class="col-md-3">
                <label class="form-label-sm">{{ 'FLIGHT_SEARCH.OPTIONS' | translate }}</label>
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" id="flexibleDates" formControlName="flexibleDates">
                  <label class="form-check-label form-label-sm" for="flexibleDates">
                    {{ 'FLIGHT_SEARCH.FLEXIBLE_DATES' | translate }}
                  </label>
                </div>
              </div>

              <!-- Direct Flights Only -->
              <div class="col-md-3">
                <label class="form-label-sm">&nbsp;</label>
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" id="directOnly" formControlName="directOnly">
                  <label class="form-check-label form-label-sm" for="directOnly">
                    {{ 'FLIGHT_SEARCH.DIRECT_ONLY' | translate }}
                  </label>
                </div>
              </div>
            </div>
          </div>
        </form>

        <!-- Search Summary (Show when not in edit mode) -->
        <div *ngIf="showSummary && !isEditing" class="search-summary">
          <div class="summary-content">
            <span class="route-summary">
              <i class="bi bi-airplane me-1"></i>
              {{ searchCriteria?.fromAirport }} → {{ searchCriteria?.toAirport }}
            </span>
            <span class="date-summary">
              <i class="bi bi-calendar me-1"></i>
              {{ formatDateSummary() }}
            </span>
            <span class="passenger-summary">
              <i class="bi bi-people me-1"></i>
              {{ searchCriteria?.passengers }} {{ 'FLIGHT_SEARCH.PASSENGERS' | translate }}
            </span>
            <button class="btn btn-link btn-sm p-0 ms-2"
                    (click)="startEditing()"
                    [title]="'FLIGHT_SEARCH.MODIFY_SEARCH' | translate">
              <i class="bi bi-pencil"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modify-search-container {
      background-color: var(--bs-body-bg);
      border-bottom: 1px solid var(--bs-border-color);
      padding: 0.75rem 0;
      min-height: 60px;
    }

    .modify-search-form {
      width: 100%;
    }

    /* Route Input Styling */
    .search-route-container {
      position: relative;
    }

    .route-inputs {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .route-from,
    .route-to {
      flex: 1;
      min-width: 0; /* Allow shrinking */
    }

    .route-swap {
      flex-shrink: 0;
      width: 32px;
      height: 32px;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* Date Range Styling */
    .date-range-container {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .date-from,
    .date-to {
      flex: 1;
    }

    .date-separator {
      color: var(--bs-secondary);
      font-weight: 500;
      flex-shrink: 0;
    }

    /* Action Buttons */
    .action-buttons {
      display: flex;
      align-items: center;
      justify-content: flex-end;

      :host-context(.rtl) & {
        justify-content: flex-start;
      }
    }

    /* Extended Options */
    .extended-options {
      overflow: hidden;
      max-height: 0;
      transition: max-height 0.3s ease-out;
    }

    .extended-options.show {
      max-height: 200px;
    }

    .form-label-sm {
      font-size: 0.8rem;
      font-weight: 500;
      color: var(--bs-secondary);
      margin-bottom: 0.25rem;
    }

    /* Search Summary */
    .search-summary {
      margin-top: 0.5rem;
      padding: 0.5rem;
      background-color: rgba(var(--bs-primary-rgb), 0.1);
      border-radius: 0.375rem;
      border: 1px solid rgba(var(--bs-primary-rgb), 0.2);
    }

    .summary-content {
      display: flex;
      align-items: center;
      gap: 1rem;
      font-size: 0.9rem;
      flex-wrap: wrap;
    }

    .route-summary,
    .date-summary,
    .passenger-summary {
      display: flex;
      align-items: center;
      color: var(--bs-body-color);
    }

    /* Compact Mode Adjustments */
    .compact-mode {
      .modify-search-container {
        padding: 0.5rem 0;
        min-height: 50px;
      }

      .form-control-sm,
      .form-select-sm,
      .btn-sm {
        font-size: 0.8rem;
        padding: 0.25rem 0.5rem;
      }
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .route-inputs {
        flex-direction: column;
        gap: 0.25rem;
      }

      .route-swap {
        order: 1;
        transform: rotate(90deg);
      }

      .date-range-container {
        flex-direction: column;
        gap: 0.25rem;
      }

      .date-separator {
        display: none;
      }

      .action-buttons {
        justify-content: stretch;

        .btn {
          flex: 1;
        }
      }

      .summary-content {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
      }
    }

    @media (max-width: 576px) {
      .modify-search-container {
        padding: 0.5rem 0;
      }

      .form-control-sm,
      .form-select-sm {
        font-size: 0.8rem;
      }

      .extended-options.show {
        max-height: 300px;
      }
    }

    /* Dark Theme Support */
    :host-context(.dark-mode) .modify-search-container,
    :host-context(.theme-dark) .modify-search-container,
    :host-context(.theme-green-orange-dark) .modify-search-container,
    :host-context(.theme-indigo-dark) .modify-search-container {
      background-color: var(--bs-body-bg);
      border-bottom-color: var(--bs-border-color);
    }

    :host-context(.dark-mode) .search-summary,
    :host-context(.theme-dark) .search-summary,
    :host-context(.theme-green-orange-dark) .search-summary,
    :host-context(.theme-indigo-dark) .search-summary {
      background-color: rgba(var(--bs-primary-rgb), 0.2);
      border-color: rgba(var(--bs-primary-rgb), 0.3);
    }

    /* Animation */
    @keyframes slideDown {
      from {
        max-height: 0;
        opacity: 0;
      }
      to {
        max-height: 200px;
        opacity: 1;
      }
    }

    /* RTL Adjustments */
    :host-context(.rtl) {
      .route-swap {
        transform: scaleX(-1);
      }

      .action-buttons {
        .ms-2 {
          margin-left: 0 !important;
          margin-right: 0.5rem !important;
        }
      }
    }
  `],
  animations: [
    // You would need to import animations from @angular/animations
    // This is a placeholder for the slideDown animation
  ]
})
export class ModifySearchComponent implements OnInit {
  @Input() searchCriteria: FlightSearchCriteria | null = null;
  @Input() compactMode = false;
  @Input() showSummary = true;
  @Input() autoExpand = false;

  @Output() searchModified = new EventEmitter<FlightSearchCriteria>();
  @Output() searchStarted = new EventEmitter<void>();

  searchForm: FormGroup;
  expandedMode = false;
  isEditing = false;
  isSearching = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    public languageService: LanguageService
  ) {
    this.searchForm = this.createForm();
  }

  ngOnInit(): void {
    if (this.searchCriteria) {
      this.populateForm(this.searchCriteria);
    }

    if (this.autoExpand) {
      this.expandedMode = true;
    }

    // Watch for trip type changes
    this.searchForm.get('tripType')?.valueChanges.subscribe(tripType => {
      const returnDateControl = this.searchForm.get('returnDate');
      if (tripType === 'roundTrip') {
        returnDateControl?.setValidators(Validators.required);
      } else {
        returnDateControl?.clearValidators();
      }
      returnDateControl?.updateValueAndValidity();
    });
  }

  createForm(): FormGroup {
    return this.fb.group({
      fromAirport: ['', Validators.required],
      toAirport: ['', Validators.required],
      departureDate: [this.getTomorrowDate(), Validators.required],
      returnDate: [''],
      passengers: [1, [Validators.required, Validators.min(1), Validators.max(9)]],
      tripType: ['roundTrip'],
      cabinClass: ['economy'],
      flexibleDates: [false],
      directOnly: [false]
    });
  }

  populateForm(criteria: FlightSearchCriteria): void {
    this.searchForm.patchValue({
      fromAirport: criteria.fromAirport,
      toAirport: criteria.toAirport,
      departureDate: criteria.departureDate,
      returnDate: criteria.returnDate || '',
      passengers: criteria.passengers,
      tripType: criteria.tripType,
      cabinClass: criteria.cabinClass || 'economy'
    });
  }

  onModifySearch(): void {
    if (this.searchForm.valid) {
      this.isSearching = true;
      this.searchStarted.emit();

      const formValue = this.searchForm.value;
      const searchCriteria: FlightSearchCriteria = {
        fromAirport: formValue.fromAirport,
        toAirport: formValue.toAirport,
        departureDate: formValue.departureDate,
        returnDate: formValue.tripType === 'roundTrip' ? formValue.returnDate : undefined,
        passengers: formValue.passengers,
        tripType: formValue.tripType,
        cabinClass: formValue.cabinClass
      };

      // Emit the modified search criteria
      this.searchModified.emit(searchCriteria);

      // Navigate to results page
      setTimeout(() => {
        this.isSearching = false;
        this.isEditing = false;

        this.router.navigate(['/flights/results'], {
          queryParams: searchCriteria
        });
      }, 1000);
    }
  }

  swapRoutes(): void {
    const fromValue = this.searchForm.get('fromAirport')?.value;
    const toValue = this.searchForm.get('toAirport')?.value;

    this.searchForm.patchValue({
      fromAirport: toValue,
      toAirport: fromValue
    });
  }

  toggleExpandedMode(): void {
    this.expandedMode = !this.expandedMode;
  }

  startEditing(): void {
    this.isEditing = true;
  }

  getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  getTomorrowDate(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }

  formatDateSummary(): string {
    if (!this.searchCriteria) return '';

    const departureDate = new Date(this.searchCriteria.departureDate).toLocaleDateString();

    if (this.searchCriteria.tripType === 'roundTrip' && this.searchCriteria.returnDate) {
      const returnDate = new Date(this.searchCriteria.returnDate).toLocaleDateString();
      return `${departureDate} - ${returnDate}`;
    }

    return departureDate;
  }
}
