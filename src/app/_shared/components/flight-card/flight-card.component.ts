import { Component, Input, OnInit } from '@angular/core';
import { Flight } from '../../../_core/models/flight.model';

@Component({
  selector: 'app-flight-card',
  standalone: false,
  templateUrl: 'flight-card.component.html',
  styles: [`
    .flight-card {
      transition: transform 0.2s, box-shadow 0.2s;
      
      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
      }
    }
    
    .airline-logo {
      width: 40px;
      height: 40px;
      object-fit: contain;
    }
    
    .airline-name {
      font-weight: 500;
    }
    
    .flight-number {
      font-size: 0.8rem;
    }
    
    .time {
      font-weight: 700;
      font-size: 1.5rem;
    }
    
    .airport {
      font-weight: 500;
    }
    
    .path-line {
      width: 100%;
      height: 2px;
      background-color: #e0e0e0;
      margin: 10px 0;
      position: relative;
    }
    
    .path-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: var(--bs-primary);
      position: absolute;
      top: -3px;
      
      &.start {
        left: 0;
      }
      
      &.end {
        right: 0;
      }
    }
    
    .price {
      color: var(--bs-primary);
      font-weight: 700;
    }
    
    /* RTL specific adjustments */
    :host-context(.rtl) {
      .border-start {
        border-left: none !important;
        border-right: 1px solid #dee2e6 !important;
      }
      
      .path-line {
        direction: ltr; /* Keep the path line direction consistent */
      }
    }
  `]
})
export class FlightCardComponent implements OnInit {
  @Input() flight!: Flight;
  
  constructor() {}
  
  ngOnInit(): void {}
}