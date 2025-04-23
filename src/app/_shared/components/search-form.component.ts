import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LanguageService } from '../../_core/services/language.service';

@Component({
  selector: 'app-search-form',
  standalone: false,
  template: `
    <div class="search-panel" [appRtlSupport]="(languageService.currentLanguage$ | async)?.direction!">
      <h2 class="mb-4">{{ 'FLIGHT_SEARCH.TITLE' | translate }}</h2>

      <form [formGroup]="searchForm" (ngSubmit)="searchFlights()">
        <!-- Trip Type Selection with proper RTL support -->
        <div class="trip-type-selector mb-4">
          <div class="btn-group" role="group" aria-label="Trip Type">
            <input type="radio" class="btn-check" formControlName="tripType" id="oneWay" value="oneWay" autocomplete="off">
            <label class="btn btn-outline-primary" for="oneWay">{{ 'FLIGHT_SEARCH.ONE_WAY' | translate }}</label>

            <input type="radio" class="btn-check" formControlName="tripType" id="roundTrip" value="roundTrip" autocomplete="off">
            <label class="btn btn-outline-primary" for="roundTrip">{{ 'FLIGHT_SEARCH.ROUND_TRIP' | translate }}</label>
          </div>
        </div>

        <div class="row g-3">
          <!-- From Airport -->
          <div class="col-md-6">
            <label for="fromAirport" class="form-label">{{ 'FLIGHT_SEARCH.FROM' | translate }}</label>
            <div class="input-group">
              <span class="input-group-text"><i class="bi bi-geo-alt"></i></span>
              <input type="text" class="form-control" id="fromAirport" formControlName="fromAirport"
                     placeholder="City or Airport">
            </div>
            <div *ngIf="formSubmitted && f['fromAirport'].errors" class="text-danger mt-1">
              <div *ngIf="f['fromAirport'].errors['required']">{{ 'FLIGHT_SEARCH.FROM_REQUIRED' | translate }}</div>
            </div>
          </div>

          <!-- To Airport -->
          <div class="col-md-6">
            <label for="toAirport" class="form-label">{{ 'FLIGHT_SEARCH.TO' | translate }}</label>
            <div class="input-group">
              <span class="input-group-text"><i class="bi bi-geo-alt-fill"></i></span>
              <input type="text" class="form-control" id="toAirport" formControlName="toAirport"
                     placeholder="City or Airport">
            </div>
            <div *ngIf="formSubmitted && f['toAirport'].errors" class="text-danger mt-1">
              <div *ngIf="f['toAirport'].errors['required']">{{ 'FLIGHT_SEARCH.TO_REQUIRED' | translate }}</div>
            </div>
          </div>

          <!-- Departure Date -->
          <div class="col-md-6">
            <label for="departureDate" class="form-label">{{ 'FLIGHT_SEARCH.DEPARTURE_DATE' | translate }}</label>
            <div class="input-group">
              <input type="date" class="form-control" id="departureDate" formControlName="departureDate">
              <span class="input-group-text"><i class="bi bi-calendar"></i></span>
            </div>
            <div *ngIf="formSubmitted && f['departureDate'].errors" class="text-danger mt-1">
              <div *ngIf="f['departureDate'].errors['required']">{{ 'FLIGHT_SEARCH.DATE_REQUIRED' | translate }}</div>
            </div>
          </div>

          <!-- Return Date (conditionally shown) -->
          <div class="col-md-6" *ngIf="searchForm.get('tripType')?.value === 'roundTrip'">
            <label for="returnDate" class="form-label">{{ 'FLIGHT_SEARCH.RETURN_DATE' | translate }}</label>
            <div class="input-group">
              <input type="date" class="form-control" id="returnDate" formControlName="returnDate">
              <span class="input-group-text"><i class="bi bi-calendar"></i></span>
            </div>
            <div *ngIf="formSubmitted && f['returnDate'].errors" class="text-danger mt-1">
              <div *ngIf="f['returnDate'].errors['required']">{{ 'FLIGHT_SEARCH.RETURN_DATE_REQUIRED' | translate }}</div>
            </div>
          </div>

          <!-- Passengers -->
          <div class="col-md-6" [ngClass]="{'col-md-12': searchForm.get('tripType')?.value === 'oneWay'}">
            <label for="passengers" class="form-label">{{ 'FLIGHT_SEARCH.PASSENGERS' | translate }}</label>
            <div class="input-group">
              <span class="input-group-text"><i class="bi bi-people"></i></span>
              <select class="form-select" id="passengers" formControlName="passengers">
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Search Button with loading state -->
        <div class="mt-4">
          <button type="submit" class="btn btn-primary btn-lg w-100"
                  [disabled]="isSearching">
            <ng-container *ngIf="!isSearching">
              <i class="bi bi-search flip-rtl me-2"></i>
              {{ 'FLIGHT_SEARCH.SEARCH_BUTTON' | translate }}
            </ng-container>
            <ng-container *ngIf="isSearching">
              <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              {{ 'FLIGHT_SEARCH.SEARCHING' | translate }}
            </ng-container>
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .search-panel {
      background-color: white;
      border-radius: 10px;
      padding: 2rem;
      box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;

      :host-context(.dark-mode) & {
        background-color: #2a2a2a;
        box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
      }
    }

    .btn-check:checked + .btn-outline-primary {
      background-color: var(--bs-primary);
      color: white;
    }

    /* Input group styling fixed for RTL/LTR consistency */
    .input-group {
      .input-group-text {
        background-color: var(--bs-primary);
        color: white;
        border-color: var(--bs-primary);
      }

      .form-control, .form-select {
        border-color: #ced4da;

        &:focus {
          border-color: var(--bs-primary);
        }
      }
    }

    /* Ensure consistent button sizing */
    .btn {
      line-height: 1.5;
    }

    /* Both LTR and RTL form controls have the same height */
    :host-context(.rtl) .form-control,
    :host-context(.ltr) .form-control {
      height: calc(1.5em + 0.75rem + 2px);
      line-height: 1.5;
    }

    @media (max-width: 768px) {
      .search-panel {
        padding: 1.5rem;
      }
    }
  `]
})
export class SearchFormComponent implements OnInit {
  searchForm: FormGroup;
  formSubmitted = false;
  isSearching = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    public languageService: LanguageService
  ) {
    this.searchForm = this.fb.group({
      tripType: ['roundTrip', Validators.required],
      fromAirport: ['', Validators.required],
      toAirport: ['', Validators.required],
      departureDate: [this.getTomorrowDate(), Validators.required],
      returnDate: [this.getReturnDate(7)], // 7 days after departure by default
      passengers: ['1', Validators.required]
    });
  }

  ngOnInit(): void {
    // Update validators based on trip type
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

  // Getter for easy access to form fields
  get f() {
    return this.searchForm.controls;
  }

  getTomorrowDate(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return this.formatDate(tomorrow);
  }

  getReturnDate(daysAfter: number): string {
    const returnDate = new Date();
    returnDate.setDate(returnDate.getDate() + daysAfter);
    return this.formatDate(returnDate);
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  searchFlights(): void {
    this.formSubmitted = true;

    if (this.searchForm.valid) {
      this.isSearching = true;

      // Simulate API delay
      setTimeout(() => {
        this.isSearching = false;

        // Navigate to results page with search params
        this.router.navigate(['/flights/results'], {
          queryParams: this.searchForm.value
        });
      }, 1500);
    }
  }
}
