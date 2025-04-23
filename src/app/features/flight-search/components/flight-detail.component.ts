import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FlightService } from '../../../_core/services/flight.service';
import { LanguageService } from '../../../_core/services/language.service';
import { Flight } from '../../../_core/models/flight.model';

@Component({
  selector: 'app-flight-detail',
  standalone: false,
  templateUrl: 'flight-detail.component.html',
  styles: [`
    .airline-logo {
      width: 60px;
      height: 60px;
      object-fit: contain;
    }
    
    .flight-number {
      font-size: 0.875rem;
    }
    
    .flight-route {
      margin: 1rem 0;
    }
    
    .path-line {
      position: relative;
      height: 2px;
      background-color: #e0e0e0;
      width: 100%;
      margin: 0.5rem 0;
    }
    
    .path-dot {
      position: absolute;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background-color: var(--bs-primary);
      top: -4px;
      
      &.start {
        left: 0;
      }
      
      &.end {
        right: 0;
      }
    }
    
    .timeline {
      position: relative;
      margin: 1rem 0;
      padding-left: 2rem;
      
      &::before {
        content: '';
        position: absolute;
        top: 0;
        bottom: 0;
        left: 9px; /* Center line relative to points */
        width: 2px;
        background-color: #e0e0e0;
      }
      
      :host-context(.rtl) & {
        padding-left: 0;
        padding-right: 2rem;
        
        &::before {
          left: auto;
          right: 9px;
        }
      }
    }
    
    .timeline-item {
      position: relative;
      margin-bottom: 2rem;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
    
    .timeline-point {
      position: absolute;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background-color: var(--bs-primary);
      left: -2rem;
      top: 0.5rem;
      
      :host-context(.rtl) & {
        left: auto;
        right: -2rem;
      }
    }
    
    .timeline-content {
      background-color: #f8f9fa;
      padding: 1rem;
      border-radius: 0.5rem;
      
      :host-context(.dark-mode) & {
        background-color: #2a2a2a;
      }
    }
    
    .baggage-item {
      height: 100%;
      transition: transform 0.2s;
      
      &:hover {
        transform: translateY(-5px);
      }
      
      i {
        color: var(--bs-primary);
      }
    }
    
    :host-context(.rtl) {
      .me-2 {
        margin-right: 0 !important;
        margin-left: 0.5rem !important;
      }
      
      .bi-arrow-left:before {
        content: "\\f138"; /* Bootstrap icon for right arrow */
      }
    }
    
    @media (max-width: 768px) {
      .flight-route {
        margin: 2rem 0;
      }
      
      .airport-info {
        font-size: 0.9rem;
      }
      
      .timeline {
        padding-left: 1.5rem;
        
        :host-context(.rtl) & {
          padding-left: 0;
          padding-right: 1.5rem;
        }
      }
      
      .timeline-point {
        left: -1.5rem;
        
        :host-context(.rtl) & {
          left: auto;
          right: -1.5rem;
        }
      }
    }
  `]
})
export class FlightDetailComponent implements OnInit {
  flight: Flight | undefined;
  isLoading = true;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private flightService: FlightService,
    public languageService: LanguageService
  ) {}
  
  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const flightId = params.get('id');
      if (flightId) {
        this.loadFlightDetails(flightId);
      } else {
        this.router.navigate(['/flights']);
      }
    });
  }
  
  loadFlightDetails(id: string): void {
    this.isLoading = true;
    
    this.flightService.getFlightById(id).subscribe({
      next: (flight) => {
        this.flight = flight;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading flight details:', error);
        this.isLoading = false;
      }
    });
  }
  
  goBack(): void {
    this.router.navigate(['/flights/results']);
  }
}